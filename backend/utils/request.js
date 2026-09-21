import { HttpError } from "../middleware/errors.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Multipart routes send their JSON payload in a `metadata` field.
export function parseMetadata(req) {
  if (!req.body?.metadata) {
    throw new HttpError(400, "metadata is missing");
  }
  try {
    return JSON.parse(req.body.metadata);
  } catch {
    throw new HttpError(400, "metadata is not valid JSON");
  }
}

// Ids reach Postgres as typed values, so a malformed one would surface as a
// 500 from a cast error. Reject them up front instead.
export function requireUuid(value, name = "id") {
  if (!UUID_RE.test(String(value))) {
    throw new HttpError(400, `invalid ${name}`);
  }
  return String(value);
}

export function requireInt(value, name = "id") {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new HttpError(400, `invalid ${name}`);
  }
  return number;
}

// Copy only the listed keys, and only when they were actually sent.
export function pick(source, keys) {
  const result = {};
  for (const key of keys) {
    if (source?.[key] !== undefined) result[key] = source[key];
  }
  return result;
}

// Admin forms send dates as DD-MM-YYYY.
export function parseDayMonthYear(value) {
  const match = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(String(value));
  if (!match) throw new HttpError(400, "paid_at must be DD-MM-YYYY");
  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new HttpError(400, "paid_at is not a real date");
  }
  return date;
}
