import { afterAll, beforeEach, describe, expect, it } from "vitest";
import AttendanceLog from "../models/AttendanceLog.js";
import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import MembershipPlan from "../models/MembershipPlan.js";
import TransactionHistory from "../models/TransactionHistory.js";
import {
  DAY,
  adminCreds,
  api,
  bearer,
  closeDb,
  createAdmin,
  createMember,
  createMembership,
  createPlan,
  daysFromNow,
  ddmmyyyy,
  resetDb,
  signIn,
} from "./helpers.js";

let auth;

beforeEach(async () => {
  await resetDb();
  await createAdmin();
  auth = bearer(await signIn("admin", adminCreds));
});
afterAll(closeDb);

const planBody = {
  membership_name: "Gold",
  plan_type: "Daily",
  fee: 1500,
  duration_days: 30,
  description: "Everything",
  status: "Active",
};

describe("membership plans", () => {
  it("creates a plan and ignores fields outside the allowlist", async () => {
    const res = await api()
      .post("/admin/membership_plan")
      .set(auth)
      .send({ ...planBody, id: "00000000-0000-4000-8000-000000000000" });
    expect(res.status).toBe(201);

    const plans = await MembershipPlan.findAll();
    expect(plans).toHaveLength(1);
    expect(plans[0].id).not.toBe("00000000-0000-4000-8000-000000000000");
  });

  it("validates required fields, numbers and the ticket rule", async () => {
    const { duration_days: _drop, ...noDuration } = planBody;
    expect(
      (await api().post("/admin/membership_plan").set(auth).send(noDuration)).status,
    ).toBe(400);

    const negative = await api()
      .post("/admin/membership_plan")
      .set(auth)
      .send({ ...planBody, fee: -5 });
    expect(negative.status).toBe(400);

    // Regression: the ticket_amount check was unreachable before.
    const ticket = await api()
      .post("/admin/membership_plan")
      .set(auth)
      .send({ ...planBody, plan_type: "Ticket" });
    expect(ticket.status).toBe(400);
    expect(ticket.body.error).toBe("ticket_amount is missing");

    const ok = await api()
      .post("/admin/membership_plan")
      .set(auth)
      .send({ ...planBody, plan_type: "Ticket", ticket_amount: 12 });
    expect(ok.status).toBe(201);
  });

  it("updates allowed fields, including falsy values, and 404s unknown ids", async () => {
    const plan = await createPlan({ description: "old" });
    const res = await api()
      .put(`/admin/membership_plan/${plan.id}`)
      .set(auth)
      .send({ fee: 0, description: "", id: "ignored", createdAt: "2000-01-01" });
    expect(res.status).toBe(200);

    await plan.reload();
    expect(plan.fee).toBe(0);
    expect(plan.description).toBe("");
    expect(plan.createdAt.getFullYear()).toBeGreaterThan(2000);

    const missing = await api()
      .put("/admin/membership_plan/00000000-0000-4000-8000-000000000000")
      .set(auth)
      .send({ fee: 1 });
    expect(missing.status).toBe(404);
  });

  it("refuses to delete a plan people bought (the FK would cascade) but deletes unused ones", async () => {
    const used = await createPlan({ membership_name: "Used" });
    const unused = await createPlan({ membership_name: "Unused" });
    const member = await createMember();
    await createMembership(member, used);

    const blocked = await api().delete(`/admin/membership_plan/${used.id}`).set(auth);
    expect(blocked.status).toBe(409);
    expect(await Membership.count()).toBe(1);

    const deleted = await api().delete(`/admin/membership_plan/${unused.id}`).set(auth);
    expect(deleted.status).toBe(200);
    expect(await MembershipPlan.count()).toBe(1);

    expect((await api().delete("/admin/membership_plan/not-a-uuid").set(auth)).status).toBe(400);
  });
});

