import Admin from "../models/Admin.js";
import Member from "../models/Member.js";
import { jwt_verify } from "../utils/jwt.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Member ids are integers exposed as zero-padded strings ("00042").
const MEMBER_ID_RE = /^\d{1,5}$/;

function authenticate({ role, Model, isValidId, attach }) {
  return async (req, res, next) => {
    const [scheme, token] = (req.headers.authorization ?? "").split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "token missing" });
    }

    let decode;
    try {
      decode = jwt_verify(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token Expired" });
      }
      return res.status(401).json({ error: "Invalid Token" });
    }

    // Tokens issued before roles existed carry no role claim and stay valid.
    if (decode.role && decode.role !== role) {
      return res.status(401).json({ error: "token unautherized" });
    }
    if (!isValidId(String(decode.id))) {
      return res.status(401).json({ error: "token unautherized" });
    }

    const user = await Model.findOne({ where: { id: decode.id } });
    if (!user) {
      return res.status(401).json({ error: "user unautherized" });
    }
    if (user.phone_number !== decode.phone_number) {
      return res.status(401).json({ error: "phone number missmatch" });
    }

    attach(req, user);
    return next();
  };
}

export const admin_auth = authenticate({
  role: "admin",
  Model: Admin,
  isValidId: (id) => UUID_RE.test(id),
  attach: (req, user) => {
    req.adminId = user.id;
    req.adminName = user.full_name;
  },
});

export const member_auth = authenticate({
  role: "member",
  Model: Member,
  isValidId: (id) => MEMBER_ID_RE.test(id),
  attach: (req, user) => {
    req.memberId = user.id;
  },
});
