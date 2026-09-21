import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { QueryTypes } from "sequelize";
import app from "../app.js";
import sequelize from "../config/database.js";

afterAll(() => sequelize.close());

describe("smoke", () => {
  it("reports healthy with the database up", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok", db: "up", demo: false });
  });

  it("migrations created every table in the isolated schema", async () => {
    // Aliased on purpose: Sequelize special-cases SQL that starts with
    // "SELECT table_name FROM information_schema.tables" and returns bare values.
    const rows = await sequelize.query(
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = current_schema()",
      { type: QueryTypes.SELECT },
    );
    expect(rows.map((r) => r.name).sort()).toEqual(
      [
        "SequelizeMeta",
        "admins",
        "attendance-logs",
        "images",
        "members",
        "membership-plans",
        "memberships",
        "programs",
        "transaction-histories",
        "videos",
        "workout-plans",
      ].sort(),
    );
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "route not found" });
  });
});
