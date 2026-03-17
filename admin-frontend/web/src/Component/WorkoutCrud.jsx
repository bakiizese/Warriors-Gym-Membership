import { useState } from "react";
import CommonEdit from "./CommonEdit";
import edit from "../../src/assets/icons/edit.png";

const WorkoutCrud = ({
  type,
  setRemove,
  save,
  errorMessage,
  setErrorMessage,
  loading,
  workoutType,
  updateData = {},
}) => {
  const ADDRESS = import.meta.env.VITE_ADDRESS;

  const [workoutData, setWorkoutData] = useState({
    workout_title: updateData.workout_title || "",
    workout_rep: updateData.workout_rep ?? "",
    workout_sets: updateData.workout_sets || "",
    workout_break: updateData.workout_break || "",
    workout_type: workoutType,
    workout_level: updateData.workout_level || "",
    workout_video: updateData?.video?.path || "",
  });

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setWorkoutData((prev) => ({
      ...prev,
      workout_video: file,
    }));
  };

  const checkData = () => {
    for (const key in workoutData) {
      if (!workoutData[key]) {
        setErrorMessage(`${key} is required`);
        return;
      }
    }

    workoutData.id = updateData.id;
    save(workoutData);
    setErrorMessage("");
  };

  return (
    <CommonEdit
      errorMessage={errorMessage}
      checkData={checkData}
      setRemove={setRemove}
      loading={loading}
      title={type}
    >
      <div className="flex flex-col px-4 my-2 gap-3 items-center w-full">
        <div className="h-[185px] w-full relative">
          <div className="bg-black/50 h-full w-full rounded-2xl overflow-hidden flex justify-center items-center">
            {workoutData.workout_video ? (
              <video
                src={
                  workoutData.workout_video instanceof File
                    ? URL.createObjectURL(workoutData.workout_video)
                    : `${ADDRESS}/${workoutData.workout_video}`
                }
                className="w-full h-full object-contain"
                controls
              />
            ) : (
              <p className="text-white font-jura-bold">Add Video</p>
            )}

            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <img
            src={edit}
            className="h-6 w-6 absolute right-2 top-2"
            alt="edit"
          />
        </div>

        <div className="bg-[#2A2A2C]/90 rounded-2xl px-3 h-[48px] w-full flex items-center gap-2">
          <div className="bg-[#4CA24F] px-2 rounded-xl w-[200px]">
            <span className="text-white font-jura-bold">Workout title</span>
          </div>

          <input
            value={workoutData.workout_title}
            onChange={(e) =>
              setWorkoutData((prev) => ({
                ...prev,
                workout_title: e.target.value,
              }))
            }
            placeholder="Title"
            className="bg-transparent text-white outline-none w-full"
          />
        </div>

        <InputRow
          label="Reps"
          value={workoutData.workout_rep}
          suffix="reps"
          onChange={(val) =>
            setWorkoutData((prev) => ({ ...prev, workout_rep: val }))
          }
        />

        <InputRow
          label="Sets"
          value={workoutData.workout_sets}
          suffix="sets"
          onChange={(val) =>
            setWorkoutData((prev) => ({ ...prev, workout_sets: val }))
          }
        />

        <InputRow
          label="Break"
          value={workoutData.workout_break}
          suffix="mins"
          onChange={(val) =>
            setWorkoutData((prev) => ({ ...prev, workout_break: val }))
          }
        />

        <InputRow
          label="Workout level"
          value={workoutData.workout_level}
          onChange={(val) =>
            setWorkoutData((prev) => ({ ...prev, workout_level: val }))
          }
        />
      </div>
    </CommonEdit>
  );
};

export default WorkoutCrud;

const InputRow = ({ label, value, onChange, suffix }) => {
  return (
    <div className="bg-[#2A2A2C]/90 rounded-2xl px-3 h-[48px] w-full flex items-center gap-2">
      <div className="bg-[#4CA24F] rounded-xl px-4">
        <span className="text-white font-jura-bold">{label}</span>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="bg-transparent text-white outline-none w-[40px]"
      />

      {suffix && <span className="text-white font-jura-bold">{suffix}</span>}
    </div>
  );
};
