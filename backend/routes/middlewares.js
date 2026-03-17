import Admin from "../models/Admin.js";
import Member from "../models/Member.js";
import { jwt_verify } from "../utils/jwt.js";

export async function admin_auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "token missing" });
    }
    const decode = jwt_verify(token);
    if (!decode) {
      return res.status(401).json({ error: "token unautherized" });
    }
    const user = await Admin.findOne({ where: { id: decode.id } });
    if (!user) {
      return res.status(401).json({ error: "user unautherized" });
    }
    if (user.phone_number !== decode.phone_number) {
      return res.status(404).json({ error: "phone number missmatch" });
    }
    req.adminId = user.id;
    req.adminName = user.full_name;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token Expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid Token" });
    }
    // console.log("error", err);
    return res.status(401).json({ error: "Authenticaton Failed" });
  }
}

export async function member_auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "token missing" });
    }
    const decode = jwt_verify(token);
    if (!decode) {
      return res.status(401).json({ error: "token unautherized" });
    }
    const user = await Member.findOne({ where: { id: decode.id } });
    if (!user) {
      return res.status(401).json({ error: "user unautherized" });
    }
    if (user.phone_number !== decode.phone_number) {
      return res.status(404).json({ error: "phone number missmatch" });
    }
    req.memberId = user.id;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token Expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid Token" });
    }
    // console.log("error", err);
    return res.status(401).json({ error: "Authenticaton Failed" });
  }
}
