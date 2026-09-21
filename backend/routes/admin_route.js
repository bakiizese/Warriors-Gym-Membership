import express from "express";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { isDemoLocked } from "../config/demo.js";
import Admin from "../models/Admin.js";
import AttendanceLog from "../models/AttendanceLog.js";
import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Program from "../models/Program.js";
import TransactionHistory from "../models/TransactionHistory.js";
import Video from "../models/Video.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import { admin_auth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";
import {
  cleanupOnError,
  removeUpload,
  uploadedPath,
} from "../services/files.js";
import {
  LIVE_STATUSES,
  renewMembership,
  resolveStatus,
  startMembership,
} from "../services/membership.js";
import { updateProfile, withoutPassword } from "../services/profile.js";
import { groupWorkoutsByType } from "../services/workouts.js";
import { membershipCalculate } from "../utils/logic.js";
import {
  parseDayMonthYear,
  parseMetadata,
  pick,
  requireInt,
  requireUuid,
} from "../utils/request.js";
import { uploadFields } from "../utils/upload.js";
import { signUp } from "./auth_route.js";

const adminRouter = express.Router();

// admin_auth always runs before uploadFields: multer writes to disk as soon as
// it parses the body, so an unauthenticated request must never reach it.

const PLAN_FIELDS = [
  "membership_name",
  "plan_type",
  "ticket_amount",
  "duration_days",
  "fee",
  "description",
  "status",
];
const PLAN_REQUIRED = [
  "membership_name",
  "plan_type",
  "fee",
  "duration_days",
  "status",
];
const WORKOUT_FIELDS = [
  "workout_title",
  "workout_type",
  "workout_level",
  "workout_rep",
  "workout_sets",
  "workout_break",
];

function assertPlanNumbers(data) {
  const rules = { fee: 0, duration_days: 1, ticket_amount: 1 };
  for (const [key, min] of Object.entries(rules)) {
    if (data[key] === undefined || data[key] === null) continue;
    const value = Number(data[key]);
    if (!Number.isInteger(value) || value < min) {
      throw new HttpError(400, `${key} must be a whole number of at least ${min}`);
    }
  }
}

//self
adminRouter.get("/me", admin_auth, async (req, res) => {
  const user = await Admin.findByPk(req.adminId);
  if (!user) {
    throw new HttpError(404, "user not found");
  }
  return res.status(200).json({ user });
});

adminRouter.put(
  "/profile",
  admin_auth,
  uploadFields,
  cleanupOnError(async (req, res) => {
    const updateData = parseMetadata(req);
    const user = await Admin.scope("withPassword").findByPk(req.adminId);
    const { token } = await updateProfile({
      Model: Admin,
      role: "admin",
      user,
      updateData,
      filePath: uploadedPath(req),
      selfService: true,
    });
    if (token) {
      return res.status(200).json({ token, user: withoutPassword(user) });
    }
    return res.status(200).json({ user: "successfully updated" });
  }),
);

//members
adminRouter.post(
  "/addMember",
  admin_auth,
  uploadFields,
  cleanupOnError(async (req, res) => {
    req.imageFile = uploadedPath(req) || undefined;
    return signUp(req, res, "member");
  }),
);

adminRouter.put(
  "/updateMember",
  admin_auth,
  uploadFields,
  cleanupOnError(async (req, res) => {
    const updateData = parseMetadata(req);
    const member = await Member.findByPk(requireInt(updateData.id, "member id"));
    if (!member) {
      throw new HttpError(404, "member not found");
    }
    await updateProfile({
      Model: Member,
      role: "member",
      user: member,
      updateData,
      filePath: uploadedPath(req),
      selfService: false,
    });
    return res.status(200).json({ user: "successfully updated" });
  }),
);

adminRouter.get("/members", admin_auth, async (req, res) => {
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
});

adminRouter.delete("/member/:memberId", admin_auth, async (req, res) => {
  const member = await Member.findByPk(requireInt(req.params.memberId, "member id"));
  if (!member) {
    throw new HttpError(404, "member not found");
  }
  if (isDemoLocked(member)) {
    throw new HttpError(403, "the demo member account cannot be deleted");
  }
  await member.destroy();
  await removeUpload(member.image);
  return res.status(200).json({ member: "removed successfuly" });
});

