import express from "express";
import Member from "../models/Member.js";
import Admin from "../models/Admin.js";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errors.js";
import { hash_password, verify_password } from "../utils/password.js";
import { safeEqual } from "../utils/safeEqual.js";
import { gen_jwt_token, jwt_verify } from "../utils/jwt.js";

const authRouter = express.Router();

const classes = { member: Member, admin: Admin };

const requiredFields = {
  admin: ["full_name", "phone_number", "password", "language", "admin_level"],
  member: [
    "full_name",
    "phone_number",
    "gender",
    "height",
    "weight",
    "age",
    "password",
    "language",
    "registration_Date",
  ],
};
// Only these can be set through sign-up; everything else in the body is ignored.
const optionalFields = { admin: [], member: [] };
const numericFields = ["height", "weight", "age"];
const MIN_PASSWORD_LENGTH = 6;

function getModel(userType) {
  if (!Object.hasOwn(classes, userType)) {
    throw new HttpError(404, "unknown user type");
  }
  return classes[userType];
}

function parseBody(req) {
  if (!req.body?.metadata) return req.body ?? {};
  try {
    return JSON.parse(req.body.metadata);
  } catch {
    throw new HttpError(400, "metadata is not valid JSON");
  }
}

// `userType` is explicit so the admin "add member" route can reuse this for
// members without touching req.params.
export async function signUp(req, res, userType = req.params.userType) {
  const Model = getModel(userType);

  // Anyone may register as a member, but admin accounts need the invite code.
  if (userType === "admin") {
    const allowed =
      env.ADMIN_INVITE_CODE &&
      safeEqual(req.get("x-invite-code"), env.ADMIN_INVITE_CODE);
    if (!allowed) {
      throw new HttpError(403, "admin sign-up is disabled");
    }
  }

  const body = parseBody(req);
  const isAdminCaller = Boolean(req.adminId);

  for (const key of requiredFields[userType]) {
    if (!body[key]) {
      console.log(key)
      throw new HttpError(400, key + " is missing");
    }
  }

  for (const key of numericFields) {
    if (userType === "member" && !Number.isFinite(Number(body[key]))) {
      throw new HttpError(400, key + " must be a number");
    }
  }

  if (String(body.password).length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(
      400,
      `password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }

  const userData = {};
  for (const key of [...requiredFields[userType], ...optionalFields[userType]]) {
    if (body[key] !== undefined) userData[key] = body[key];
  }
  // Only an authenticated admin adding a member may set the initial status.
  if (userType === "member" && isAdminCaller && body.activity_status) {
    userData.activity_status = body.activity_status;
  }
  if (req.imageFile) {
    userData.image = req.imageFile;
  }

  const existing = await Model.findOne({
    where: { phone_number: userData.phone_number },
  });
  if (existing) {
    throw new HttpError(400, userData.phone_number + " exists");
  }

  userData.password = await hash_password(userData.password);
  await Model.create(userData);

  return res.status(201).json({ user: "user created successfuly" });
}

authRouter.post("/sign-up/:userType", (req, res) => signUp(req, res));

authRouter.post("/sign-in/:userType", async (req, res) => {
  const userType = req.params.userType;
  const Model = getModel(userType);
  const userData = req.body ?? {};

  for (const key of ["phone_number", "password"]) {
    if (!userData[key]) {
      throw new HttpError(400, key + " is missing");
    }
  }

  const user = await Model.scope("withPassword").findOne({
    where: { phone_number: String(userData.phone_number) },
  });
  if (!user) {
    throw new HttpError(404, `${userData.phone_number} not found`);
  }

  const correct = await verify_password(String(userData.password), user.password);
  if (!correct) {
    throw new HttpError(400, "incorrect password");
  }

  const token = gen_jwt_token({
    id: user.id,
    phone_number: user.phone_number,
    role: userType,
  });
  user.language = userData.language || "English";
  await user.save();

  // Never send the hash back to the client.
  const { password: _password, ...userCheck } = user.toJSON();
  return res.status(200).json({ userCheck, token });
});

authRouter.get("/sign-up/:phoneNumber", async (req, res) => {
  const member = await Member.findOne({
    where: { phone_number: req.params.phoneNumber },
  });
  if (!member) {
    throw new HttpError(404, "phone number not found");
  }
  return res.status(200).json({ user: "phone number exists" });
});

authRouter.get("/self", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "No Authorization header found" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ message: "Token format must be 'Bearer <token>'" });
  }

  try {
    jwt_verify(parts[1]);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired. Please login again." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }

  return res.status(200).json({ token: "correct" });
});

export default authRouter;
