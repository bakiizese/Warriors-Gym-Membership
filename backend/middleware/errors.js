import multer from "multer";
import { env } from "../config/env.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function notFound(req, res) {
  return res.status(404).json({ error: "route not found" });
}

// Express 5 forwards rejected promises from async handlers here, so routes
// only need to catch errors they can turn into a more specific response.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "invalid JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "request body too large" });
  }
  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ error: err.message });
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ error: "already exists" });
  }
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(", ") });
  }
  if (err.message === "Invalid file type") {
    return res.status(400).json({ error: "invalid file type" });
  }

  if (!env.isTest) {
    console.error(`${req.method} ${req.originalUrl}`, err);
  }
  return res.status(500).json({ error: "internal server error" });
}