adminRouter.get("/members_status", admin_auth, async (req, res) => {
  const activeMembers = await Member.count({
    where: { activity_status: "Active" },
  });
  const paymentDueMembers = await Member.count({
    where: { activity_status: "Payment Due" },
  });

  return res.status(200).json({
    members_status: { activeMembers, paymentDueMembers },
  });
});

//membershipPlan
adminRouter.get("/membership_plans", admin_auth, async (req, res) => {
  const membershipPlans = await MembershipPlan.findAll({
    include: [
      {
        model: Membership,
        as: "memberships",
        required: false,
        where: { status: { [Op.in]: LIVE_STATUSES } },
      },
    ],
  });
  return res.status(200).json({ membershipPlan: membershipPlans });
});

adminRouter.post("/membership_plan", admin_auth, async (req, res) => {
  const data = pick(req.body, PLAN_FIELDS);
  const required =
    data.plan_type === "Ticket" ? [...PLAN_REQUIRED, "ticket_amount"] : PLAN_REQUIRED;
  for (const key of required) {
    if (data[key] === undefined || data[key] === "") {
      throw new HttpError(400, `${key} is missing`);
    }
  }
  assertPlanNumbers(data);

  await MembershipPlan.create(data);
  return res.status(201).json({ membership: "membership successfuly created" });
});

adminRouter.put("/membership_plan/:membershipId", admin_auth, async (req, res) => {
  const plan = await MembershipPlan.findByPk(
    requireUuid(req.params.membershipId, "membership id"),
  );
  if (!plan) {
    throw new HttpError(404, "membership not found");
  }

  const updates = pick(req.body, PLAN_FIELDS);
  assertPlanNumbers(updates);
  plan.set(updates);
  await plan.save();
  return res.status(200).json({ membership: "membership updated successfuly" });
});

adminRouter.delete("/membership_plan/:membershipId", admin_auth, async (req, res) => {
  const id = requireUuid(req.params.membershipId, "membership id");

  // memberships.membership_plan_id cascades, so deleting a plan that anyone
  // ever bought would silently erase their membership history.
  const inUse = await Membership.count({ where: { membership_plan_id: id } });
  if (inUse > 0) {
    throw new HttpError(
      409,
      "plan has memberships; set its status to inactive instead of deleting it",
    );
  }
  const deleted = await MembershipPlan.destroy({ where: { id } });
  if (!deleted) {
    throw new HttpError(404, "membership not found");
  }
  return res.status(200).json({ membership: "membership deleted successfully" });
});

//attendance
adminRouter.get("/attendanceLog", admin_auth, async (req, res) => {
  const attendanceLog = await AttendanceLog.findAll({
    limit: 100,
    order: [["createdAt", "DESC"]],
    include: { model: Member, as: "attendanceMember" },
  });
  return res.status(200).json({ attendanceLog });
});

adminRouter.get("/attendanceLog/today", admin_auth, async (req, res) => {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await AttendanceLog.count({
    where: { createdAt: { [Op.gte]: last24Hours } },
  });
  return res.status(200).json({ attendanceCount: count });
});

adminRouter.post("/memberAttendance/:memberId", admin_auth, async (req, res) => {
  const memberId = requireInt(req.params.memberId, "member id");
  const member = await Member.findByPk(memberId);
  if (!member) {
    throw new HttpError(404, "member not found");
  }

  const membership = await Membership.findOne({
    where: { member_id: memberId, status: { [Op.in]: LIVE_STATUSES } },
    order: [["createdAt", "DESC"]],
    include: { model: MembershipPlan, as: "membershipPlan", required: true },
  });
  if (!membership) {
    throw new HttpError(404, "membership not found");
  }

  const checkIn = new Date();
  const previous = await AttendanceLog.findOne({
    where: { member_id: memberId, membership_id: membership.id },
    order: [["createdAt", "DESC"]],
  });
  if (previous) {
    const hoursSince = (checkIn - new Date(previous.check_in)) / (1000 * 60 * 60);
    if (hoursSince < 23) {
      throw new HttpError(400, "already attended today");
    }
  }

  const attendance = await sequelize.transaction(async (transaction) => {
    const log = await AttendanceLog.create(
      {
        member_id: memberId,
        membership_id: membership.id,
        check_in: checkIn.toISOString(),
      },
      { transaction },
    );

    // Counted after the insert, so this check-in already uses up a ticket.
    const calc = await membershipCalculate(membership, memberId, { transaction });
    const status = resolveStatus(calc, membership.membershipPlan.plan_type);
    membership.status = status;
    member.activity_status = status;
    await membership.save({ transaction });
    await member.save({ transaction });
    return log;
  });

  return res
    .status(200)
    .json({ attendance: [attendance, { full_name: member.full_name }] });
});

