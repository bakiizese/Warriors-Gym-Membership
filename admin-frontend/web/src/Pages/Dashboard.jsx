import React, { useState } from "react";
import AppGradient from "../Component/AppGradient";
import logo from "../../src/assets/logo.png";
import ManageMembers from "./ManageMembers";
import ManagePayment from "./ManagePayment";
import ManageAttendance from "./ManageAttendance";
import ManageMembership from "./ManageMembership";
import ManageWorkout from "./ManageWorkout";

const Dashboard = () => {
  const pages = {
    "Manage Members": <ManageMembers />,
    "Manage Payment": <ManagePayment />,
    "Manage Membership": <ManageMembership />,
    "Manage Workout": <ManageWorkout />,
    "Manage Attendance": <ManageAttendance />,
  };
  const [selectedPage, setSelectedPage] = useState("Manage Members");
  return (
    <div className="flex-1">
      <AppGradient>
        <div className="flex-1 flex flex-row">
          <div className="min-h-screen flex flex-col border-r-[1px] border-black items-center">
            <button onClick={() => setSelectedPage("Manage Members")}>
              <img src={logo} width={100} height={100} />
            </button>
            <div className="flex flex-col gap-2 w-[95px]">
              <button
                className={`h-[60px] mx-1 rounded-xl ${selectedPage === "Manage Members" ? "bg-[#00FF00]/20" : "bg-black/30"}`}
                onClick={() => setSelectedPage("Manage Members")}
              >
                <h1 className="text-white text-[13px] font-jura font-bold break-words text-center">
                  Manage Members
                </h1>
              </button>
              <button
                className={`h-[60px] mx-1 rounded-xl ${selectedPage === "Manage Payment" ? "bg-[#00FF00]/20" : "bg-black/30"}`}
                onClick={() => setSelectedPage("Manage Payment")}
              >
                <h1 className="text-white text-[13px] font-jura font-bold break-words text-center">
                  Manage Payment
                </h1>
              </button>
              <button
                className={`h-[60px] mx-1 rounded-xl ${selectedPage === "Manage Membership" ? "bg-[#00FF00]/20" : "bg-black/30"}`}
                onClick={() => setSelectedPage("Manage Membership")}
              >
                <h1 className="text-white text-[13px] font-jura font-bold break-words text-center">
                  Manage Membership
                </h1>
              </button>
              <button
                className={`h-[60px] mx-1 rounded-xl ${selectedPage === "Manage Workout" ? "bg-[#00FF00]/20" : "bg-black/30"}`}
                onClick={() => setSelectedPage("Manage Workout")}
              >
                <h1 className="text-white text-[13px] font-jura font-bold break-words text-center">
                  Manage Workout
                </h1>
              </button>
              <button
                className={`h-[60px] mx-1 rounded-xl ${selectedPage === "Manage Attendance" ? "bg-[#00FF00]/20" : "bg-black/30"}`}
                onClick={() => setSelectedPage("Manage Attendance")}
              >
                <h1 className="text-white text-[13px] font-jura font-bold break-words text-center">
                  Manage Attendance
                </h1>
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-center bg-black/20 border-b-[1px] border-black w-full h-14 p-4">
              <h1 className="text-white pl-4 text-[30px] font-jura font-bold">
                {selectedPage}
              </h1>
            </div>
            {pages[selectedPage]}
          </div>
        </div>
      </AppGradient>
    </div>
  );
};

export default Dashboard;
