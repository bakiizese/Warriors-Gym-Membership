import { afterAll, beforeAll, describe, expect, it } from "vitest";
import Admin from "../models/Admin.js";
import AttendanceLog from "../models/AttendanceLog.js";
import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import TransactionHistory from "../models/TransactionHistory.js";
import { demoAccounts } from "../config/demo.js";
import { seedDemoData } from "../services/seed.js";
import { api, bearer, closeDb, resetDb, signIn } from "./helpers.js";

beforeAll(async () => {
  await resetDb();
  await seedDemoData();
});
afterAll(closeDb);

const statusOf = async (name) =>
  (await Member.findOne({ where: { full_name: name } })).activity_status;

describe("seedDemoData", () => {
  it("creates a populated gym", async () => {
    expect(await Admin.count()).toBe(1);
    expect(await Member.count()).toBe(12);
    expect(await Membership.count()).toBe(11); // one member has never bought a plan
    expect(await AttendanceLog.count()).toBeGreaterThan(30);
    expect(await TransactionHistory.count()).toBe(12); // 11 memberships + the demo member's earlier cycle
  });

  it("covers every membership state, derived from the app's own rules", async () => {
    expect(await statusOf("Abel Tesfaye")).toBe("Active");
    expect(await statusOf("Selam Bekele")).toBe("Payment Due"); // 3 days left
    expect(await statusOf("Hana Girma")).toBe("Payment Due"); // ticket plan, 2 left
    expect(await statusOf("Yonas Kebede")).toBe("Active"); // ticket plan, 7 left
    expect(await statusOf("Marta Solomon")).toBe("Inactive"); // expired
    expect(await statusOf("Liya Mekonnen")).toBe("Inactive"); // no membership yet
  });

  it("publishes logins that actually work", async () => {
    const adminToken = await signIn("admin", {
      phone_number: demoAccounts.admin.phone,
      password: demoAccounts.admin.password,
    });
    const memberToken = await signIn("member", {
      phone_number: demoAccounts.member.phone,
      password: demoAccounts.member.password,
    });

    const members = await api().get("/admin/members").set(bearer(adminToken));
    expect(members.body.members).toHaveLength(12);
    expect(members.body.members[0]).not.toHaveProperty("password");

    const membership = await api().get("/member/membership").set(bearer(memberToken));
    expect(membership.status).toBe(200);
    expect(membership.body.membership.membershipPlan.membership_name).toBe("Monthly");
    expect(membership.body.membership.daysLeft).toBeGreaterThan(10);

    const tx = await api().get("/member/transactions").set(bearer(memberToken));
    expect(tx.body.transactions).toHaveLength(2);
  });

  it("gives the dashboard something to show", async () => {
    const token = await signIn("admin", {
      phone_number: demoAccounts.admin.phone,
      password: demoAccounts.admin.password,
    });
    const today = await api().get("/admin/attendanceLog/today").set(bearer(token));
    expect(today.body.attendanceCount).toBeGreaterThan(3);

    const status = await api().get("/admin/members_status").set(bearer(token));
    expect(status.body.members_status.activeMembers).toBeGreaterThan(3);
    expect(status.body.members_status.paymentDueMembers).toBeGreaterThan(1);
  });

  it("lets a visitor try a check-in on the demo member", async () => {
    const token = await signIn("admin", {
      phone_number: demoAccounts.admin.phone,
      password: demoAccounts.admin.password,
    });
    const demo = await Member.findOne({ where: { phone_number: demoAccounts.member.phone } });
    const res = await api()
      .post(`/admin/memberAttendance/${Number(demo.id)}`)
      .set(bearer(token));
    expect(res.status).toBe(200);
  });

  it("serves the sample workout videos it references", async () => {
    const token = await signIn("member", {
      phone_number: demoAccounts.member.phone,
      password: demoAccounts.member.password,
    });
    const res = await api().get("/member/workoutPlan").set(bearer(token));
    expect(res.body.length).toBe(6);
    const chest = res.body.workoutPlan.Chest[0];
    expect(chest.video.path).toBe("seed-assets/videos/chest-cable-fly.mp4");
    expect(chest.video.size).toBeGreaterThan(0);

    const file = await api().get(`/${chest.video.path}`);
    expect(file.status).toBe(200);
    expect(file.headers["content-type"]).toMatch(/video\/mp4/);
  });

  it("is idempotent: seeding again changes nothing", async () => {
    const again = await seedDemoData();
    expect(again).toEqual({ seeded: false });
    expect(await Member.count()).toBe(12);
  });

  it("reset wipes edits and restores the original data", async () => {
    await Member.destroy({ where: {} });
    await Admin.destroy({ where: {} });

    const result = await seedDemoData({ reset: true });
    expect(result).toMatchObject({ seeded: true, members: 12, plans: 4, workouts: 6 });
    expect(await Member.count()).toBe(12);
    expect(await Admin.count()).toBe(1);
    // identity restarts, so the demo member is always member 00001
    const demo = await Member.findOne({ where: { phone_number: demoAccounts.member.phone } });
    expect(demo.id).toBe("00001");
  });
});