//workoutPlan
adminRouter.get("/workout/:workoutType", admin_auth, async (req, res) => {
  const workouts = await WorkoutPlan.findAll({
    where: { workout_type: req.params.workoutType },
    include: { model: Video, as: "video" },
  });
  return res.status(200).json({ workout: await groupWorkoutsByType(workouts) });
});

adminRouter.get("/workouts", admin_auth, async (req, res) => {
  const workoutPlans = await WorkoutPlan.findAll({
    include: { model: Video, as: "video" },
  });
  return res.status(200).json({
    workoutPlan: await groupWorkoutsByType(workoutPlans, { withSizes: true }),
    length: workoutPlans.length,
  });
});

function assertWorkoutNumbers(data) {
  for (const key of ["workout_rep", "workout_sets"]) {
    if (data[key] === undefined) continue;
    const value = Number(data[key]);
    if (!Number.isInteger(value) || value < 1) {
      throw new HttpError(400, `${key} must be a whole number of at least 1`);
    }
  }
}

adminRouter.post(
  "/workout",
  admin_auth,
  uploadFields,
  cleanupOnError(async (req, res) => {
    const file = req.files?.file?.[0];
    if (!file) {
      throw new HttpError(400, "video missing");
    }
    if (!file.mimetype.startsWith("video/")) {
      throw new HttpError(400, "file must be a video");
    }

    const data = pick(parseMetadata(req), WORKOUT_FIELDS);
    for (const key of WORKOUT_FIELDS) {
      if (!data[key]) {
        throw new HttpError(400, `${key} missing`);
      }
    }
    assertWorkoutNumbers(data);

    await sequelize.transaction(async (transaction) => {
      const video = await Video.create({ path: uploadedPath(req) }, { transaction });
      await WorkoutPlan.create({ ...data, video_id: video.id }, { transaction });
    });
    return res.status(201).json({ workoutPlan: "workout created successfuly" });
  }),
);

adminRouter.delete("/workoutRemove/:workoutId", admin_auth, async (req, res) => {
  const workout = await WorkoutPlan.findByPk(
    requireUuid(req.params.workoutId, "workout id"),
    { include: { model: Video, as: "video" } },
  );
  if (!workout) {
    throw new HttpError(404, "workout not found");
  }

  await sequelize.transaction(async (transaction) => {
    await workout.destroy({ transaction });
    if (workout.video) {
      await workout.video.destroy({ transaction });
    }
  });
  await removeUpload(workout.video?.path);

  return res.status(200).json({ workout: "workout deleted successfuly" });
});

adminRouter.put(
  "/workoutUpdate",
  admin_auth,
  uploadFields,
  cleanupOnError(async (req, res) => {
    const updateData = parseMetadata(req);
    const workout = await WorkoutPlan.findByPk(
      requireUuid(updateData.id, "workout id"),
    );
    if (!workout) {
      throw new HttpError(404, "workout not found");
    }

    const changes = pick(updateData, WORKOUT_FIELDS);
    assertWorkoutNumbers(changes);
    workout.set(changes);

    const newPath = uploadedPath(req);
    let replacedPath;
    await sequelize.transaction(async (transaction) => {
      if (newPath) {
        const video = workout.video_id
          ? await Video.findByPk(workout.video_id, { transaction })
          : null;
        if (video) {
          replacedPath = video.path;
          video.path = newPath;
          await video.save({ transaction });
        } else {
          const created = await Video.create({ path: newPath }, { transaction });
          workout.video_id = created.id;
        }
      }
      await workout.save({ transaction });
    });
    await removeUpload(replacedPath);

    return res.status(200).json({ workout: "workout updated successfuly" });
  }),
);

