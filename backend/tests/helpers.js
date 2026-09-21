import request from "supertest";
import app from "../app.js";
import sequelize from "../config/database.js";
import Admin from "../models/Admin.js";
import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import MembershipPlan from "../models/MembershipPlan.js";
import { hash_password } from "../utils/password.js";

export const api = () => request(app);

const APP_TABLES = [
  "admins",
  "members",
  "memberships",
  "membership-plans",
  "attendance-logs",
  "transaction-histories",
  "workout-plans",
  "videos",
  "images",
  "programs",
];

export async function resetDb() {
  const tables = APP_TABLES.map((t) => `"${t}"`).join(", ");
  await sequelize.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}

export const closeDb = () => sequelize.close();

export const adminCreds = { phone_number: "0900000001", password: "admin-pass-1" };
export const memberCreds = { phone_number: "0911000001", password: "member-pass-1" };

export async function createAdmin(overrides = {}) {
  return Admin.create({
    full_name: "Test Admin",
    phone_number: adminCreds.phone_number,
    admin_level: "admin",
    language: "English",
    ...overrides,
    password: await hash_password(overrides.password ?? adminCreds.password),
  });
}

export async function createMember(overrides = {}) {
  return Member.create({
    full_name: "Test Member",
    phone_number: memberCreds.phone_number,
    gender: "male",
    height: 175,
    weight: 70,
    age: 25,
    language: "English",
    registration_Date: "2026-01-01",
    ...overrides,
    password: await hash_password(overrides.password ?? memberCreds.password),
  });
}

export async function createPlan(overrides = {}) {
  return MembershipPlan.create({
    membership_name: "Monthly",
    plan_type: "Daily",
    duration_days: 30,
    fee: 1000,
    description: "Test plan",
    status: "Active",
    ...overrides,
  });
}

export async function createMembership(member, plan, overrides = {}) {
  const start = new Date();
  return Membership.create({
    member_id: member.id,
    membership_plan_id: plan.id,
    start_date: start.toISOString(),
    end_date: new Date(start.getTime() + plan.duration_days * DAY).toISOString(),
    ticket: plan.ticket_amount ?? null,
    status: "Active",
    ...overrides,
  });
}

export const DAY = 24 * 60 * 60 * 1000;
export const daysFromNow = (days) => new Date(Date.now() + days * DAY);

// The admin forms send DD-MM-YYYY.
export const ddmmyyyy = (date) =>
  [date.getDate(), date.getMonth() + 1, date.getFullYear()]
    .map((n) => String(n).padStart(2, "0"))
    .join("-");

export async function signIn(userType, creds) {
  const res = await api().post(`/auth/sign-in/${userType}`).send(creds);
  if (res.status !== 200) {
    throw new Error(`sign-in failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
}

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });
