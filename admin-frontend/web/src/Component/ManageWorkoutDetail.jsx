import { useEffect, useState } from "react";
import AppGradient from "./AppGradient";
import WorkoutCrud from "../Component/WorkoutCrud";
import ApiClient from "../utils/ApiClient";
import Thumbnail from "./Thumbnail";
import axios from "axios";
import Confirmation from "./Confirmation";

const ManageWorkoutDetail = ({ workoutTitle }) => {
  const [workouts, setWorkouts] = useState([]);
  const [modify, setModify] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState();
  const [updateData, setUpdateData] = useState();
  const ADDRESS = import.meta.env.VITE_ADDRESS;
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    fetchWorkout();
  }, [workoutTitle]);

  const fetchWorkout = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get(`/admin/workout/${workoutTitle}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedWorkout = res.data.workout;
      let sorted = [];

      if (fetchedWorkout[workoutTitle]) {
        sorted = fetchedWorkout[workoutTitle].sort(
          (a, b) => Number(a.workout_level) - Number(b.workout_level),
        );
      }

      setWorkouts(sorted);
      setCurrentVideo(sorted[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteWorkout = async (id) => {
    setConfirm(false);
    const token = localStorage.getItem("adminToken");

    try {
      await ApiClient.delete(`/admin/workoutRemove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchWorkout();
    } catch (err) {
      console.log(err);
    }
  };

  const uploadWorkout = async (saveWorkoutData) => {
    setLoading(true);

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();

    const file = saveWorkoutData.workout_video;
    delete saveWorkoutData.workout_video;

    formData.append("file", file);
    formData.append("metadata", JSON.stringify(saveWorkoutData));

    try {
      await axios.post(`${ADDRESS}/admin/workout`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setModify(false);
      fetchWorkout();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        if (backendError?.error) {
          setErrorMessage(backendError.error);
        }
      } else {
        console.log(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateWorkout = async (updateWorkoutData) => {
    setLoading(true);

    const token = localStorage.getItem("adminToken");
    const formData = new FormData();

    const file = updateWorkoutData.workout_video;
    delete updateWorkoutData.workout_video;

    if (file) {
      formData.append("file", file);
    }

    formData.append("metadata", JSON.stringify(updateWorkoutData));

    try {
      await axios.put(`${ADDRESS}/admin/workoutUpdate`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setModify(false);
      fetchWorkout();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        if (backendError?.error) {
          setErrorMessage(backendError.error);
        }
      } else {
        console.log(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppGradient>
      <div className="min-h-screen flex flex-col">
        <div className="w-full flex justify-end px-6 mt-2">
          <button
            className="bg-[#56C556] rounded-[25px] py-3 px-4 text-white font-jura"
            onClick={() => {
              setModify("add");
              setUpdateData(currentVideo);
            }}
          >
            Add Workout
          </button>
        </div>

        {workouts.length > 0 && currentVideo && (
          <div className="flex-1 flex flex-col">
            <div className="h-full p-2 border-b border-black flex flex-row">
              <div className="w-[70%] h-[70%] bg-black rounded-2xl flex justify-center items-center overflow-hidden">
                {currentVideo?.video?.path ? (
                  <video
                    src={`${ADDRESS}/${currentVideo.video.path}`}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-contain"
                    muted
                  />
                ) : (
                  <p className="text-white font-jura-bold">No Video Provided</p>
                )}
              </div>

              <div className="flex mt-3 flex-col flex-1">
                <div className="flex-1 pl-3">
                  <p className="text-white font-jura-bold text-[30px]">
                    {currentVideo?.workout_title}
                  </p>
                  <p className="text-white font-jura text-[25px]">
                    {currentVideo?.workout_break} mins break
                  </p>
                  <p className="text-white font-jura text-[25px]">
                    {currentVideo?.workout_rep} reps
                  </p>
                  <p className="text-white font-jura text-[25px]">
                    {currentVideo?.workout_sets} sets
                  </p>
                </div>

                <div className="flex flex-col gap-2 mx-14">
                  <button
                    className="bg-[#aaa1a1] px-3 py-1 rounded-md text-white"
                    onClick={() => {
                      setModify("edit");
                      setUpdateData(currentVideo);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="bg-[#B81B1B] px-3 py-1 rounded-md text-white"
                    onClick={() => setConfirm(currentVideo.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="h-[400px] border-2 border-black/20 rounded-xl w-full overflow-y-auto mb-4">
              {workouts.map((item, index) => (
                <div key={index} className="h-[140px] w-[600px] flex p-2 gap-2">
                  <button
                    onClick={() => setCurrentVideo(item)}
                    className="flex flex-1 gap-2 text-left"
                  >
                    <div className="flex-1 bg-black rounded-2xl flex justify-center items-center">
                      {item?.video?.path ? (
                        <Thumbnail videoUri={item.video.path} />
                      ) : (
                        // <p className="text-white">Video</p>
                        <p className="text-white">Video</p>
                      )}
                    </div>

                    <div className="flex-1 py-1">
                      <p className="text-white font-jura-bold text-[22px]">
                        {item.workout_title}
                      </p>
                      <p className="text-white font-jura">
                        {item.workout_rep} reps
                      </p>
                      <p className="text-white font-jura">
                        {item.workout_sets} sets
                      </p>
                      <p className="text-white font-jura">
                        {item.workout_break} mins break
                      </p>
                    </div>
                  </button>

                  <div className="flex flex-col gap-2 justify-center w-[130px]">
                    <button
                      className="bg-[#aaa1a1] px-3 py-1 rounded-md text-white"
                      onClick={() => {
                        setModify("edit");
                        setUpdateData(item);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-[#B81B1B] px-3 py-1 rounded-md text-white"
                      onClick={() => setConfirm(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {confirm && (
          <Confirmation
            setRemove={setConfirm}
            title="?"
            content="Do you want to delete this?"
            onConfirmed={() => deleteWorkout(confirm)}
          />
        )}
        {modify &&
          (modify === "add" ? (
            <WorkoutCrud
              type="Add Workout"
              setRemove={setModify}
              save={uploadWorkout}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              loading={loading}
              workoutType={workoutTitle}
            />
          ) : (
            <WorkoutCrud
              type="Edit Workout"
              setRemove={setModify}
              save={updateWorkout}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              loading={loading}
              workoutType={workoutTitle}
              updateData={updateData}
            />
          ))}
      </div>
    </AppGradient>
  );
};

export default ManageWorkoutDetail;