//transaction
adminRouter.get("/transactions", admin_auth, async (req, res) => {
  const transactions = await TransactionHistory.findAll({
    include: [{ model: Member, as: "payer" }],
    // paid_at is free text from a form, so it cannot be sorted reliably.
    order: [["createdAt", "DESC"]],
  });
  return res.status(200).json({ transactions });
});

adminRouter.post("/transaction", admin_auth, async (req, res) => {
  const body = req.body;
  for (const key of [
    "payer_id",
    "membershipPlan_id",
    "payment_method",
    "amount",
    "payment_for",
    "paid_at",
  ]) {
    if (!body[key]) {
      throw new HttpError(400, `${key} missing`);
    }
  }
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount < 0) {
    throw new HttpError(400, "amount must be a whole number");
  }
  const paidAt = parseDayMonthYear(body.paid_at);

  const payer = await Member.findByPk(requireInt(body.payer_id, "payer_id"));
  if (!payer) {
    throw new HttpError(400, `${body.payer_id} don't exist`);
  }
  const plan = await MembershipPlan.findByPk(
    requireUuid(body.membershipPlan_id, "membershipPlan_id"),
  );
  if (!plan) {
    throw new HttpError(400, "membership plan not found");
  }

  await sequelize.transaction(async (transaction) => {
    if (body.isNew) {
      // Duration and ticket count come from the plan, never from the request.
      await startMembership({ member: payer, plan, startDate: paidAt }, { transaction });
    } else {
      if (!body.membership_id) {
        throw new HttpError(400, "membership id missing");
      }
      const membership = await Membership.findOne({
        where: {
          id: requireUuid(body.membership_id, "membership id"),
          member_id: payer.id,
        },
        include: { model: MembershipPlan, as: "membershipPlan", required: true },
        transaction,
      });
      if (!membership) {
        throw new HttpError(404, "membership not found");
      }
      await renewMembership(membership, { paidAt }, { transaction });
    }

    payer.activity_status = "Active";
    await payer.save({ transaction });

    await TransactionHistory.create(
      {
        payer_id: payer.id,
        membershipPlan_id: plan.id,
        payment_method: `${body.payment_method}-${req.adminName}`,
        amount,
        payment_for: body.payment_for,
        paid_at: paidAt.toISOString(),
        status: "Successfull",
      },
      { transaction },
    );
  });

  return res.status(201).json({ transaction: "transaction created successfuly" });
});

//membership
adminRouter.get("/membership/:memberId", admin_auth, async (req, res) => {
  const memberId = requireInt(req.params.memberId, "member id");
  const member = await Member.findByPk(memberId);
  if (!member) {
    throw new HttpError(404, "member not found");
  }
  const membership = await Membership.findOne({
    where: { member_id: memberId, status: "Active" },
    include: { model: MembershipPlan, as: "membershipPlan" },
  });
  if (!membership) {
    throw new HttpError(404, "membership not found");
  }
  return res.status(200).json({ membership });
});

//programs
adminRouter.get("/programs", admin_auth, async (req, res) => {
  const programs = await Program.findAll({
    limit: 50,
    order: [["createdAt", "DESC"]],
  });
  return res.status(200).json({ programs });
});

adminRouter.post("/programs", admin_auth, async (req, res) => {
  if (!req.body?.content) {
    throw new HttpError(400, "content missing");
  }
  await Program.create({ content: req.body.content });
  return res.status(200).json({ programs: "program successfuly created" });
});

adminRouter.delete("/programs/:id", admin_auth, async (req, res) => {
  await Program.destroy({ where: { id: requireUuid(req.params.id, "program id") } });
  return res.status(200).json({ programs: "deleted successfuly" });
});

export default adminRouter;
