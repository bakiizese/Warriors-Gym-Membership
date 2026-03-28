import express from "express";
import { member_auth } from "./middlewares.js";
import Member from "../models/Member.js";
import MembershipPlan from "../models/MembershipPlan.js";
import { verify_password } from "../utils/password.js";
import TransactionHistory from "../models/TransactionHistory.js";
import Membership from "../models/Membership.js";
import AttendanceLog from "../models/AttendanceLog.js";
import { Op } from "sequelize";
import { gen_jwt_token, jwt_verify } from "../utils/jwt.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import Video from "../models/Video.js";
import { payment } from "../utils/payment.js";
import { addDays } from "date-fns";
import { uploadFields } from "../utils/upload.js";
import fs from "fs";
import path from "path";
import { membershipCalculate } from "../utils/logic.js";
import Program from "../models/Program.js";

const memberRouter = express.Router();

//profile
memberRouter.get("/me", member_auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const user = await Member.findOne({
      where: { id: memberId },
    });
    return res.status(200).json({ member: user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

memberRouter.put("/profile", uploadFields, member_auth, async (req, res) => {
  try {
    let filePath = "";
    if (req.files && req.files.file) {
      if (req.files.file[0]?.path) {
        filePath = req.files.file[0]?.path;
      }
    }

    const memberId = req.memberId;
    const updateData = JSON.parse(req.body.metadata);
    const user = await Member.findOne({ where: { id: memberId } });
    for (const key in updateData) {
      if (
        ![
          "id",
          "createdAt",
          "updatedAt",
          "oldPassword",
          "confirmPassword",
          "password",
          "phone_number",
          "image",
          "activity_status",
        ].includes(key)
      ) {
        if (user[key]) {
          user[key] = updateData[key];
        }
      }
    }
    if (user.image && filePath) {
      fs.unlink(user["image"], (err) => {
        if (err) {
          console.log("unable to remove image");
        } else {
          console.log("image removed successfully");
          user["image"] = null;
        }
      });
    }

    if (typeof filePath === "string" && filePath) {
      user["image"] = filePath;
    }

    if (updateData["oldPassword"] && updateData["oldPassword"] !== "") {
      const checkPassword = await verify_password(
        updateData["oldPassword"],
        user.password,
      );
      if (!checkPassword) {
        return res.status(400).json({ error: "incorrect oldPassword" });
      }
      const hash_password = await hash_password(updateData["password"]);
      user.password = hash_password;
    }

    if (
      updateData["phone_number"] &&
      updateData["phone_number"] !== user.phone_number
    ) {
      const userCheck = await Member.findOne({
        where: { phone_number: updateData["phone_number"] },
      });
      if (userCheck) {
        return res.status(400).json({ error: "phone number exists" });
      }
      const newToken = gen_jwt_token({
        id: user.id,
        phone_number: updateData["phone_number"],
      });

      user.phone_number = updateData["phone_number"];
      user.save();
      return res.status(200).json({ token: newToken, user: user });
    }
    user.save();
    return res.status(200).json({ user: "successfully updated" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//membership_plans
memberRouter.get("/membership_plans", member_auth, async (req, res) => {
  try {
    const membershipPlans = await MembershipPlan.findAll({
      where: { status: "Active" },
    });
    return res.status(200).json({ membershipPlan: membershipPlans });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//membership
// memberRouter.post("/membership", member_auth, async (req, res) => {
//   try {
//     const memberId = req.memberId;
//     const newData = req.body;
//     newData.member_id = memberId;

//     const start_date = new Date();
//     const end_date = new Date(start_date);
//     end_date.setDate(end_date.getDate() + Number(newData.duration_days));

//     newData["start_date"] = String(start_date);
//     newData["end_date"] = String(end_date);

//     delete newData.durations_days;

//     await Membership.create(newData);
//     const member = await Member.findOne({ where: { id: memberId } });
//     member.status = "Active";
//     member.save();
//     return res
//       .status(201)
//       .json({ membership: "membership created successfuly" });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ error: err });
//   }
// });

memberRouter.put("/membershipRenew", member_auth, async (req, res) => {
  try {
    const membershipData = req.body;
    const memberId = req.memberId;

    const membership = await Membership.findOne({
      where: { id: membershipData.membership_id },
      include: { model: MembershipPlan, as: "membershipPlan", required: true },
    });
    const member = await Member.findOne({ where: { id: memberId } });

    const currentDate = new Date();
    const base_date =
      membership.end_date > currentDate ? membership.end_date : currentDate;

    membership.end_date = new Date(membership.end_date);
    membership.end_date.setDate(
      base_date.getDate() + membershipData.duration_days,
    );

    membership.status = membershipData.status;
    membership.end_date = membership.end_date.toISOString();
    //update ticket amount to in the membership

    if (membership.membershipPlan.plan_type === "Ticket") {
      membership.ticket =
        membership.ticket + membership.membershipPlan.ticket_amount;
    }
    member.activity_status = "Active";
    member.save();

    membership.save();
    return res
      .status(200)
      .json({ membership: "membership renewed successfuly" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

memberRouter.put("/membershipCancel", member_auth, async (req, res) => {
  try {
    const membershipId = req.body;
    const memberId = req.memberId;
    const membership = await Membership.findOne({
      where: { id: membershipId.id },
    });
    const member = await Member.findOne({ where: { id: memberId } });

    if (!membership) {
      return res.status(404).json({ error: "membership not found" });
    }
    membership.status = "Cancled";
    member.activity_status = "Inactive";
    member.save();
    membership.save();

    return res.status(200).json({ error: "membership successfuly cancled" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

memberRouter.post("/membership/off", member_auth, async (req, res) => {
  try {
    let newData = req.body;
    const memberId = req.memberId;

    if (!newData.isNew) {
      const membership = await Membership.findOne({
        where: { id: newData.id },
        include: { model: MembershipPlan, as: "membershipPlan" },
      });

      if (!membership) {
        return res.status(500).json({ error: "unable to renew membership" });
      }

      const member = await Member.findOne({ where: { id: memberId } });

      const currentDate = new Date();
      const end_date = new Date(membership.end_date);

      const base_date =
        end_date > currentDate ? membership.end_date : currentDate;

      membership.end_date = addDays(
        base_date,
        membership.membershipPlan.duration_days,
      );
      membership.end_date = membership.end_date.toISOString();

      if (membership.membershipPlan.plan_type === "Ticket") {
        membership.ticket =
          membership.ticket + membership.membershipPlan.ticket_amount;
      }

      const paymentData = {
        payer_id: memberId,
        membershipPlan_id: membership.membership_plan_id,
        payment_method: "Chapa",
        amount: membership.membershipPlan.fee,
        payment_for: membership.membershipPlan.membership_name,
      };

      const makePayment = await payment(paymentData);

      if (!makePayment) {
        console.log("error creating payment");
        return res.status(500).json({ membership: "unsuccessful" });
      }

      membership.status = "Active";
      member.activity_status = "Active";
      member.save();
      membership.save();

      console.log("membership exists so renew membership");
      return res.status(200).json({ membership: "renew success" });
    }

    console.log("membership dont exist so New membership");

    const membershipCheck = await Membership.findAll({
      where: {
        member_id: memberId,
        status: { [Op.in]: ["Active", "Payment Due"] },
      },
    });

    if (membershipCheck.length > 0) {
      for (const membership of membershipCheck) {
        membership.status = "Inactive";
        membership.save();
      }
    }

    const start_date = new Date();
    const end_date = new Date(start_date);

    end_date.setDate(end_date.getDate() + Number(newData.duration_days));

    const newMembershipData = {
      member_id: memberId,
      membership_plan_id: newData.id,
      start_date: String(start_date),
      end_date: String(end_date),
      ticket: newData.ticket_amount,
      status: "Active",
    };

    const newMembership = await Membership.create(newMembershipData);

    if (!newMembership) {
      return res.status(500).json({ error: "unable to create new membership" });
    }

    const paymentData = {
      payer_id: memberId,
      membershipPlan_id: newData.id,
      payment_method: "Chapa",
      amount: newData.fee,
      payment_for: newData.membership_name,
    };

    const makePayment = await payment(paymentData);

    if (!makePayment) {
      console.log("error creating payment");
      return res.status(500).json({ membership: "unsuccessful" });
    }
    return res.status(200).json({ membership: "new success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

memberRouter.get("/membership", member_auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const membership = await Membership.findOne({
      where: {
        member_id: memberId,
        status: { [Op.in]: ["Active", "Payment Due"] },
      },
      include: { model: MembershipPlan, as: "membershipPlan", required: true },
    });
    if (!membership) {
      return res.status(404).json({ error: "membership not found" });
    }

    const membershipJson = await membershipCalculate(membership, memberId);

    return res.status(200).json({ membership: membershipJson });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//payment
// memberRouter.post("/payment", member_auth, async (req, res) => {
//   try {
//     const memberId = req.memberId;
//     let paymentData = req.body;
//     const paymentKeys = [
//       "payment_method",
//       "amount",
//       "payment_for",
//       "membershipPlan_id",
//     ];

//     for (const key of paymentKeys) {
//       if (!paymentData[key]) {
//         return res.status(400).json({ error: `${key} missing` });
//       }
//     }
//     paymentData.payer_id = memberId;
//     paymentData.status = "Pending";
//     paymentData.paid_at = String(new Date());

//     const createPayment = await TransactionHistory.create(paymentData);

//     if (!createPayment) {
//       return res.status(500).json({ error: "unable to create transaction" });
//     }

//     const updateUser = await Member.findOne({ where: { id: memberId } });

//     const userName = updateUser.full_name.split(" ");
//     const chapaPayload = {
//       payment_id: createPayment.id,
//       first_name: userName?.[0],
//       last_name: userName?.[1] || "",
//       amount: paymentData["amount"],
//       phone_number: "0941335364",
//     };

//     const chapa = await chapaPayment(chapaPayload);

//     if (!chapa) {
//       return res.status(500).json({ error: "chapa error" });
//     }

//     updateUser.activity_status = "Active";
//     updateUser.save();

//     return res.status(201).json({
//       payment: "transaction saved successfully",
//       checkout_url: chapa,
//     });
//   } catch (err) {
//     console.log("Err", err);
//     return res.status(500).json({ error: err });
//   }
// });

memberRouter.get("/transactions", member_auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const transactions = await TransactionHistory.findAll({
      where: { payer_id: memberId },
      limit: 30,
    });
    return res.status(200).json({ transactions: transactions });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

//attendanceLog
memberRouter.get("/attendanceLog", member_auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const attendanceLog = await AttendanceLog.findAll({
      where: { member_id: memberId },
      limit: 20,
    });

    const sorted = attendanceLog.sort(
      (a, b) => new Date(a.check_in) - new Date(b.check_in),
    );

    return res.status(200).json({ attendanceLog: sorted });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//use a different token to check, change request to POST in production
memberRouter.get("/webhook/chapa/off", async (req, res) => {
  //update payment db to be same status as the sent from chapa
  //by calling chapa for virfication on the transaction using tx_ref
  //make it idompotent as chapa might send multiple request to the same tx_ref
  //first check if the tx_ref and the my id exists and if it is success....then its should be
  //updated again and again
  console.log("in webhook");
  const chapaWebhook = req.body;
  console.log(chapaWebhook);
  return res.status(200).json({ webhook: "testing" });
});

//workoutPlans
memberRouter.get("/workoutPlan", member_auth, async (req, res) => {
  try {
    const workoutPlans = await WorkoutPlan.findAll({
      include: { model: Video, as: "video" },
    });
    const len = workoutPlans.length;
    const sorted = workoutPlans.reduce((acc, workout) => {
      const key = workout.workout_type;

      const videoPath = path.resolve(workout.video.path);
      const stats = fs.statSync(videoPath);
      workout.video.dataValues.size = stats.size;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(workout);
      return acc;
    }, {});

    return res.status(200).json({ workoutPlan: sorted, length: len });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

//programs
memberRouter.get("/programs", member_auth, async (req, res) => {
  try {
    const programs = await Program.findAll({
      limit: 50,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ programs: programs });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

export default memberRouter;
