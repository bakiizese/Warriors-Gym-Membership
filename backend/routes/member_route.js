import express from "express";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import AttendanceLog from "../models/AttendanceLog.js";
import Member from "../models/Member.js";
import Membership from "../models/Membership.js";
import MembershipPlan from "../models/MembershipPlan.js";
import Program from "../models/Program.js";
import TransactionHistory from "../models/TransactionHistory.js";
import Video from "../models/Video.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import { member_auth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";
import { cleanupOnError, uploadedPath } from "../services/files.js";
import {
  LIVE_STATUSES,
  renewMembership,
  startMembership,
} from "../services/membership.js";
import { updateProfile, withoutPassword } from "../services/profile.js";
import { groupWorkoutsByType } from "../services/workouts.js";
import { membershipCalculate } from "../utils/logic.js";
import { payment } from "../utils/payment.js";
import { parseMetadata, requireUuid } from "../utils/request.js";
import { uploadFields } from "../utils/upload.js";

const memberRouter = express.Router();

// Every membership lookup below is scoped to req.memberId: a member may only
// ever touch their own memberships. Prices, durations and ticket counts come
// from the plan row in the database, never from the request body.

//profile
memberRouter.get("/me", member_auth, async (req, res) => {
  const user = await Member.findByPk(req.memberId);
  return res.status(200).json({ member: user });
});

memberRouter.put(
  "/profile",
  member_auth,
  uploadFields,
  cleanupOnError(async (req, res) => {
    const updateData = parseMetadata(req);
    const user = await Member.scope("withPassword").findByPk(req.memberId);
    const { token } = await updateProfile({
      Model: Member,
      role: "member",
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

//membership_plans
memberRouter.get("/membership_plans", member_auth, async (req, res) => {
  const membershipPlans = await MembershipPlan.findAll({
    where: { status: "Active" },
  });
  return res.status(200).json({ membershipPlan: membershipPlans });
});

//membership
async function findOwnMembership(memberId, id) {
  const membership = await Membership.findOne({
    where: { id: requireUuid(id, "membership id"), member_id: memberId },
    include: { model: MembershipPlan, as: "membershipPlan", required: true },
  });
  if (!membership) {
    throw new HttpError(404, "membership not found");
  }
  return membership;
}

memberRouter.put("/membershipRenew", member_auth, async (req, res) => {
  const membership = await findOwnMembership(req.memberId, req.body?.membership_id);
  const member = await Member.findByPk(req.memberId);

  await sequelize.transaction(async (transaction) => {
    await renewMembership(membership, {}, { transaction });
    member.activity_status = "Active";
    await member.save({ transaction });
  });
  return res.status(200).json({ membership: "membership renewed successfuly" });
});

memberRouter.put("/membershipCancel", member_auth, async (req, res) => {
  const membership = await findOwnMembership(req.memberId, req.body?.id);
  const member = await Member.findByPk(req.memberId);

  await sequelize.transaction(async (transaction) => {
    membership.status = "Cancled";
    member.activity_status = "Inactive";
    await membership.save({ transaction });
    await member.save({ transaction });
  });
  return res.status(200).json({ membership: "membership successfuly cancled" });
});

// Simulated checkout: records a Pending payment and activates the membership.
// Real card/mobile-money charging arrives with the Chapa integration.
memberRouter.post("/membership/off", member_auth, async (req, res) => {
  const body = req.body ?? {};
  const memberId = req.memberId;
  const member = await Member.findByPk(memberId);

  const outcome = await sequelize.transaction(async (transaction) => {
    if (!body.isNew) {
      const membership = await findOwnMembership(memberId, body.id);
      const plan = membership.membershipPlan;
      await renewMembership(membership, {}, { transaction });
      await payment(
        {
          payer_id: memberId,
          membershipPlan_id: plan.id,
          payment_method: "Chapa",
          amount: plan.fee,
          payment_for: plan.membership_name,
        },
        { transaction },
      );
      return "renew success";
    }

    const plan = await MembershipPlan.findOne({
      where: { id: requireUuid(body.id, "plan id"), status: "Active" },
      transaction,
    });
    if (!plan) {
      throw new HttpError(404, "membership plan not found");
    }
    await startMembership({ member, plan }, { transaction });
    await payment(
      {
        payer_id: memberId,
        membershipPlan_id: plan.id,
        payment_method: "Chapa",
        amount: plan.fee,
        payment_for: plan.membership_name,
      },
      { transaction },
    );
    return "new success";
  });

  return res.status(200).json({ membership: outcome });
});

memberRouter.get("/membership", member_auth, async (req, res) => {
  const memberId = req.memberId;
  const membership = await Membership.findOne({
    where: { member_id: memberId, status: { [Op.in]: LIVE_STATUSES } },
    include: { model: MembershipPlan, as: "membershipPlan", required: true },
  });
  if (!membership) {
    throw new HttpError(404, "membership not found");
  }
  const membershipJson = await membershipCalculate(membership, memberId);
  return res.status(200).json({ membership: membershipJson });
});

//payments
memberRouter.get("/transactions", member_auth, async (req, res) => {
  const transactions = await TransactionHistory.findAll({
    where: { payer_id: req.memberId },
    order: [["createdAt", "DESC"]],
    limit: 30,
  });
  return res.status(200).json({ transactions });
});

//attendanceLog
memberRouter.get("/attendanceLog", member_auth, async (req, res) => {
  // Newest 20, presented oldest-first as the app expects.
  const recent = await AttendanceLog.findAll({
    where: { member_id: req.memberId },
    order: [["createdAt", "DESC"]],
    limit: 20,
  });
  const sorted = recent.sort(
    (a, b) => new Date(a.check_in) - new Date(b.check_in),
  );
  return res.status(200).json({ attendanceLog: sorted });
});

// Placeholder for the Chapa callback. Switch to POST and verify the tx_ref with
// Chapa before trusting it, and make it idempotent, when the integration lands.
memberRouter.get("/webhook/chapa/off", async (req, res) => {
  return res.status(200).json({ webhook: "testing" });
});

//workoutPlans
memberRouter.get("/workoutPlan", member_auth, async (req, res) => {
  const workoutPlans = await WorkoutPlan.findAll({
    include: { model: Video, as: "video" },
  });
  return res.status(200).json({
    workoutPlan: await groupWorkoutsByType(workoutPlans, { withSizes: true }),
    length: workoutPlans.length,
  });
});

//programs
memberRouter.get("/programs", member_auth, async (req, res) => {
  const programs = await Program.findAll({
    limit: 50,
    order: [["createdAt", "DESC"]],
  });
  return res.status(200).json({ programs });
});

export default memberRouter;
