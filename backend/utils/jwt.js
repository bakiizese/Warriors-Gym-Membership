import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function gen_jwt_token(payload) {
  return jwt.sign(payload, env.JWT_SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

// Throws TokenExpiredError / JsonWebTokenError for bad tokens.
export function jwt_verify(jwt_token) {
  return jwt.verify(jwt_token, env.JWT_SECRET_KEY, { algorithms: ["HS256"] });
}
