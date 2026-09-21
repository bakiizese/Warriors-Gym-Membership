import crypto from "crypto";
import pg from "pg";

// Tests run against a throwaway schema inside a real Postgres, so the
// migrations are exercised on an empty database and nothing in `public` is
// touched. Point TEST_DATABASE_URL at any database the role may CREATE in.
const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgres://postname:password@localhost:5432/postdb";

const schema = `test_${crypto.randomBytes(4).toString("hex")}`;

async function withClient(fn) {
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export async function setup() {
  await withClient((client) => client.query(`CREATE SCHEMA "${schema}"`));

  // Worker processes inherit these, and config/env.js reads them on import.
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = databaseUrl;
  process.env.DATABASE_SCHEMA = schema;
  process.env.JWT_SECRET_KEY = "test-secret-key-that-is-long-enough-0123456789";
  process.env.ADMIN_INVITE_CODE = "test-invite-code";

  const { migrator } = await import("../config/migrator.js");
  const { default: sequelize } = await import("../config/database.js");
  await migrator.up();
  await sequelize.close();
}

export async function teardown() {
  await withClient((client) =>
    client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`),
  );
}
