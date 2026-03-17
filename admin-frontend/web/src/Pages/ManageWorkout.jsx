import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppGradient from "../Component/AppGradient";

import chestWorkout from "../../src/assets/images/workoutBgImages/Chest.jpeg";
import backWorkout from "../../src/assets/images/workoutBgImages/Back.jpeg";
import shoulderWorkout from "../../src/assets/images/workoutBgImages/Shoulder.jpeg";
import armsWorkout from "../../src/assets/images/workoutBgImages/Arms.jpeg";
import absWorkout from "../../src/assets/images/workoutBgImages/Abs.jpeg";
import calfWorkout from "../../src/assets/images/workoutBgImages/Calf.jpeg";
import quadWorkout from "../../src/assets/images/workoutBgImages/Quad.jpeg";
import gluteHamstringWorkout from "../../src/assets/images/workoutBgImages/GluteHamstring.jpeg";
import ManageWorkoutDetail from "../Component/ManageWorkoutDetail";

const ManageWorkoutPlans = () => {
  const [workoutTitle, setWorkoutTitle] = useState("Chest");
  const workoutRoute = {
    upperBody: [
      { title: "Chest Workout", bgImage: chestWorkout, type: "Chest" },
      { title: "Back Workout", bgImage: backWorkout, type: "Back" },
      { title: "Shoulder Workout", bgImage: shoulderWorkout, type: "Shoulder" },
      { title: "Arm Workout", bgImage: armsWorkout, type: "Arm" },
      { title: "Abs Workout", bgImage: absWorkout, type: "Abs" },
    ],
    lowerBody: [
      { title: "Calf Workout", bgImage: calfWorkout, type: "Calf" },
      { title: "Quad Workout", bgImage: quadWorkout, type: "Quad" },
      {
        title: "Glute & Hamstring Workout",
        bgImage: gluteHamstringWorkout,
        type: "Glute & Hamstring",
      },
    ],
  };

  return (
    <AppGradient>
      <div className="min-h-screen flex flex-row">
        <div className="flex flex-row">
          <div>
            <h2 className="text-white px-5 text-[30px] font-jura-bold">
              Upper Body
            </h2>

            <div className="w-[200px] overflow-y-auto border-2 border-[#7E7676] rounded-2xl mx-3 px-2 py-1">
              {workoutRoute.upperBody.map((item) => (
                <button
                  key={item.title}
                  onClick={() => setWorkoutTitle(item.type)}
                  className="h-[135px] my-1 w-full rounded-2xl overflow-hidden relative"
                >
                  <div
                    className="h-full w-full flex justify-center items-center bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.bgImage})` }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    <span className="relative text-white text-[35px] font-jura-bold">
                      {item.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-white px-5 text-[30px] font-jura-bold">
              Lower Body
            </h2>

            <div className="w-[200px] overflow-y-auto border-2 border-[#7E7676] rounded-2xl mx-3 px-2 py-1">
              {workoutRoute.lowerBody.map((item) => (
                <button
                  key={item.title}
                  onClick={() => setWorkoutTitle(item.type)}
                  className="h-[135px] my-1 w-full rounded-2xl overflow-hidden relative"
                >
                  <div
                    className="h-full w-full flex justify-center items-center bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.bgImage})` }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    <span className="relative text-white text-[35px] font-jura-bold text-center">
                      {item.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <ManageWorkoutDetail workoutTitle={workoutTitle} />
        </div>
      </div>
    </AppGradient>
  );
};

export default ManageWorkoutPlans;
