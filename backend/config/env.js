import "dotenv/config";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const isProd = NODE_ENV === "production";

const toBool = (value, fallback = false) =>
  value === undefined ? fallback : ["1", "true", "yes"].includes(value.toLowerCase());

const toList = (value) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const errors = [];

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
  errors.push("JWT_SECRET_KEY is required");
} else if (isProd && JWT_SECRET_KEY.length < 32) {
  errors.push("JWT_SECRET_KEY must be at least 32 characters in production");
}

// Matches backend/setup.sql so a fresh local checkout keeps working.
const localDatabaseUrl = "postgres://postname:password@localhost:5432/postdb";
const DATABASE_URL =
  process.env.DATABASE_URL ?? (isProd ? undefined : localDatabaseUrl);
if (!DATABASE_URL) {
  errors.push("DATABASE_URL is required in production");
}

// Optional Postgres schema (search_path). Tests use it to stay out of `public`.
const DATABASE_SCHEMA = process.env.DATABASE_SCHEMA || undefined;
if (DATABASE_SCHEMA && !/^[a-z_][a-z0-9_]*$/.test(DATABASE_SCHEMA)) {
  errors.push("DATABASE_SCHEMA must be a lowercase identifier");
}

const PORT = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(PORT) || PORT <= 0) {
  errors.push("PORT must be a positive integer");
}

if (errors.length > 0) {
  throw new Error(`Invalid environment configuration:\n - ${errors.join("\n - ")}`);
}

export const env = Object.freeze({
  NODE_ENV,
  isProd,
  isTest: NODE_ENV === "test",
  PORT,
  HOST: process.env.HOST ?? "0.0.0.0",
  DATABASE_URL,
  // Hosted Postgres (Neon, Supabase, Render) requires TLS.
  DATABASE_SSL: toBool(process.env.DATABASE_SSL, false),
  DATABASE_SCHEMA,
  JWT_SECRET_KEY,
  // The mobile apps do not sign out on 401 yet, so keep this generous until
  // they do (tracked for the mobile phase), then shorten it.
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "30d",
  // Browsers only. Native mobile apps do not send an Origin header.
  CORS_ORIGINS: toList(process.env.CORS_ORIGINS),
  // Run pending migrations on boot. Turn off if you migrate as a separate step.
  AUTO_MIGRATE: toBool(process.env.AUTO_MIGRATE, true),
  // Admin sign-up is disabled unless this is set; callers send it as x-invite-code.
  ADMIN_INVITE_CODE: process.env.ADMIN_INVITE_CODE || undefined,
  DEMO_MODE: toBool(process.env.DEMO_MODE, false),
});
