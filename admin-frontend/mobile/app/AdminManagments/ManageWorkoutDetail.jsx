import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import AppGradient from "../../components/AppGradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { useEffect, useState } from "react";
import WorkoutCrud from "../../components/WorkoutCrud";
import { Video } from "react-native-video";
import ApiClient from "../../utils/ApiClient";
import Thumbnail from "../../components/Thumbnail";

const ManageWorkoutDetail = () => {
  const router = useRouter();
  const { workoutTitle } = useLocalSearchParams();
  const [workouts, setWorkouts] = useState([]);
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
  const [modify, setMedify] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState();
  const [showControl, setShowcontrol] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updateData, setUpdateData] = useState();

  const onRefresh = () => {
    setRefreshing(true);
    console.log("refresh workout");
    fetchWorkout();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWorkout();
  }, []);

  const fetchWorkout = async () => {
    const token = await AsyncStorage.getItem("adminToken");
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
      // console.log(sorted);
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
    }
  };

  useEffect(() => {
    setCurrentVideo(workouts[0]);
  }, [workouts]);

  const updateWorkout = async (updateWorkoutData) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("adminToken");
    const formData = new FormData();

    const file = updateWorkoutData["workout_video"];
    delete updateWorkoutData.workout_video;
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(updateWorkoutData));
    try {
      const res = await axios.put(
        `http://${ADDRESS}/admin/workoutUpdate`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLoading(false);
      setMedify(false);
      fetchWorkout();
    } catch (err) {
      console.log(err);
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        if (backendError?.error) {
          setErrorMessage(backendError?.error);
        }
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
    }
  };

  const deleteWorkout = async (workoutId) => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.delete(`/admin/workoutRemove/${workoutId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res.data);
      fetchWorkout();
    } catch (err) {
      console.log(err);
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
    }
  };

  const uploadWorkout = async (saveWorkoutData) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("adminToken");
    const formData = new FormData();

    const file = saveWorkoutData["workout_video"];
    delete saveWorkoutData.workout_video;
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(saveWorkoutData));

    try {
      const res = await axios.post(
        `http://${ADDRESS}/admin/workout`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLoading(false);
      setMedify(false);
      fetchWorkout();
      // console.log(res.data);
    } catch (err) {
      console.log(err);
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        if (backendError?.error) {
          setErrorMessage(backendError?.error);
        }
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
    }
  };

  return (
    <AppGradient>
      <View className="flex-1">
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
            Manage {workoutTitle} Workout
          </Text>
        </View>
        <View className="w-full flex flex-row justify-end px-6 mt-2">
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-[#56C556] rounded-[25px] py-3 px-4 items-center justify-center"
            onPress={() => {
              (setMedify("add"), setUpdateData(currentVideo));
            }}
          >
            <Text className="text-white leading-none text-[20px] font-jura text-center">
              Add Workout
            </Text>
          </TouchableOpacity>
        </View>
        {workouts.length > 0 && currentVideo && (
          <View className="flex-1">
            <View className="w-full h-[42%] p-2 px-1 border-b-[1px] border-black relative">
              <View className="flex-1 bg-black rounded-2xl justify-center items-center ">
                {currentVideo?.video?.path ? (
                  <>
                    <Video
                      source={{
                        uri: `http://${ADDRESS}/${currentVideo?.video?.path}`,
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 15,
                        overflow: "hidden",
                      }}
                      resizeMode="contain"
                      paused={false}
                      controls={showControl}
                      repeat
                      onError={(err) => console.log("video error", err)}
                    />
                    {!showControl && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setShowcontrol(true)}
                        className="h-full w-full absolute"
                      />
                    )}
                  </>
                ) : (
                  <Text className="text-white font-jura-bold">
                    No Video Provided
                  </Text>
                )}
              </View>
              <View className="flex flex-row h-[22%]">
                <View className="flex-1 flex flex-col justify-center items-start pl-3 gap-1">
                  <Text className="text-white max-h-[45px] font-jura-bold text-[22px] leading-none">
                    {currentVideo?.workout_title}
                  </Text>
                  <Text className="text-white font-jura text-[18px] leading-none">
                    {currentVideo?.workout_break} mins break
                  </Text>
                </View>
                <View className="w-[90px] flex flex-col justify-center items-end pr-3 gap-1">
                  <Text className="text-white font-jura text-[18px] leading-none">
                    {currentVideo?.workout_rep} reps
                  </Text>
                  <Text className="text-white font-jura text-[18px] leading-none">
                    {currentVideo?.workout_sets} sets
                  </Text>
                </View>
                <View className="gap-2 w-[20%] justify-center mx-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="bg-[#aaa1a1] p-1 px-2 rounded-md"
                    onPress={() => {
                      (setMedify("edit"), setUpdateData(currentVideo));
                    }}
                  >
                    <Text className="text-white font-jura-bold text-[19px] leading-none text-center">
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="bg-[#B81B1B] p-1 px-2 rounded-md"
                    onPress={() => deleteWorkout(currentVideo.id)}
                  >
                    <Text className="text-white font-jura-bold text-[19px] leading-none text-center">
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <ScrollView className="flex-1 mb-4">
              {workouts &&
                workouts?.map((item, index) => (
                  <View
                    key={index}
                    className="h-[140px] w-full flex flex-row p-2 gap-1"
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setCurrentVideo(item)}
                      className="flex-1 flex flex-row gap-1"
                    >
                      <View className="flex-1 bg-black rounded-2xl justify-center items-center">
                        {item?.video?.path ? (
                          <Thumbnail videoUri={item.video.path} />
                        ) : (
                          <Text className="text-white text-3xl">Video</Text>
                        )}
                      </View>
                      <View className="flex-1 justify-evenly items-start py-1">
                        <Text className="text-white max-h-[45px] font-jura-bold text-[22px] leading-none w-full overflow-x-hidden">
                          {item.workout_title}
                        </Text>
                        <Text className="text-white font-jura text-[17px] leading-none">
                          {item.workout_rep} reps
                        </Text>
                        <Text className="text-white font-jura text-[17px] leading-none">
                          {item.workout_sets} sets
                        </Text>
                        <Text className="text-white font-jura text-[17px] leading-none">
                          {item.workout_break} mins break
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <View className="gap-2 w-[20%] justify-center">
                      <TouchableOpacity
                        activeOpacity={0.7}
                        className="bg-[#aaa1a1] p-1 px-2 rounded-md"
                        onPress={() => {
                          (setMedify("edit"), setUpdateData(item));
                        }}
                      >
                        <Text className="text-white font-jura-bold text-[19px] leading-none text-center">
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        className="bg-[#B81B1B] p-1 px-2 rounded-md"
                        onPress={() => deleteWorkout(item.id)}
                      >
                        <Text className="text-white font-jura-bold text-[19px] leading-none text-center">
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}
        {modify &&
          (modify === "add" ? (
            <WorkoutCrud
              type="Add Workout"
              setRemove={setMedify}
              save={uploadWorkout}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              loading={loading}
              workoutType={workoutTitle}
            />
          ) : (
            <WorkoutCrud
              type="Edit Workout"
              setRemove={setMedify}
              save={updateWorkout}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              loading={loading}
              workoutType={workoutTitle}
              updateData={updateData}
            />
          ))}
      </View>
    </AppGradient>
  );
};

export default ManageWorkoutDetail;
