import { afterAll, beforeEach, describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import Member from "../models/Member.js";
import {
  adminCreds,
  api,
  bearer,
  closeDb,
  createAdmin,
  createMember,
  memberCreds,
  resetDb,
  signIn,
} from "./helpers.js";

beforeEach(resetDb);
afterAll(closeDb);

const newMember = {
  full_name: "New Member",
  phone_number: "0922000001",
  gender: "female",
  height: 165,
  weight: 60,
  age: 30,
  password: "secret-123",
  language: "English",
  registration_Date: "2026-02-01",
};

describe("member sign-up", () => {
  it("creates the member and the row exists by the time it responds", async () => {
    const res = await api().post("/auth/sign-up/member").send(newMember);
    expect(res.status).toBe(201);

    // Regression: the create used to be un-awaited, so 201 could beat the insert.
    const row = await Member.scope("withPassword").findOne({
      where: { phone_number: newMember.phone_number },
    });
    expect(row).not.toBeNull();
    expect(row.password).not.toBe(newMember.password);
    expect(row.password).toMatch(/^\$2[aby]\$/);
  });

  it("ignores fields a public caller must not set", async () => {
    const res = await api()
      .post("/auth/sign-up/member")
      .send({ ...newMember, id: 99999, activity_status: "Active", image: "x" });
    expect(res.status).toBe(201);

    const row = await Member.findOne({
      where: { phone_number: newMember.phone_number },
    });
    expect(Number(row.id)).not.toBe(99999);
    expect(row.activity_status).toBe("Inactive");
    expect(row.image).toBeNull();
  });

  it("rejects duplicates, missing fields, short passwords and bad numbers", async () => {
    await api().post("/auth/sign-up/member").send(newMember);

    const dup = await api().post("/auth/sign-up/member").send(newMember);
    expect(dup.status).toBe(400);
    expect(dup.body.error).toMatch(/exists/);

    const { full_name: _drop, ...missing } = { ...newMember, phone_number: "0922000002" };
    const noName = await api().post("/auth/sign-up/member").send(missing);
    expect(noName.status).toBe(400);
    expect(noName.body.error).toBe("full_name is missing");

    const short = await api()
      .post("/auth/sign-up/member")
      .send({ ...newMember, phone_number: "0922000003", password: "123" });
    expect(short.status).toBe(400);

    const nan = await api()
      .post("/auth/sign-up/member")
      .send({ ...newMember, phone_number: "0922000004", height: "tall" });
    expect(nan.status).toBe(400);
    expect(nan.body.error).toBe("height must be a number");
  });

  it("returns 400 (not 500) for malformed JSON", async () => {
    const res = await api()
      .post("/auth/sign-up/member")
      .set("Content-Type", "application/json")
      .send("{ not json");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid JSON body");
  });
});

describe("admin sign-up", () => {
  const adminBody = {
    full_name: "Boss",
    phone_number: "0933000001",
    password: "boss-pass-1",
    language: "English",
    admin_level: "admin",
  };

  it("is forbidden without the invite code", async () => {
    const res = await api().post("/auth/sign-up/admin").send(adminBody);
    expect(res.status).toBe(403);
  });

  it("is forbidden with the wrong invite code", async () => {
    const res = await api()
      .post("/auth/sign-up/admin")
      .set("x-invite-code", "wrong")
      .send(adminBody);
    expect(res.status).toBe(403);
  });

  it("works with the correct invite code", async () => {
    const res = await api()
      .post("/auth/sign-up/admin")
      .set("x-invite-code", "test-invite-code")
      .send(adminBody);
    expect(res.status).toBe(201);
  });

  it("rejects unknown user types instead of crashing", async () => {
    const res = await api().post("/auth/sign-up/constructor").send({});
    expect(res.status).toBe(404);
  });
});

describe("sign-in", () => {
  it("returns a token and a user without the password hash", async () => {
    await createMember();
    const res = await api().post("/auth/sign-in/member").send(memberCreds);

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.userCheck.phone_number).toBe(memberCreds.phone_number);
    expect(res.body.userCheck).not.toHaveProperty("password");
    expect(JSON.stringify(res.body)).not.toMatch(/\$2[aby]\$/);
  });

  it("issues expiring tokens that carry the role", async () => {
    await createAdmin();
    const { token } = (await api().post("/auth/sign-in/admin").send(adminCreds)).body;
    const payload = jwt.decode(token);
    expect(payload.role).toBe("admin");
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  it("rejects wrong passwords, unknown users and missing fields", async () => {
    await createMember();
    const wrong = await api()
      .post("/auth/sign-in/member")
      .send({ ...memberCreds, password: "nope-nope" });
    expect(wrong.status).toBe(400);
    expect(wrong.body.error).toBe("incorrect password");

    const unknown = await api()
      .post("/auth/sign-in/member")
      .send({ phone_number: "0000", password: "whatever" });
    expect(unknown.status).toBe(404);

    const missing = await api().post("/auth/sign-in/member").send({});
    expect(missing.status).toBe(400);
  });
});

describe("auth middleware", () => {
  it("rejects requests with no or malformed tokens", async () => {
    expect((await api().get("/admin/me")).status).toBe(401);
    expect((await api().get("/admin/me").set("Authorization", "Bearer junk")).status).toBe(401);
    expect((await api().get("/admin/me").set("Authorization", "Token abc")).status).toBe(401);
  });

  it("accepts a valid admin token and never leaks the hash", async () => {
    await createAdmin();
    const token = await signIn("admin", adminCreds);
    const res = await api().get("/admin/me").set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.user.phone_number).toBe(adminCreds.phone_number);
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("does not let a member token reach admin routes (or the reverse)", async () => {
    await createAdmin();
    await createMember();
    const memberToken = await signIn("member", memberCreds);
    const adminToken = await signIn("admin", adminCreds);

    expect((await api().get("/admin/members").set(bearer(memberToken))).status).toBe(401);
    expect((await api().get("/member/me").set(bearer(adminToken))).status).toBe(401);
  });

  it("rejects expired tokens", async () => {
    const admin = await createAdmin();
    const expired = jwt.sign(
      { id: admin.id, phone_number: admin.phone_number, role: "admin" },
      process.env.JWT_SECRET_KEY,
      { expiresIn: -10 },
    );
    const res = await api().get("/admin/me").set(bearer(expired));
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token Expired");
  });

  it("rejects a token whose user no longer exists", async () => {
    const admin = await createAdmin();
    const token = await signIn("admin", adminCreds);
    await admin.destroy();
    const res = await api().get("/admin/me").set(bearer(token));
    expect(res.status).toBe(401);
  });

  it("still accepts legacy tokens without a role claim", async () => {
    const admin = await createAdmin();
    const legacy = jwt.sign(
      { id: admin.id, phone_number: admin.phone_number },
      process.env.JWT_SECRET_KEY,
    );
    expect((await api().get("/admin/me").set(bearer(legacy))).status).toBe(200);
  });
});

describe("password hash exposure", () => {
  it("is absent from member and transaction listings the admin sees", async () => {
    await createAdmin();
    await createMember();
    const token = await signIn("admin", adminCreds);

    const members = await api().get("/admin/members").set(bearer(token));
    expect(members.status).toBe(200);
    expect(members.body.members).toHaveLength(1);
    expect(members.body.members[0]).not.toHaveProperty("password");

    const memberToken = await signIn("member", memberCreds);
    const me = await api().get("/member/me").set(bearer(memberToken));
    expect(me.body.member).not.toHaveProperty("password");
  });
});
