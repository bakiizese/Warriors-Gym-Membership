import Member from "../models/Member.js";
import TransactionHistory from "../models/TransactionHistory.js";

export const payment = async (paymentData) => {
  try {
    const paymentKeys = [
      "payment_method",
      "amount",
      "payment_for",
      "membershipPlan_id",
    ];

    for (const key of paymentKeys) {
      if (!paymentData[key]) {
        console.log(`${key} missing`);
        return;
      }
    }
    paymentData.status = "Pending";
    paymentData.paid_at = String(new Date());

    const createPayment = await TransactionHistory.create(paymentData);

    if (!createPayment) {
      console.log("unable to create transaction");
      return;
    }

    const updateUser = await Member.findOne({
      where: { id: paymentData.payer_id },
    });

    //   const userName = updateUser.full_name.split(" ");
    //   const chapaPayload = {
    //     payment_id: createPayment.id,
    //     first_name: userName?.[0],
    //     last_name: userName?.[1] || "",
    //     amount: paymentData["amount"],
    //     phone_number: "0941335364",
    //   };

    //   const chapa = await chapaPayment(chapaPayload);

    //   if (!chapa) {
    //     return res.status(500).json({ error: "chapa error" });
    //   }

    updateUser.activity_status = "Active";
    updateUser.save();

    return createPayment.id;
    // return res.status(201).json({
    //   payment: "transaction saved successfully",
    //   checkout_url: chapa,
    // });
  } catch (err) {
    console.log("Err", err);
    return;
  }
};

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
