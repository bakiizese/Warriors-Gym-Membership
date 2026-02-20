import React, { useEffect, useState } from "react";
import AppGradient from "../Component/AppGradient";
import { useNavigate } from "react-router-dom";
import Add from "../Component/AddMembership";
import ApiClient from "../utils/ApiClient";
import Confirmation from "../Component/Confirmation";

const ManageMembershipPlans = () => {
  const navigate = useNavigate();

  const [updateMembership, setUpdateMembership] = useState(false);
  const [membershipData, setMembershipData] = useState([]);
  const [reloadFetch, setReloadFetch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    offlineData();

    const fetchMembership = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const res = await ApiClient.get("/admin/membership_plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedData = res.data;
        localStorage.setItem(
          "membershipPlan",
          JSON.stringify(fetchedData.membershipPlan),
        );
        setMembershipData(fetchedData.membershipPlan);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMembership();
  }, [reloadFetch]);

  const offlineData = () => {
    const membershipPlan = localStorage.getItem("membershipPlan");
    if (membershipPlan) setMembershipData(JSON.parse(membershipPlan));
  };

  const save = async (saveData, membershipId = null) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = membershipId
        ? await ApiClient.put(
            `/admin/membership_plan/${membershipId}`,
            saveData,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
        : await ApiClient.post("/admin/membership_plan", saveData, {
            headers: { Authorization: `Bearer ${token}` },
          });

      setLoading(false);
      setUpdateMembership(false);
      setReloadFetch(!reloadFetch);
    } catch (err) {
      console.log(err);
      setLoading(false);
      setErrorMessage("An error occurred");
    }
  };

  const deleteMembership = async (membershipId) => {
    setConfirm(false);
    const token = localStorage.getItem("adminToken");
    try {
      await ApiClient.delete(`/admin/membership_plan/${membershipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReloadFetch(!reloadFetch);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AppGradient>
      <div className="flex flex-col min-h-screen">
        <div className="flex justify-between items-center px-6 my-4">
          <p className="text-white text-[20px] font-jura text-center leading-none">
            {membershipData.length}
          </p>
          <button
            className="bg-[#56C556] rounded-[25px] h-[45px] w-[140px] flex items-center justify-center"
            onClick={() => setUpdateMembership("addNew")}
          >
            <p className="text-white text-[20px] font-jura text-center leading-none">
              Add Membership
            </p>
          </button>
        </div>

        <div className="flex-1 px-3 overflow-y-auto">
          {membershipData.map((membershipItem) => (
            <div
              key={membershipItem.id}
              className="relative flex flex-row justify-between w-full h-[120px] px-3 py-2 my-1 bg-[#425CB1]/50 rounded-2xl overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 h-3 w-36 ${
                  membershipItem.status === "Active"
                    ? "bg-[#4CA24F]"
                    : "bg-[#868686]"
                }`}
              />

              <div className="flex flex-col justify-evenly items-start">
                <p className="text-white text-[20px] font-jura text-center leading-none">
                  {membershipItem.membership_name}
                </p>
                <p className="text-white text-[20px] font-jura text-center leading-none">
                  {membershipItem.plan_type}
                </p>
                <p className="text-white text-[20px] font-jura text-center leading-none">
                  ${membershipItem.fee}
                </p>
              </div>

              <div className="flex flex-col justify-evenly items-start">
                {membershipItem?.description?.split("\n").map((item, idx) => (
                  <p
                    key={idx}
                    className="text-white text-[15px] font-jura text-center leading-none"
                  >
                    {item}
                  </p>
                ))}
              </div>

              <div className="flex flex-col justify-between items-center">
                <div className="bg-[#AC8C2D]/70 py-1 px-4 rounded-2xl">
                  <p className="text-white text-[30px] font-jura text-center leading-none">
                    {membershipItem.memberships.length}
                  </p>
                </div>
                <button
                  className="bg-[#777676] px-4 py-1 rounded-2xl"
                  onClick={() => {
                    setSelectedMembership(membershipItem);
                    setUpdateMembership("update");
                  }}
                >
                  <p className="text-white text-[20px] font-jura-bold text-center leading-none">
                    Edit
                  </p>
                </button>
                <button
                  className="bg-[#c22626]/80 border border-[#424141]/50 rounded-2xl px-2 py-1"
                  onClick={() => setConfirm(membershipItem.id)}
                >
                  <p className="text-white text-[20px] font-jura-bold text-center leading-none">
                    Delete
                  </p>
                </button>
              </div>
            </div>
          ))}
        </div>
        {confirm && (
          <Confirmation
            setRemove={setConfirm}
            title="?"
            content="Do you want to delete this?"
            onConfirmed={() => deleteMembership(confirm)}
          />
        )}
        {updateMembership &&
          (updateMembership === "addNew" ? (
            <Add
              setRemove={setUpdateMembership}
              save={save}
              setLoading={setLoading}
              loading={loading}
              setErrorMessage={setErrorMessage}
              errorMessage={errorMessage}
            />
          ) : (
            <Add
              setRemove={setUpdateMembership}
              save={save}
              setLoading={setLoading}
              loading={loading}
              setErrorMessage={setErrorMessage}
              errorMessage={errorMessage}
              prevData={selectedMembership}
            />
          ))}
      </div>
    </AppGradient>
  );
};

export default ManageMembershipPlans;