describe("POST /admin/transaction", () => {
  const payment = (extra) => ({
    payment_method: "Cash",
    amount: 1000,
    payment_for: "Monthly",
    paid_at: ddmmyyyy(new Date()),
    ...extra,
  });

  it("starts a membership from the plan, not from client-supplied numbers", async () => {
    const member = await createMember();
    const plan = await createPlan({ duration_days: 30 });
    const paidAt = new Date();

    const res = await api()
      .post("/admin/transaction")
      .set(auth)
      .send(
        payment({
          payer_id: member.id,
          membershipPlan_id: plan.id,
          isNew: true,
          duration_days: 9999, // must be ignored
          ticket_amount: 999, // must be ignored
        }),
      );
    expect(res.status).toBe(201);

    const membership = await Membership.findOne({ where: { member_id: member.id } });
    const days = (new Date(membership.end_date) - new Date(membership.start_date)) / DAY;
    expect(Math.round(days)).toBe(30);
    expect(membership.ticket).toBeNull();
    expect(membership.status).toBe("Active");
    expect(new Date(membership.start_date).getDate()).toBe(paidAt.getDate());

    const tx = await TransactionHistory.findOne();
    expect(tx.status).toBe("Successfull");
    expect(tx.payment_method).toBe("Cash-Test Admin");
    expect(tx.amount).toBe(1000);

    await member.reload();
    expect(member.activity_status).toBe("Active");
  });

  it("retires the previous live membership when a new one starts", async () => {
    const member = await createMember();
    const plan = await createPlan();
    const old = await createMembership(member, plan);

    await api()
      .post("/admin/transaction")
      .set(auth)
      .send(payment({ payer_id: member.id, membershipPlan_id: plan.id, isNew: true }))
      .expect(201);

    await old.reload();
    expect(old.status).toBe("Inactive");
    expect(await Membership.count({ where: { status: "Active" } })).toBe(1);
  });

  it("renews from the later of the current end date and the payment date", async () => {
    const member = await createMember();
    const plan = await createPlan({ duration_days: 30 });
    const membership = await createMembership(member, plan, {
      end_date: daysFromNow(10).toISOString(),
    });

    await api()
      .post("/admin/transaction")
      .set(auth)
      .send(
        payment({
          payer_id: member.id,
          membershipPlan_id: plan.id,
          membership_id: membership.id,
        }),
      )
      .expect(201);

    await membership.reload();
    const remaining = (new Date(membership.end_date) - Date.now()) / DAY;
    expect(remaining).toBeGreaterThan(39); // 10 days left + 30 bought
    expect(remaining).toBeLessThan(41);
  });

  it("adds tickets on renewal of a ticket plan", async () => {
    const member = await createMember();
    const plan = await createPlan({ plan_type: "Ticket", ticket_amount: 10, duration_days: 60 });
    const membership = await createMembership(member, plan, { ticket: 4 });

    await api()
      .post("/admin/transaction")
      .set(auth)
      .send(
        payment({
          payer_id: member.id,
          membershipPlan_id: plan.id,
          membership_id: membership.id,
        }),
      )
      .expect(201);

    await membership.reload();
    expect(membership.ticket).toBe(14);
  });

  it("rolls everything back when the renewal target does not exist", async () => {
    const member = await createMember({ activity_status: "Inactive" });
    const plan = await createPlan();

    const res = await api()
      .post("/admin/transaction")
      .set(auth)
      .send(
        payment({
          payer_id: member.id,
          membershipPlan_id: plan.id,
          membership_id: "00000000-0000-4000-8000-000000000000",
        }),
      );
    expect(res.status).toBe(404);
    expect(await TransactionHistory.count()).toBe(0);
    await member.reload();
    expect(member.activity_status).toBe("Inactive");
  });

  it("will not renew a membership that belongs to a different member", async () => {
    const owner = await createMember();
    const other = await createMember({ phone_number: "0911000002" });
    const plan = await createPlan();
    const membership = await createMembership(owner, plan);

    const res = await api()
      .post("/admin/transaction")
      .set(auth)
      .send(
        payment({
          payer_id: other.id,
          membershipPlan_id: plan.id,
          membership_id: membership.id,
        }),
      );
    expect(res.status).toBe(404);
  });

  it("validates dates, amounts and ids", async () => {
    const member = await createMember();
    const plan = await createPlan();
    const base = payment({ payer_id: member.id, membershipPlan_id: plan.id, isNew: true });

    const badDate = await api().post("/admin/transaction").set(auth).send({ ...base, paid_at: "2026/01/01" });
    expect(badDate.status).toBe(400);
    const fakeDate = await api().post("/admin/transaction").set(auth).send({ ...base, paid_at: "31-02-2026" });
    expect(fakeDate.status).toBe(400);
    const badAmount = await api().post("/admin/transaction").set(auth).send({ ...base, amount: "lots" });
    expect(badAmount.status).toBe(400);
    const noPayer = await api().post("/admin/transaction").set(auth).send({ ...base, payer_id: 99999 });
    expect(noPayer.status).toBe(400);
    expect(await TransactionHistory.count()).toBe(0);
  });
});

