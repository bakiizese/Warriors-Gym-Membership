import express from "express";
import Member from "../models/Member.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Admin from "../models/Admin.js";
import { admin_auth } from "./middlewares.js ";
import { signUp } from "./auth_route.js";
import Membership from "../models/Membership.js";
import { Op } from "sequelize";
import AttendanceLog from "../models/AttendanceLog.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import { uploadFields } from "../utils/upload.js";
import Video from "../models/Video.js";
import fs from "fs";
import TransactionHistory from "../models/TransactionHistory.js";
import { membershipCalculate } from "../utils/logic.js";

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

adminRouter.put("/picture", uploadFields, admin_auth, async (req, res) => {
  try {
    let filePath = "";
    if (req.files && req.files.file) {
      if (req.files.file[0]?.path) {
        filePath = req.files.file[0]?.path;
      }
    }
    const adminId = req.adminId;
    const admin = await Admin.findOne({ where: { id: adminId } });
    if (admin.image && filePath) {
      fs.unlink(admin["image"], (err) => {
        if (err) {
          console.log("unable to remove image");
        } else {
          console.log("image removed successfully");
          admin["image"] = null;
        }
      });
    }
    if (typeof filePath === "string" && filePath) {
      admin["image"] = filePath;
    }
    admin.save();
    return res.status(200).json({ admin: "successfully updated" });
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

    const uniqueMembers = Array.from(
      new Map(members.map((m) => [m.id, m])).values(),
    );
    return res.status(200).json({ members: uniqueMembers });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

adminRouter.delete("/member/:memberId", admin_auth, async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const member = await Member.findOne({ where: { id: memberId } });
    if (member.image) {
      fs.unlink(member.image, (err) => {
        if (err) {
          console.log("unable to delete image");
        } else {
          console.log("image deleted");
        }
      });
    }
    await member.destroy();
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

//membershipPlan
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
      const membershipId = req.params.membershipId;
      const updateData = req.body;
      const membership = await MembershipPlan.findOne({
        where: { id: membershipId },
      });
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
      // const checkIn = new Date("2026-02-22T06:53:06.709Z");
      const attendanceData = {
        member_id: member.id,
        membership_id: member.membership.id,
        check_in: String(checkIn),
      };
      const checkAttendance = await AttendanceLog.findAll({
        where: { member_id: member.id, membership_id: member.membership.id },
      });
      if (checkAttendance.length > 0) {
        const prevCheckIn =
          checkAttendance[checkAttendance.length - 1]?.check_in;
        const prevCheckInDate = new Date(prevCheckIn);
        const subs = Math.abs(checkIn - prevCheckInDate) / (1000 * 60 * 60);
        if (subs < 23) {
          return res.status(400).json({ error: "already attended today" });
        }
      }

      const attendance = await AttendanceLog.create(attendanceData);
      attendance["full_name"] = member.full_name;

      const membership = await Membership.findOne({
        where: {
          member_id: memberId,
          status: { [Op.in]: ["Active", "Payment Due"] },
        },
        include: {
          model: MembershipPlan,
          as: "membershipPlan",
          required: true,
        },
      });

      const membershipCal = membershipCalculate(membership, memberId);

      if (membership.membershipPlan.plan_type === "Ticket") {
        if (membershipCal.remainingTicket < 0) {
          member.activity_status = "Inactive";
          membership.status = "Inactive";
        } else if (membershipCal.remainingTicket < 3) {
          member.activity_status = "Payment Due";
          membership.status = "Payment Due";
        }
      }

      if (membershipCal.daysLeft < 0) {
        member.activity_status = "Inactive";
        membership.status = "Inactive";
      } else if (membershipCal.daysLeft < 5) {
        member.activity_status = "Payment Due";
        membership.status = "Payment Due";
      }

      member.save();
      membership.save();

      return res
        .status(200)
        .json({ attendance: [attendance, { full_name: member.full_name }] });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
  },
);

//workoutPlan
adminRouter.get("/workout/:workoutType", admin_auth, async (req, res) => {
  try {
    const workoutType = req.params.workoutType;
    const workout = await WorkoutPlan.findAll({
      where: { workout_type: workoutType },
      include: { model: Video, as: "video" },
    });

    if (!workout) {
      return res.status(200).json({ workout: [] });
    }
    const sorted = workout.reduce((acc, workout) => {
      const key = workout.workout_type;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(workout);
      return acc;
    }, {});

    return res.status(200).json({ workout: sorted });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

adminRouter.get("/workouts", admin_auth, async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.findAll({
      include: { model: Video, as: "video" },
    });

    const sorted = workoutPlans.reduce((acc, workout) => {
      const key = workout.workout_type;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(workout);
      return acc;
    }, {});

    return res.status(200).json({ workoutPlan: sorted });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

adminRouter.post("/workout", uploadFields, admin_auth, async (req, res) => {
  try {
    let filePath = "";
    if (req.files && req.files.file) {
      if (req.files.file[0]?.path) {
        filePath = req.files.file[0]?.path;
      }
    }
    if (!filePath) {
      return res.status(400).json({ error: "video missing" });
    }
    const workoutKeys = [
      "workout_title",
      "workout_type",
      "workout_level",
      "workout_rep",
      "workout_sets",
      "workout_break",
    ];
    const workoutData = JSON.parse(req.body.metadata);
    for (const key of workoutKeys) {
      if (!workoutData[key]) {
        return res.status(400).json({ error: `${key} missing` });
      }
    }

    const video = await Video.create({ path: filePath });

    if (!video) {
      return res.status(500).json({ error: "video unable to create" });
    }

    workoutData["video_id"] = video.id;

    const newWorkoutPlan = await WorkoutPlan.create(workoutData);
    if (!newWorkoutPlan) {
      return res.status(500).json({ error: "unable to create workoutPlan" });
    }
    return res.status(201).json({ workoutPlan: "workout created successfuly" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

adminRouter.delete(
  "/workoutRemove/:workoutId",
  admin_auth,
  async (req, res) => {
    try {
      const workoutId = req.params.workoutId;
      const workout = await WorkoutPlan.findOne({
        where: { id: workoutId },
        include: { model: Video, as: "video" },
      });

      if (!workout) {
        return res.status(404).json({ error: "workout not found" });
      }
      await Video.destroy({ where: { id: workout.video_id } });
      if (workout?.video?.path) {
        fs.unlink(workout.video.path, (err) => {
          if (err) {
            console.log("Error deleting video");
          } else {
            console.log("video deleted Successfuly");
          }
        });
      }
      workout.destroy();

      return res.status(200).json({ workout: "workout deleted successfuly" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
    }
  },
);

adminRouter.put(
  "/workoutUpdate",
  uploadFields,
  admin_auth,
  async (req, res) => {
    try {
      const video = req?.files?.file;
      const updateKey = [
        "workout_title",
        "workout_type",
        "workout_level",
        "workout_rep",
        "workout_sets",
        "workout_break",
      ];

      const jsonData = req.body;
      const updateData = JSON.parse(jsonData.metadata);
      const currentData = await WorkoutPlan.findOne({
        where: { id: updateData.id },
      });

      for (const key of updateKey) {
        if (updateData[key]) {
          currentData[key] = updateData[key];
        }
      }

      const currentVideo = await Video.findOne({
        where: { id: currentData.video_id },
      });

      if (!currentVideo && video) {
        const newVideo = await Video.create({ path: video[0].path });
        currentData.video_id = newVideo.id;
        console.log("newVideo created");
      } else if (currentVideo && video) {
        fs.unlink(currentVideo.path, (err) => {
          if (err) {
            console.log("Error deleting video");
          } else {
            console.log("video deleted Successfuly");
          }
        });
        currentVideo.path = video[0].path;
        currentVideo.save();
        console.log("Video updated");
      }
      currentData.save();
      return res.status(200).json({ workour: "workout updated successfuly" });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  },
);

//transaction
adminRouter.get("/transactions", admin_auth, async (req, res) => {
  try {
    const transactions = await TransactionHistory.findAll({
      include: { model: Member, as: "payer" },
    });
    return res.status(200).json({ transactions: transactions });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

adminRouter.post("/transaction", admin_auth, async (req, res) => {
  const transactionKeys = [
    "payer_id",
    "membershipPlan_id",
    "payment_method",
    "amount",
    "payment_for",
  ];
  try {
    const transactionData = req.body;
    const adminName = req.adminName;

    for (const key of transactionKeys) {
      if (!transactionData[key]) {
        return res.status(400).json({ error: `${key} missing` });
      }
    }

    const payer = await Member.findOne({
      where: { id: transactionData.payer_id },
    });
    if (!payer) {
      return res
        .status(400)
        .json({ error: `${transactionData.payer_id} don't exist` });
    }

    transactionData.payment_method =
      transactionData.payment_method + "-" + adminName;

    transactionData.paid_at = String(new Date());
    transactionData.status = "Successfull";

    payer.activity_status = "Active";

    payer.save();
    const transaction = await TransactionHistory.create(transactionData);
    if (!transaction) {
      return res.status(500).json({ error: "unable to create transaction" });
    }
    return res
      .status(201)
      .json({ transaction: "transaction created successfuly" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//membership
adminRouter.post("/membership", admin_auth, async (req, res) => {});

export default adminRouter;
