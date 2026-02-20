import React, { useEffect, useState } from "react";
import CommonEdit from "./CommonEdit";
import ApiClient from "../utils/ApiClient";

const AddTransaction = ({
  setRemove,
  save,
  setLoading,
  loading,
  setErrorMessage,
  errorMessage,
}) => {
  const [transactionData, setTransactionData] = useState({
    payment_method: "Cash",
    payer_id: "",
    amount: "",
    payment_for: "",
    membershipPlan_id: "",
    isNew: true,
    ticket_amount: "",
    duration_days: "",
    membership_id: "",
  });
  const [membershipData, setMembershipData] = useState([]);

  const checkData = () => {
    const transactionKeys = [
      "payer_id",
      "amount",
      "payment_for",
      "membershipPlan_id",
    ];

    for (const key of transactionKeys) {
      if (!transactionData[key]) {
        setErrorMessage(
          ["amount", "payment_for", "membershipPlan_id"].includes(key)
            ? "membership missing"
            : `${key} missing`,
        );
        return;
      }
    }
    setErrorMessage("");
    setLoading(true);
    save(transactionData);
  };

  useEffect(() => {
    setErrorMessage("");

    const fetchMembership = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const res = await ApiClient.get("/admin/membership_plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembershipData(res.data.membershipPlan);
      } catch (err) {
        console.log(err);
      }
    };
    fetchMembership();
  }, []);

  const fetchExistMembership = async () => {
    if (!transactionData.payer_id) {
      setErrorMessage("enter payer id first");
      return 0;
    }
    const token = localStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get(
        `/admin/membership/${transactionData.payer_id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const fetchedData = res.data.membership;
      setTransactionData((prev) => ({
        ...prev,
        amount: fetchedData.membershipPlan.fee,
        membershipPlan_id: fetchedData.membershipPlan.id,
        ticket_amount: fetchedData.membershipPlan.ticket_amount,
        duration_days: fetchedData.membershipPlan.duration_days,
        payment_for:
          fetchedData.membershipPlan.duration_days / 30 +
          " " +
          fetchedData.membershipPlan.membership_name,
        membership_id: fetchedData.id,
      }));
      return 1;
    } catch (err) {
      if (err.response?.status === 404) {
        setErrorMessage(
          err.response?.data?.error === "member not found"
            ? `member ${transactionData.payer_id} not found`
            : "no previous membership",
        );
        return 0;
      }
      console.log(err);
      return 0;
    }
  };

  return (
    <CommonEdit
      errorMessage={errorMessage}
      checkData={checkData}
      setRemove={setRemove}
      loading={loading}
      title="Add Transaction"
    >
      <div className="flex flex-col gap-2 w-full px-4 my-2">
        <div className="flex justify-between items-center gap-3 bg-[#2A2A2C]/90 rounded-2xl h-[48px] px-2 w-full">
          <div className="bg-[#4CA24F] py-[2px] px-2 rounded-xl">
            <p className="text-white text-[18px] font-jura-bold">
              Payment type
            </p>
          </div>
          <button
            onClick={() =>
              setTransactionData((prev) => ({
                ...prev,
                payment_method:
                  prev.payment_method === "Cash" ? "Transfer" : "Cash",
              }))
            }
            className="bg-[#777676] px-3 py-1 rounded-2xl text-white font-jura-bold text-[23px]"
          >
            {transactionData.payment_method}
          </button>
        </div>

        <div className="flex justify-between items-center gap-3 bg-[#2A2A2C]/90 rounded-2xl h-[48px] px-2 w-full">
          <div className="bg-[#4CA24F] py-[2px] px-2 rounded-xl">
            <p className="text-white text-[18px] w-[65px] font-jura-bold">
              Payer id
            </p>
          </div>
          <input
            value={transactionData.payer_id}
            type="text"
            placeholder="Id number"
            className="text-white bg-transparent h-full text-[18px] font-jura w-full outline-none"
            onChange={(e) =>
              setTransactionData((prev) => ({
                ...prev,
                payer_id: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex gap-10 justify-center items-center h-8 w-full">
          <button
            className={`border-2 border-[#787878] rounded-xl px-4 h-10 ${
              transactionData.isNew ? "bg-[#00FF00]/60" : "bg-[#4CA24F]/30"
            } text-white text-[22px] font-jura-bold`}
            onClick={() =>
              setTransactionData((prev) => ({ ...prev, isNew: true }))
            }
          >
            New
          </button>
          <button
            className={`border-2 border-[#787878] rounded-xl px-2 h-10 ${
              !transactionData.isNew ? "bg-[#00FF00]/60" : "bg-[#4CA24F]/30"
            } text-white text-[22px] font-jura-bold`}
            onClick={async () => {
              const check = await fetchExistMembership();
              if (check) {
                setTransactionData((prev) => ({ ...prev, isNew: false }));
              }
            }}
          >
            Renew
          </button>
        </div>

        <div className="flex justify-between items-center gap-3 bg-[#2A2A2C]/90 rounded-2xl h-[48px] px-2 w-full">
          <div className="bg-[#4CA24F] py-[2px] px-2 rounded-xl">
            <p className="text-white text-[18px] font-jura-bold">Amount</p>
          </div>
          <p className="text-white font-jura-bold text-[18px]">
            {transactionData.amount} Birr
          </p>
        </div>

        {membershipData.length > 0 ? (
          <div className="flex overflow-x-scroll h-[150px] gap-2 py-2 w-[100%]">
            {membershipData.map((item, index) => (
              <div
                key={index}
                className={`flex flex-col justify-evenly items-center rounded-xl px-2 relative ${
                  transactionData.membershipPlan_id === item.id
                    ? "bg-opacity-100"
                    : "bg-opacity-70"
                }`}
                style={{
                  background: `linear-gradient(180deg, #2148E499 0%, #479AF999 100%)`,
                  opacity:
                    transactionData.membershipPlan_id === item.id ? 1 : 0.4,
                }}
                onClick={() =>
                  transactionData.isNew &&
                  setTransactionData((prev) => ({
                    ...prev,
                    payment_for:
                      item.duration_days / 30 + " " + item.membership_name,
                    amount: item.fee,
                    membershipPlan_id: item.id,
                    ticket_amount: item.ticket_amount,
                    duration_days: item.duration_days,
                  }))
                }
              >
                <p className="text-white text-[20px] font-jura text-center w-[130px]">
                  {item.duration_days / 30 + " " + item.membership_name}
                </p>
                <p className="text-white text-[20px] font-jura text-center  w-[100px]">
                  {item.plan_type === "Ticket"
                    ? item.ticket_amount + " Ticket"
                    : "Daily"}
                </p>
                <p className="text-white text-[20px] font-jura text-center">
                  ${item.fee}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-800 text-center font-jura text-[20px]">
            *No Membership Found
          </p>
        )}
      </div>
    </CommonEdit>
  );
};

export default AddTransaction;
