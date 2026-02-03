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

memberRouter.put("/profile", member_auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const updateData = req.body;
    const user = await Member.findOne({ where: { id: memberId } });

    for (const key in updateData) {
      if (
        ![
          "id",
          "createdAt",
          "updatedAt",
          "oldPassword",
          "password",
          "phone_number",
        ].includes(key)
      ) {
        if (user[key]) {
          user[key] = updateData[key];
        }
      }
    }
    if (updateData["oldPassword"] !== "") {
      const checkPassword = await verify_password(
        updateData["oldPassword"],
        user.password,
      );
      if (!checkPassword) {
        return res.status(400).json({ error: "incorrect oldPassword" });
      }
      const hash_password = hash_password(updateData["password"]);
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
memberRouter.post("/membership", member_auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const newData = req.body;
    newData.member_id = memberId;

    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + Number(newData.duration_days));

    newData["start_date"] = String(start_date);
    newData["end_date"] = String(end_date);

    delete newData.durations_days;

    await Membership.create(newData);
    const member = await Member.findOne({ where: { id: memberId } });
    member.status = "Active";
    member.save();
    return res
      .status(201)
      .json({ membership: "membership created successfuly" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

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

///this should be in the admin
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
    const member = await Member.findOne({ where: { id: memberId } });

    const now = new Date();
    // const now = new Date("2026-02-24T13:48:36.601Z");

    const end = new Date(membership?.end_date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const daysLeft = Math.floor((endDay - today) / (1000 * 60 * 60 * 24));

    const membershipJson = membership.toJSON();

    if (daysLeft <= 0) {
      member.activity_status = "Inactive";
      membership.status = "Inactive";
    } else if (daysLeft < 5) {
      member.activity_status = "Payment Due";
      membership.status = "Payment Due";
    }
    if (membership.membershipPlan.plan_type === "Ticket") {
      const attendance = await AttendanceLog.count({
        where: { member_id: memberId, membership_id: membership.id },
      });
      const remainingTicket = membership.ticket - attendance;

      if (remainingTicket < 3) {
        member.activity_status = "Payment Due";
        membership.status = "Payment Due";
      } else if (remainingTicket <= 0) {
        member.activity_status = "Inactive";
        membership.status = "Inactive";
      }
      membershipJson.remainingTicket = remainingTicket;
    }
    membershipJson.daysLeft = daysLeft;

    member.save();
    membership.save();

    return res.status(200).json({ membership: membershipJson });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//payment
memberRouter.post("/payment", member_auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    let paymentData = req.body;
    const paymentKeys = [
      "payment_method",
      "amount",
      "payment_for",
      "membershipPlan_id",
    ];

    for (const key of paymentKeys) {
      if (!paymentData[key]) {
        return res.status(400).json({ error: `${key} missing` });
      }
    }
    paymentData.payer_id = memberId;
    paymentData.status = "Pending";
    paymentData.paid_at = String(new Date());

    const createPayment = await TransactionHistory.create(paymentData);

    if (!createPayment) {
      return res.status(500).json({ error: "unable to create transaction" });
    }

    const updateUser = await Member.findOne({ where: { id: memberId } });

    const userName = updateUser.full_name.split(" ");
    const chapaPayload = {
      payment_id: createPayment.id,
      first_name: userName?.[0],
      last_name: userName?.[1] || "",
      amount: paymentData["amount"],
      phone_number: "0941335364",
    };

    const chapa = await chapaPayment(chapaPayload);

    if (!chapa) {
      return res.status(500).json({ error: "chapa error" });
    }

    updateUser.activity_status = "Active";
    updateUser.save();

    return res.status(201).json({
      payment: "transaction saved successfully",
      checkout_url: chapa,
    });
  } catch (err) {
    console.log("Err", err);
    return res.status(500).json({ error: err });
  }
});

memberRouter.get("/transactions", member_auth, async (req, res) => {
  try {
    const memberId = req.memberId;
    const transactions = await TransactionHistory.findAll({
      where: { payer_id: memberId },
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
    });
    return res.status(200).json({ attendanceLog: attendanceLog });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
});

//use a different token to check, change request to POST in production
memberRouter.get("/webhook/chapa", async (req, res) => {
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

const chapaPayment = async (chapaPayload) => {
  console.log("in chapa");
  var myHeaders = new Headers();
  ///use .env for secrate key
  ///handle error correctly
  myHeaders.append(
    "Authorization",
    "Bearer CHASECK_TEST-19VF66JrpQoGAaGT573XXlwUtrxDuNxT",
  );
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    amount: chapaPayload.amount,
    currency: "ETB",
    first_name: chapaPayload.first_name,
    last_name: chapaPayload.last_name,
    phone_number: chapaPayload.phone_number,
    tx_ref: chapaPayload.payment_id,
    callback_url:
      "https://readier-floy-temperately.ngrok-free.dev/member/webhook/chapa",
    // return_url: "https://www.google.com/",
    "customization[title]": "Membership Payment",
    "customization[description]": "Month 2",
    "meta[hide_receipt]": "true",
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const ch = await fetch(
    "https://api.chapa.co/v1/transaction/initialize",
    requestOptions,
  );

  if (!ch.ok) {
    console.log(ch);
  }
  const resultJson = await ch.json();

  ///instead of returning redirect user from here
  // return res.redirect(checkOut);
  if (resultJson?.data?.checkout_url) {
    const checkOut = resultJson.data.checkout_url;
    return checkOut;
  }
};

export default memberRouter;