describe("POST /admin/memberAttendance/:memberId", () => {
  it("records a check-in and rejects a second one the same day", async () => {
    const member = await createMember();
    await createMembership(member, await createPlan());

    const first = await api().post(`/admin/memberAttendance/${Number(member.id)}`).set(auth);
    expect(first.status).toBe(200);
    expect(first.body.attendance[1].full_name).toBe("Test Member");

    const again = await api().post(`/admin/memberAttendance/${Number(member.id)}`).set(auth);
    expect(again.status).toBe(400);
    expect(again.body.error).toBe("already attended today");
    expect(await AttendanceLog.count()).toBe(1);
  });

  it("records nothing when the member has no live membership", async () => {
    const member = await createMember();
    const plan = await createPlan();
    await createMembership(member, plan, { status: "Inactive" });

    const res = await api().post(`/admin/memberAttendance/${Number(member.id)}`).set(auth);
    expect(res.status).toBe(404);
    expect(await AttendanceLog.count()).toBe(0);
  });

  // Regression: membershipCalculate was not awaited, so daysLeft/remainingTicket
  // were undefined and a member's status was never updated at check-in.
  it("keeps a healthy membership Active", async () => {
    const member = await createMember({ activity_status: "Active" });
    await createMembership(member, await createPlan());

    await api().post(`/admin/memberAttendance/${Number(member.id)}`).set(auth).expect(200);
    await member.reload();
    expect(member.activity_status).toBe("Active");
  });

  it("flags Payment Due when fewer than 5 days remain", async () => {
    const member = await createMember({ activity_status: "Active" });
    const membership = await createMembership(member, await createPlan(), {
      end_date: daysFromNow(2).toISOString(),
    });

    await api().post(`/admin/memberAttendance/${Number(member.id)}`).set(auth).expect(200);
    await member.reload();
    await membership.reload();
    expect(member.activity_status).toBe("Payment Due");
    expect(membership.status).toBe("Payment Due");
  });

  it("marks an expired membership Inactive", async () => {
    const member = await createMember({ activity_status: "Active" });
    const membership = await createMembership(member, await createPlan(), {
      end_date: daysFromNow(-3).toISOString(),
    });

    await api().post(`/admin/memberAttendance/${Number(member.id)}`).set(auth).expect(200);
    await membership.reload();
    expect(membership.status).toBe("Inactive");
  });

  it("counts the check-in itself against a ticket plan", async () => {
    const plan = await createPlan({ plan_type: "Ticket", ticket_amount: 10 });
    const member = await createMember({ activity_status: "Active" });
    const plenty = await createMembership(member, plan, { ticket: 10 });
    await api().post(`/admin/memberAttendance/${Number(member.id)}`).set(auth).expect(200);
    await plenty.reload();
    expect(plenty.status).toBe("Active"); // 9 left

    await AttendanceLog.destroy({ where: {} });
    await plenty.update({ ticket: 3, status: "Active" });
    await api().post(`/admin/memberAttendance/${Number(member.id)}`).set(auth).expect(200);
    await plenty.reload();
    expect(plenty.status).toBe("Payment Due"); // 2 left
  });

  it("rejects malformed and unknown member ids", async () => {
    expect((await api().post("/admin/memberAttendance/abc").set(auth)).status).toBe(400);
    expect((await api().post("/admin/memberAttendance/99999").set(auth)).status).toBe(404);
  });
});

describe("attendance and member management", () => {
  it("counts check-ins from the last 24 hours, not 2.4", async () => {
    const member = await createMember();
    const membership = await createMembership(member, await createPlan());
    const log = (hoursAgo) =>
      AttendanceLog.create({
        member_id: member.id,
        membership_id: membership.id,
        check_in: new Date().toISOString(),
        createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      });
    await log(5);
    await log(20);
    await log(30);

    const res = await api().get("/admin/attendanceLog/today").set(auth);
    expect(res.body.attendanceCount).toBe(2);
  });

  it("returns 404 (not a crash) when deleting or updating a missing member", async () => {
    expect((await api().delete("/admin/member/99999").set(auth)).status).toBe(404);
    expect((await api().delete("/admin/member/abc").set(auth)).status).toBe(400);
  });

  it("deletes a member and their dependent rows", async () => {
    const member = await createMember();
    await createMembership(member, await createPlan());
    await api().delete(`/admin/member/${Number(member.id)}`).set(auth).expect(200);
    expect(await Member.count()).toBe(0);
    expect(await Membership.count()).toBe(0);
  });

  it("lets an admin add a member with a chosen status, but not via public sign-up", async () => {
    const res = await api()
      .post("/admin/addMember")
      .set(auth)
      .field(
        "metadata",
        JSON.stringify({
          full_name: "Walk In",
          phone_number: "0944000001",
          gender: "male",
          height: 180,
          weight: 80,
          age: 22,
          password: "walk-in-1",
          language: "English",
          registration_Date: "2026-03-01",
          activity_status: "Active",
        }),
      );
    expect(res.status).toBe(201);
    const row = await Member.findOne({ where: { phone_number: "0944000001" } });
    expect(row.activity_status).toBe("Active");
  });

  it("requires authentication on every admin route", async () => {
    for (const [method, url] of [
      ["get", "/admin/members"],
      ["post", "/admin/transaction"],
      ["post", "/admin/memberAttendance/1"],
      ["delete", "/admin/member/1"],
      ["get", "/admin/workouts"],
      ["post", "/admin/programs"],
    ]) {
      const res = await api()[method](url);
      expect(res.status, `${method} ${url}`).toBe(401);
    }
  });
});
