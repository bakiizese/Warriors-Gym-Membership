import { afterAll, beforeEach, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import AttendanceLog from "../models/AttendanceLog.js";
import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import TransactionHistory from "../models/TransactionHistory.js";
import {
  DAY,
  api,
  bearer,
  closeDb,
  createMember,
  createMembership,
  createPlan,
  daysFromNow,
  memberCreds,
  resetDb,
  signIn,
} from "./helpers.js";

let member;
let auth;

beforeEach(async () => {
  await resetDb();
  member = await createMember();
  auth = bearer(await signIn("member", memberCreds));
});
afterAll(closeDb);

const profile = (metadata) =>
  api().put("/member/profile").set(auth).field("metadata", JSON.stringify(metadata));

describe("PUT /member/profile", () => {
  it("updates allowed fields and ignores protected ones", async () => {
    const res = await profile({
      full_name: "Renamed",
      weight: 72,
      activity_status: "Active",
      id: 4242,
      registration_Date: "1999-01-01",
    });
    expect(res.status).toBe(200);

    const row = await Member.findByPk(member.id);
    expect(row.full_name).toBe("Renamed");
    expect(row.weight).toBe(72);
    expect(row.activity_status).toBe("Inactive");
    expect(Number(row.id)).toBe(Number(member.id));
    expect(row.registration_Date).toBe("2026-01-01");
  });

  // Regression: `const hash_password = await hash_password(...)` shadowed the
  // import and threw a ReferenceError, so no member could ever change a password.
  it("changes the password when the old one is right", async () => {
    const res = await profile({ oldPassword: memberCreds.password, password: "brand-new-1" });
    expect(res.status).toBe(200);

    const oldLogin = await api().post("/auth/sign-in/member").send(memberCreds);
    expect(oldLogin.status).toBe(400);
    const newLogin = await api()
      .post("/auth/sign-in/member")
      .send({ phone_number: memberCreds.phone_number, password: "brand-new-1" });
    expect(newLogin.status).toBe(200);
  });

  it("rejects a wrong old password or a weak new one", async () => {
    const wrong = await profile({ oldPassword: "nope-nope", password: "brand-new-1" });
    expect(wrong.status).toBe(400);
    expect(wrong.body.error).toBe("incorrect oldPassword");

    const weak = await profile({ oldPassword: memberCreds.password, password: "abc" });
    expect(weak.status).toBe(400);

    const login = await api().post("/auth/sign-in/member").send(memberCreds);
    expect(login.status).toBe(200);
  });

  it("issues a working token when the phone number changes, without leaking the hash", async () => {
    const res = await profile({ phone_number: "0955000001" });
    expect(res.status).toBe(200);
    expect(res.body.user).not.toHaveProperty("password");
    expect(jwt.decode(res.body.token)).toMatchObject({ phone_number: "0955000001", role: "member" });

    // The old token embeds the old number, so it must stop working.
    expect((await api().get("/member/me").set(auth)).status).toBe(401);
    const me = await api().get("/member/me").set(bearer(res.body.token));
    expect(me.status).toBe(200);
  });

  it("refuses a phone number that is already taken, and bad numbers", async () => {
    await createMember({ phone_number: "0955000002" });
    expect((await profile({ phone_number: "0955000002" })).status).toBe(400);
    expect((await profile({ height: "tall" })).status).toBe(400);
  });

  it("returns 400 for a missing or broken metadata field", async () => {
    expect((await api().put("/member/profile").set(auth)).status).toBe(400);
    const broken = await api().put("/member/profile").set(auth).field("metadata", "{oops");
    expect(broken.status).toBe(400);
  });
});

describe("POST /member/membership/off", () => {
  it("buys a plan at the database price, whatever the client claims", async () => {
    const plan = await createPlan({ fee: 1200, duration_days: 30 });

    const res = await api()
      .post("/member/membership/off")
      .set(auth)
      .send({ isNew: true, id: plan.id, fee: 0, duration_days: 9999, ticket_amount: 999 });
    expect(res.status).toBe(200);
    expect(res.body.membership).toBe("new success");

    const tx = await TransactionHistory.findOne();
    expect(tx.amount).toBe(1200);
    expect(tx.status).toBe("Pending");

    const membership = await Membership.findOne({ where: { member_id: member.id } });
    const days = (new Date(membership.end_date) - new Date(membership.start_date)) / DAY;
    expect(Math.round(days)).toBe(30);
    expect(membership.ticket).toBeNull();

    await member.reload();
    expect(member.activity_status).toBe("Active");
  });

  it("only sells active plans and writes nothing on failure", async () => {
    const hidden = await createPlan({ status: "Inactive" });
    const res = await api()
      .post("/member/membership/off")
      .set(auth)
      .send({ isNew: true, id: hidden.id });
    expect(res.status).toBe(404);
    expect(await Membership.count()).toBe(0);
    expect(await TransactionHistory.count()).toBe(0);
  });

  it("renews the member's own membership and bills the plan fee", async () => {
    const plan = await createPlan({ fee: 800, duration_days: 30 });
    const membership = await createMembership(member, plan, {
      end_date: daysFromNow(5).toISOString(),
    });

    const res = await api().post("/member/membership/off").set(auth).send({ id: membership.id });
    expect(res.status).toBe(200);
    expect(res.body.membership).toBe("renew success");

    await membership.reload();
    const remaining = (new Date(membership.end_date) - Date.now()) / DAY;
    expect(remaining).toBeGreaterThan(34);
    expect(remaining).toBeLessThan(36);
    expect((await TransactionHistory.findOne()).amount).toBe(800);
  });
});

describe("membership ownership", () => {
  let strangers;

  beforeEach(async () => {
    const other = await createMember({ phone_number: "0966000001", activity_status: "Active" });
    strangers = await createMembership(other, await createPlan());
  });

  it("cannot renew someone else's membership", async () => {
    const before = strangers.end_date;
    for (const [method, url, body] of [
      ["put", "/member/membershipRenew", { membership_id: strangers.id }],
      ["post", "/member/membership/off", { id: strangers.id }],
    ]) {
      const res = await api()[method](url).set(auth).send(body);
      expect(res.status, `${method} ${url}`).toBe(404);
    }
    await strangers.reload();
    expect(strangers.end_date).toBe(before);
  });

  it("cannot cancel someone else's membership", async () => {
    const res = await api().put("/member/membershipCancel").set(auth).send({ id: strangers.id });
    expect(res.status).toBe(404);
    await strangers.reload();
    expect(strangers.status).toBe("Active");
  });

  it("cancels their own membership", async () => {
    const own = await createMembership(member, await createPlan());
    const res = await api().put("/member/membershipCancel").set(auth).send({ id: own.id });
    expect(res.status).toBe(200);
    await own.reload();
    await member.reload();
    expect(own.status).toBe("Cancled");
    expect(member.activity_status).toBe("Inactive");
  });

  it("rejects malformed ids with 400", async () => {
    const res = await api().put("/member/membershipCancel").set(auth).send({ id: "nope" });
    expect(res.status).toBe(400);
  });
});

describe("member reads", () => {
  it("returns the live membership with days left and remaining tickets", async () => {
    const plan = await createPlan({ plan_type: "Ticket", ticket_amount: 10, duration_days: 30 });
    const membership = await createMembership(member, plan, {
      end_date: daysFromNow(10).toISOString(),
      ticket: 10,
    });
    await AttendanceLog.create({
      member_id: member.id,
      membership_id: membership.id,
      check_in: new Date().toISOString(),
    });

    const res = await api().get("/member/membership").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.membership.remainingTicket).toBe(9);
    expect(res.body.membership.daysLeft).toBeGreaterThanOrEqual(9);
    expect(res.body.membership.daysLeft).toBeLessThanOrEqual(10);
  });

  it("404s when there is no live membership", async () => {
    expect((await api().get("/member/membership").set(auth)).status).toBe(404);
  });

  it("lists only their own transactions, newest first", async () => {
    const plan = await createPlan();
    const other = await createMember({ phone_number: "0966000002" });
    const tx = (payer, amount, createdAt) =>
      TransactionHistory.create({
        payer_id: payer.id,
        membershipPlan_id: plan.id,
        payment_method: "Cash",
        amount,
        payment_for: "Monthly",
        paid_at: new Date().toISOString(),
        status: "Successfull",
        createdAt,
      });
    await tx(member, 1, new Date(Date.now() - 2 * DAY));
    await tx(member, 2, new Date());
    await tx(other, 3, new Date());

    const res = await api().get("/member/transactions").set(auth);
    expect(res.body.transactions.map((t) => t.amount)).toEqual([2, 1]);
  });

  it("returns the newest 20 check-ins oldest-first", async () => {
    const membership = await createMembership(member, await createPlan());
    for (let i = 0; i < 25; i++) {
      await AttendanceLog.create({
        member_id: member.id,
        membership_id: membership.id,
        check_in: new Date(Date.now() - (25 - i) * DAY).toISOString(),
        createdAt: new Date(Date.now() - (25 - i) * DAY),
      });
    }
    const res = await api().get("/member/attendanceLog").set(auth);
    const times = res.body.attendanceLog.map((l) => new Date(l.check_in).getTime());
    expect(times).toHaveLength(20);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    // the oldest 5 are the ones dropped
    expect(Math.min(...times)).toBeGreaterThan(Date.now() - 21 * DAY);
  });

  it("requires a member token everywhere", async () => {
    for (const url of ["/member/me", "/member/membership", "/member/transactions", "/member/workoutPlan"]) {
      const res = await api().get(url);
      expect(res.status, url).toBe(401);
    }
  });
});
