import request from "supertest";
import app from "../app.js";
import sequelize from "../config/database.js";
import Admin from "../models/Admin.js";
import Member from "../models/Member.js";
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

export async function signIn(userType, creds) {
  const res = await api().post(`/auth/sign-in/${userType}`).send(creds);
  if (res.status !== 200) {
    throw new Error(`sign-in failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
}

export const bearer = (token) => ({ Authorization: `Bearer ${token}` });
