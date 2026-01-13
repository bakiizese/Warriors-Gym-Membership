import jwt from "jsonwebtoken";

export function gen_jwt_token(payload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {});

  return token;
}

export function jwt_verify(jwt_token) {
  const verify = jwt.verify(jwt_token, process.env.JWT_SECRET_KEY);
  if (verify) {
    return verify;
  }
  return false;
}
