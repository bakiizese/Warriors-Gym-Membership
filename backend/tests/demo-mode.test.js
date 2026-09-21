import fs from "fs";
import path from "path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// config/env.js reads the environment once at import, so switch demo mode on
// first and only then load the app.
let app;
let sequelize;
let Member;
let seedDemoData;
let uploadsRoot;

const RESET_TOKEN = "demo-reset-token-0123456789";
const admin = { phone_number: "0900000001", password: "demo1234" };
const member = { phone_number: "0911000001", password: "demo1234" };

const login = async (type, creds) =>
  (await request(app).post(`/auth/sign-in/${type}`).send(creds)).body.token;
const bearer = (token) => ({ Authorization: `Bearer ${token}` });
const profile = (token, metadata) =>
  request(app)
    .put(`/${token.type}/profile`)
    .set(bearer(token.value))
    .field("metadata", JSON.stringify(metadata));

beforeAll(async () => {
  vi.resetModules();
  vi.stubEnv("DEMO_MODE", "true");
  vi.stubEnv("DEMO_RESET_TOKEN", RESET_TOKEN);
  vi.stubEnv("ADMIN_INVITE_CODE", "");

  app = (await import("../app.js")).default;
  sequelize = (await import("../config/database.js")).default;
  Member = (await import("../models/Member.js")).default;
  seedDemoData = (await import("../services/seed.js")).seedDemoData;
  uploadsRoot = (await import("../services/files.js")).uploadsRoot;

  await seedDemoData({ reset: true });
});

afterAll(async () => {
  await sequelize.close();
  vi.unstubAllEnvs();
});

describe("demo mode", () => {
  it("announces itself on /health", async () => {
    const res = await request(app).get("/health");
    expect(res.body).toEqual({ status: "ok", db: "up", demo: true });
  });

  it("keeps the published logins working by refusing to change them", async () => {
    const adminToken = { type: "admin", value: await login("admin", admin) };

    const password = await profile(adminToken, { oldPassword: admin.password, password: "hacked-123" });
    expect(password.status).toBe(403);
    const phone = await profile(adminToken, { phone_number: "0999999999" });
    expect(phone.status).toBe(403);

    // ordinary profile edits are still allowed
    const rename = await profile(adminToken, { full_name: "Visitor Was Here" });
    expect(rename.status).toBe(200);

    expect(await login("admin", admin)).toEqual(expect.any(String));
  });

  it("locks the demo member's login too", async () => {
    const memberToken = { type: "member", value: await login("member", member) };
    const res = await profile(memberToken, { oldPassword: member.password, password: "hacked-123" });
    expect(res.status).toBe(403);
    expect(await login("member", member)).toEqual(expect.any(String));
  });

  it("protects the demo member account from deletion but not other members", async () => {
    const token = await login("admin", admin);
    const demo = await Member.findOne({ where: { phone_number: member.phone_number } });

    const blocked = await request(app).delete(`/admin/member/${Number(demo.id)}`).set(bearer(token));
    expect(blocked.status).toBe(403);
    expect(await Member.count()).toBe(12);

    const other = await Member.findOne({ where: { full_name: "Abel Tesfaye" } });
    const ok = await request(app).delete(`/admin/member/${Number(other.id)}`).set(bearer(token));
    expect(ok.status).toBe(200);
    expect(await Member.count()).toBe(11);
  });

  it("does not allow admin sign-up at all, even with an invite header", async () => {
    const res = await request(app)
      .post("/auth/sign-up/admin")
      .set("x-invite-code", "anything")
      .send({ full_name: "Sneaky", phone_number: "0977000001", password: "sneaky-pass", language: "English", admin_level: "admin" });
    expect(res.status).toBe(403);
  });
});

describe("POST /demo/reset", () => {
  it("rejects a missing or wrong token", async () => {
    expect((await request(app).post("/demo/reset")).status).toBe(403);
    const wrong = await request(app).post("/demo/reset").set("x-reset-token", "nope");
    expect(wrong.status).toBe(403);
  });

  it("restores the data and clears visitor uploads", async () => {
    // Left over from the deletion above; plus a file a visitor "uploaded".
    expect(await Member.count()).toBe(11);
    const imageDir = path.join(uploadsRoot, "images");
    fs.mkdirSync(imageDir, { recursive: true });
    const stray = path.join(imageDir, "visitor-upload.jpg");
    fs.writeFileSync(stray, "x");

    const res = await request(app).post("/demo/reset").set("x-reset-token", RESET_TOKEN);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ reset: true, seeded: true, members: 12 });
    expect(await Member.count()).toBe(12);
    expect(fs.existsSync(stray)).toBe(false);
  });
});
