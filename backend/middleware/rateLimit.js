import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

const base = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { error: "too many requests, please try again later" },
};

export const apiLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 600,
});

// Sign-in / sign-up are the brute-force targets.
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 30,
});
