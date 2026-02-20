import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonEdit from "./CommonEdit";
import dumbbell from "../assets/icons/dumbbell.png";

const Add = ({
  setRemove,
  save,
  setLoading,
  loading,
  setErrorMessage,
  errorMessage,
  prevData = null,
}) => {
  const navigate = useNavigate();
  const [membershipData, setMembershipData] = useState({
    membership_name: prevData?.membership_name || "",
    plan_type: prevData?.plan_type || "Daily",
    ticket_amount: prevData?.ticket_amount || 0,
    fee: prevData?.fee || 0,
    description: prevData?.description || "\u25CF ",
    status: prevData?.status || "Active",
    duration_days: prevData?.duration_days || 0,
  });

  const membershipKeys = [
    "fee",
    "membership_name",
    "plan_type",
    "ticket_amount",
    "description",
    "status",
    "duration_days",
  ];

  const checkData = () => {
    for (const key of membershipKeys) {
      if (!membershipData[key]) {
        if (key === "ticket_amount" && membershipData.plan_type === "Ticket") {
          setErrorMessage(`${key} is empty`);
          return;
        } else if (key !== "ticket_amount") {
          setErrorMessage(`${key} is empty`);
          return;
        }
      }
    }
    setErrorMessage("");
    setLoading(true);
    save(membershipData, prevData ? prevData.id : "");
  };

  const calDurationDays = (month) => {
    const days = month * 30;
    setMembershipData((prev) => ({ ...prev, duration_days: days }));
  };

  return (
    <CommonEdit
      errorMessage={errorMessage}
      checkData={checkData}
      setRemove={setRemove}
      loading={loading}
      title="Add Membership"
    >
      <div className="flex flex-col items-center gap-4 px-4 w-full">
        <div className="relative w-[290px] mx-auto rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-[#2148E499] to-[#479AF999] p-4">
          <img src={dumbbell} alt="Dumbbell" className="h-8 w-12 mb-2" />
          <div className="flex items-center gap-2">
            <p className="text-white text-[50px] font-jura-bold">$</p>
            <input
              type="number"
              placeholder="Fee"
              value={membershipData.fee}
              onChange={(e) =>
                setMembershipData((prev) => ({
                  ...prev,
                  fee: Number(e.target.value),
                }))
              }
              className="text-white text-[50px] font-jura-bold text-center bg-transparent border border-white/40 rounded-md w-[120px]"
            />
          </div>
          <div className="h-1 w-[95%] bg-[#55318D]/80 mt-2" />
        </div>

        <div className="flex flex-row gap-2 w-[80%] justify-center">
          <input
            type="number"
            value={membershipData.duration_days / 30}
            onChange={(e) => calDurationDays(Number(e.target.value))}
            className="text-white text-[25px] bg-black/20 font-jura-bold text-center w-[80px] border border-white/40 rounded-md h-[45px] px-2"
            placeholder="0"
          />
          <input
            type="text"
            value={membershipData.membership_name}
            onChange={(e) =>
              setMembershipData((prev) => ({
                ...prev,
                membership_name: e.target.value,
              }))
            }
            className="text-white text-[20px] bg-black/20 font-jura-bold w-[200px] text-center border border-white/40 rounded-md h-[45px] px-2"
            placeholder="Membership name"
          />
        </div>

        <textarea
          value={membershipData.description}
          onChange={(e) =>
            setMembershipData((prev) => ({
              ...prev,
              description: e.target.value.endsWith("\n")
                ? e.target.value + "\u25CF "
                : e.target.value,
            }))
          }
          placeholder="Description"
          className="w-[90%] text-white text-[16px] font-jura-bold border bg-black/20 border-white/40 rounded-md p-2"
          rows={4}
        />

        <div className="flex justify-between items-center w-[90%] bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px]">
          <div className="bg-[#4CA24F] py-1 px-2 rounded-xl w-[100px] text-center">
            <p className="text-white font-jura-bold">Status</p>
          </div>
          <button
            onClick={() =>
              setMembershipData((prev) => ({
                ...prev,
                status: prev.status === "Active" ? "Inactive" : "Active",
              }))
            }
            className={`px-5 rounded-2xl ${
              membershipData.status === "Active"
                ? "bg-[#4CA24F]"
                : "bg-[#777676]"
            } text-white text-[23px] font-jura-bold`}
          >
            {membershipData.status}
          </button>
        </div>

        <div className="flex justify-between items-center w-[90%] bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px]">
          <div className="bg-[#4CA24F] py-1 px-2 rounded-xl w-[120px] text-center">
            <p className="text-white font-jura-bold">Plan type</p>
          </div>
          <button
            onClick={() =>
              setMembershipData((prev) => ({
                ...prev,
                plan_type: prev.plan_type === "Ticket" ? "Daily" : "Ticket",
              }))
            }
            className="px-5 rounded-2xl bg-[#777676] text-white text-[23px] font-jura-bold"
          >
            {membershipData.plan_type}
          </button>
        </div>

        {membershipData.plan_type === "Ticket" && (
          <div className="flex justify-between items-center w-[90%] bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px]">
            <div className="bg-[#4CA24F] py-1 px-2 rounded-xl text-center">
              <p className="text-white font-jura-bold w-[150px]">
                Ticket amount
              </p>
            </div>
            <input
              type="number"
              value={membershipData.ticket_amount}
              onChange={(e) =>
                setMembershipData((prev) => ({
                  ...prev,
                  ticket_amount: Number(e.target.value),
                }))
              }
              placeholder="0"
              className="text-white w-14 text-[23px] font-jura-bold bg-transparent text-center"
            />
          </div>
        )}
      </div>
    </CommonEdit>
  );
};

export default Add;
