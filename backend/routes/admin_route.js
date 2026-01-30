import express from "express";
import Member from "../models/Member.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Admin from "../models/Admin.js";
import { admin_auth } from "./middlewares.js ";
import { signUp } from "./auth_route.js";
import Membership from "../models/Membership.js";
import { Op } from "sequelize";
import AttendanceLog from "../models/AttendanceLog.js";

const adminRouter = express.Router();

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
const membershipKeys = [
  "membership_name",
  "plan_type",
  "fee",
  "description",
  "status",
];

//self
adminRouter.get("/me", admin_auth, async (req, res) => {
  try {
    const adminId = req.adminId;
    const userData = await Admin.findOne({ where: { id: adminId } });
    if (!userData) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.status(200).json({ user: userData });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//members
//this will be handled by auth_route
adminRouter.post("/addMember", admin_auth, async (req, res) => {
  req.params.userType = "member";
  return signUp(req, res);
});

adminRouter.put("/updateMember", admin_auth, async (req, res) => {});

adminRouter.get("/members", admin_auth, async (req, res) => {
  try {
    const members = await Member.findAll({
      include: {
        model: Membership,
        include: {
          model: MembershipPlan,
          as: "membershipPlan",
          attributes: ["membership_name"],
        },
        attributes: ["membership_plan_id"],
        as: "membership",
      },
    });
    return res.status(200).json({ members: members });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

adminRouter.delete("/member/:memberId", admin_auth, async (req, res) => {
  try {
    const memberId = req.params.memberId;
    await Member.destroy({ where: { id: memberId } });
    return res.status(200).json({ member: "removed successfuly" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

adminRouter.get("/members_status", admin_auth, async (req, res) => {
  try {
    const activeMembers = await Member.count({
      where: { activity_status: "Active" },
    });
    const paymentDueMembers = await Member.count({
      where: { activity_status: "Payment Due" },
    });

    return res.status(200).json({
      members_status: {
        activeMembers: activeMembers,
        paymentDueMembers: paymentDueMembers,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//membership
adminRouter.get("/membership_plans", admin_auth, async (req, res) => {
  try {
    const membershipPlans = await MembershipPlan.findAll({
      include: [
        {
          model: Membership,
          as: "memberships",
          required: false,
          where: { status: { [Op.in]: ["Active", "Payment Due"] } },
        },
      ],
    });
    return res.status(200).json({ membershipPlan: membershipPlans });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

adminRouter.post("/membership_plan", admin_auth, async (req, res) => {
  try {
    const membershipData = req.body;
    // console.log("data", membershipData);
    for (const key of membershipKeys) {
      if (!membershipData[key]) {
        if (key === "ticket_amount") {
          if (membershipData["plan_type"] === "Ticket") {
            console.log(key, "is missing");
            return res.status(400).json({ error: `${key} is missing` });
          }
        }
        console.log(key, "is missing");
        return res.status(400).json({ error: `${key} is missing` });
      }
    }
    await MembershipPlan.create(membershipData);
    return res
      .status(201)
      .json({ membership: "membership successfuly created" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

adminRouter.put(
  "/membership_plan/:membershipId",
  admin_auth,
  async (req, res) => {
    try {
      const membershipId = req.membershipId;
      const updateData = req.body;
      const membership = await MembershipPlan.findOne({ id: membershipId });
      if (!membership) {
        return res.status(404).json({ error: "membership not found" });
      }
      for (const key in updateData) {
        if (!["id", "createdAt", "updatedAt"].includes(key)) {
          if (membership[key]) {
            membership[key] = updateData[key];
          }
        }
      }
      membership.save();
      return res
        .status(200)
        .json({ membership: "membership updated successfuly" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
  },
);

adminRouter.delete(
  "/membership_plan/:membershipId",
  admin_auth,
  async (req, res) => {
    try {
      const membershipId = req.params.membershipId;
      if (!membershipId) {
        return res.status(400).json({ error: "invalid id" });
      }
      await MembershipPlan.destroy({ where: { id: membershipId } });
      return res
        .status(200)
        .json({ membership: "membership deleted successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
  },
);

//attendance
adminRouter.get("/attendanceLog", admin_auth, async (req, res) => {
  try {
    const attendanceLog = await AttendanceLog.findAll();
    return res.status(200).json({ attendanceLog: attendanceLog });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

adminRouter.post(
  "/memberAttendance/:memberId",
  admin_auth,
  async (req, res) => {
    try {
      const memberId = Number(req.params.memberId);
      if (!memberId) {
        return res.status(400).json({ error: `error in ${memberId}` });
      }
      const member = await Member.findOne({
        where: { id: memberId },
        include: { model: Membership, as: "membership", required: false },
      });
      if (!member) {
        return res.status(404).json({ error: "member not found" });
      }
      if (!member.membership) {
        return res.status(404).json({ error: "membership not created" });
      }
      const checkIn = new Date();
      const attendanceData = {
        member_id: member.id,
        membership_id: member.membership.id,
        check_in: String(checkIn),
      };

      const checkAttendance = await AttendanceLog.findAll({
        where: { member_id: member.id, membership_id: member.membership.id },
      });

      const prevCheckIn = checkAttendance[checkAttendance.length - 1].check_in;
      const prevCheckInDate = new Date(prevCheckIn);

      const subs = Math.abs(checkIn - prevCheckInDate) / (1000 * 60 * 60) + 24;

      if (subs < 23) {
        return res.status(400).json({ error: "already attended today" });
      }

      const attendance = await AttendanceLog.create(attendanceData);
      attendance["full_name"] = member.full_name;
      return res
        .status(200)
        .json({ attendance: [attendance, { full_name: member.full_name }] });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
  },
);

export default adminRouter;
