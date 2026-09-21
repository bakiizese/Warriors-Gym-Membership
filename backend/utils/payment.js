import Member from "../models/Member.js";
import TransactionHistory from "../models/TransactionHistory.js";
import { HttpError } from "../middleware/errors.js";

const REQUIRED = ["payment_method", "amount", "payment_for", "membershipPlan_id"];

// Records a Pending transaction and marks the member active. No money moves
// here: real checkout goes through chapaPayment below once it is enabled.
// Throws on failure so callers can roll back the surrounding DB transaction.
export const payment = async (paymentData, { transaction } = {}) => {
  for (const key of REQUIRED) {
    if (!paymentData[key]) {
      throw new HttpError(400, `${key} missing`);
    }
  }

  const member = await Member.findByPk(paymentData.payer_id, { transaction });
  if (!member) {
    throw new HttpError(404, "member not found");
  }

  const record = await TransactionHistory.create(
    {
      payer_id: member.id,
      membershipPlan_id: paymentData.membershipPlan_id,
      payment_method: paymentData.payment_method,
      amount: paymentData.amount,
      payment_for: paymentData.payment_for,
      status: "Pending",
      paid_at: new Date().toISOString(),
    },
    { transaction },
  );

  member.activity_status = "Active";
  await member.save({ transaction });

  return record.id;
};

// Not wired into a route yet (the checkout flow is disabled). Configure with
// CHAPA_SECRET_KEY and CHAPA_CALLBACK_URL before enabling it.
export const chapaPayment = async (chapaPayload) => {
  const secretKey = process.env.CHAPA_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CHAPA_SECRET_KEY is not set");
  }
  var myHeaders = new Headers();
  ///handle error correctly
  myHeaders.append("Authorization", `Bearer ${secretKey}`);
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    amount: chapaPayload.amount,
    currency: "ETB",
    first_name: chapaPayload.first_name,
    last_name: chapaPayload.last_name,
    phone_number: chapaPayload.phone_number,
    tx_ref: chapaPayload.payment_id,
    callback_url: process.env.CHAPA_CALLBACK_URL,
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
