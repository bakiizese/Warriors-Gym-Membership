import express from "express";
import Member from "../models/Member.js";
import Admin from "../models/Admin.js";
import { hash_password, verify_password } from "../utils/password.js";
import { gen_jwt_token, jwt_verify } from "../utils/jwt.js";
import MembershipPlan from "../models/MembershipPlan.js";

const authRouter = express.Router();

const classes = { member: Member, admin: Admin };
const adminData = [
  "full_name",
  "phone_number",
  "password",
  "language",
  "admin_level",
];
const memberData = [
  "full_name",
  "phone_number",
  "gender",
  "height",
  "weight",
  "age",
  "password",
  "language",
];

export async function signUp(req, res) {
  const userType = req.params.userType;
  const userData = req.body;
  //check if all required data exist
  for (const key of userType === "admin" ? adminData : memberData) {
    if (!userData[key]) {
      return res.status(400).json({ error: key + " is missing" });
    }
  }
  //check if a user exists by phone number
  const userCheck = await classes[userType].findOne({
    where: { phone_number: userData["phone_number"] },
  });
  if (userCheck) {
    return res
      .status(400)
      .json({ error: userData["phone_number"] + " exists" });
  }

  //encrypting password to hash form
  const hashed_password = await hash_password(userData["password"]);
  userData["password"] = hashed_password;

  //creating new user using try/catch to catch unexpected errors
  try {
    const newUser = classes[userType].create(userData);
    if (!newUser) {
      return res.status(500).json({ error: "unable to create user" });
    }
    return res.status(201).json({ user: "user created successfuly" });
  } catch (err) {
    return res.status(500).json({ error: "function error - " + err });
  }
}

authRouter.post("/sign-up/:userType", async (req, res) => {
  return signUp(req, res);
});
authRouter.post("/sign-in/:userType", async (req, res) => {
  const userType = req.params.userType;
  const userData = req.body;

  //check if all required data exist
  for (const key of ["phone_number", "password"]) {
    if (!userData[key]) {
      return res.status(400).json({ error: key + " is missing" });
    }
  }
  //check if user exists
  const userCheck = await classes[userType].findOne({
    where: { phone_number: userData["phone_number"] },
  });

  if (!userCheck) {
    return res
      .status(404)
      .json({ error: `${userData["phone_number"]} not found` });
  }

  //check if password is correct
  const check_password = await verify_password(
    userData["password"],
    userCheck["password"],
  );
  if (!check_password) {
    return res.status(400).json({ error: "incorrect password" });
  }
  const token = gen_jwt_token({
    id: userCheck.id,
    phone_number: userCheck.phone_number,
  });
  userCheck.language = userData.language || "English";
  userCheck.save();
  return res.status(200).json({ userCheck, token: token });
});

authRouter.get("/sign-up/:phoneNumber", async (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  try {
    const checkNumber = await Member.findOne({
      where: { phone_number: phoneNumber },
    });
    if (!checkNumber) {
      return res.status(404).json({ error: "phone number not found" });
    }
  } catch {
    return res.status(500).json({ error: "server error" });
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
  const token = parts[1];

  try {
    const verifyToken = jwt_verify(token);
    if (!verifyToken) {
      return res.status(401).json({ error: "invalid token" });
    }
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
