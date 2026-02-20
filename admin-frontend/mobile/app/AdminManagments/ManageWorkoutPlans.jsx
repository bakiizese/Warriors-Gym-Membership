import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppGradient from "../../components/AppGradient";

import absWorkout from "../../assets/images/workoutBgImages/Abs.jpeg";
import armsWorkout from "../../assets/images/workoutBgImages/Arms.jpeg";
import backWorkout from "../../assets/images/workoutBgImages/Back.jpeg";
import chestWorkout from "../../assets/images/workoutBgImages/Chest.jpeg";
import shoulderWorkout from "../../assets/images/workoutBgImages/Shoulder.jpeg";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useEffect, useState } from "react";
import calfWorkout from "../../assets/images/workoutBgImages/Calf.jpeg";
import gluteHamstringWorkout from "../../assets/images/workoutBgImages/GluteHamstring.jpeg";
import quadWorkout from "../../assets/images/workoutBgImages/Quad.jpeg";
import ApiClient, { fetchUrl, getAddress } from "../../utils/ApiClient";

const ManageWorkoutPlans = () => {
  const router = useRouter();
  const [workoutData, setWorkoutData] = useState();
  const [counterLoad, setCounterLoad] = useState(0);
  const [pressed, setPressed] = useState("");
  const ADDRESS = getAddress();

  const workoutRoute = {
    upperBody: [
      {
        title: "Chest Workout",
        bgImage: chestWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Chest",
            workoutData: JSON.stringify(workoutData?.Chest || []),
          },
        },
      },
      {
        title: "Back Workout",
        bgImage: backWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Back",
            workoutData: JSON.stringify(workoutData?.Back || []),
          },
        },
      },
      {
        title: "Shoulder Workout",
        bgImage: shoulderWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Shoulder",
            workoutData: JSON.stringify(workoutData?.Shoulder || []),
          },
        },
      },
      {
        title: "Arm Workout",
        bgImage: armsWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Arm",
            workoutData: JSON.stringify(workoutData?.Arm || []),
          },
        },
      },
      {
        title: "Abs Workout",
        bgImage: absWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Abs",
            workoutData: JSON.stringify(workoutData?.Abs || []),
          },
        },
      },
    ],
    lowerBody: [
      {
        title: "Calf Workout",
        bgImage: calfWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Calf",
            workoutData: JSON.stringify(workoutData?.Calf || []),
          },
        },
      },
      {
        title: "Quad Workout",
        bgImage: quadWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Quad",
            workoutData: JSON.stringify(workoutData?.Quad || []),
          },
        },
      },
      {
        title: "Glute & Hamstring Workout",
        bgImage: gluteHamstringWorkout,
        link: {
          pathname: "./ManageWorkoutDetail",
          params: {
            workoutTitle: "Glute & Hamstring",
            workoutData: JSON.stringify(
              workoutData?.["Glute & Hamstring"] || [],
            ),
          },
        },
      },
    ],
  };
  useEffect(() => {
    setPressed("");
    fetchUrl();
    fetchOffline();
    fetchWorkout();
  }, []);

  const fetchWorkout = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get(`/admin/workouts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { workoutPlan, length } = res.data;
      fetchOffline(workoutPlan, length);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log("error back", backendError?.error);
        console.log("status", err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      const workout = await AsyncStorage.getItem("workoutData");
      const size = await AsyncStorage.getItem("workoutDataSize");
      const pasredWorkout = JSON.parse(workout);
      fetchOffline(pasredWorkout, Number(size));
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchWorkout();
    }, []),
  );
  const saveFile = async (fileUri) => {
    try {
      const filename = fileUri?.path.split("/").pop();
      const localpath = FileSystem.documentDirectory + filename;
      const checkFile = await FileSystem.getInfoAsync(localpath);

      if (checkFile.exists && fileUri.size === checkFile.size) {
        console.log("file acutal size-", fileUri.size);
        console.log("file exists -size -", checkFile.size);
        return checkFile.uri;
      }

      if (fileUri?.path.includes("file://")) {
        console.log("edit name first");
        const fileName = fileUri.path.split("/").pop();
        const newFileName = `uploads/videos/${fileName}`;
        const { uri } = await FileSystem.downloadAsync(
          `${ADDRESS}/${newFileName}`,
          localpath,
        );
        console.log("uri", uri);
        console.log("file saved");
        return uri;
      } else {
        try {
          const { uri } = await FileSystem.downloadAsync(
            `${ADDRESS}/${fileUri?.path}`,
            localpath,
          );
          console.log("uri", uri);
          console.log("file saved");
          return uri;
        } catch (err) {
          console.log("err", err);
        }
      }
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

  const fetchOffline = async (offlineData = null, size = null) => {
    if (offlineData) {
      console.log("in onlineeee");

      const margin = 100 / size;
      setCounterLoad(0);
      let counter = 0;
      let promises = [];
      for (const key in offlineData) {
        const savedFile = offlineData[key].map(async (item) => {
          const localUri = await saveFile(item.video);
          if (localUri) item.video.path = localUri;
          counter = counter + margin;
          console.log("counte", counter);
          setCounterLoad(counter);
        });
        promises.push(...savedFile);
      }
      await Promise.all(promises);
      await AsyncStorage.setItem("workoutData", JSON.stringify(offlineData));
      await AsyncStorage.setItem("workoutDataSize", String(size));
      const workout = await AsyncStorage.getItem("workoutData");
      const pasredWorkout = JSON.parse(workout);
      setWorkoutData(pasredWorkout);
    } else {
      console.log("in offlineee");
      const workouts = await AsyncStorage.getItem("workoutData");

      const pasredWorkouts = JSON.parse(workouts);
      setWorkoutData(pasredWorkouts);
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
            Manage Workout Plans
          </Text>
        </View>
        <View className="flex-1 my-6">
          {counterLoad < 100 && (
            <Text className="text-center leading-none">Loading...</Text>
          )}
          <View className="flex px-3">
            <View className="h-5 w-full bg-gray-600 rounded-xl p-[1px] relative justify-center items-center">
              <View
                className={`h-full bg-[#00FF00]/60 rounded-xl`}
                style={{ width: `${counterLoad}%` }}
              ></View>
              <Text className="text-center absolute">
                {Math.floor(counterLoad)}
              </Text>
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-white px-5 text-[30px] font-jura-bold">
              Upper Body
            </Text>
            <ScrollView className="flex-1 border-[2px] px-2 py-1 border-[#7E7676] rounded-2xl mx-3 ">
              {workoutRoute.upperBody.map((item) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={item.title}
                  className="h-[135px] my-1 w-full rounded-2xl overflow-hidden"
                  onPress={() => {
                    (setPressed(item.title), router.push(item.link));
                  }}
                  disabled={counterLoad < 100 || pressed === item.title}
                >
                  <ImageBackground
                    source={item.bgImage}
                    resizeMode="cover"
                    className="h-full w-full justify-center items-center"
                  >
                    <Text className="text-white text-[35px] font-jura-bold">
                      {item.title}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View className="flex-1">
            <Text className="text-white px-5 text-[30px] font-jura-bold">
              Lower Body
            </Text>
            <ScrollView className="flex-1 border-[2px] px-2 py-1 border-[#7E7676] rounded-2xl mx-3 ">
              {workoutRoute.lowerBody.map((item) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={item.title}
                  className="h-[135px] my-1 w-full rounded-2xl overflow-hidden"
                  onPress={() => {
                    (setPressed(item.title), router.push(item.link));
                  }}
                  disabled={counterLoad <= 100 || pressed === item.title}
                >
                  <ImageBackground
                    source={item.bgImage}
                    resizeMode="cover"
                    className="h-full w-full justify-center items-center"
                  >
                    <Text className="text-white text-[35px] font-jura-bold text-center">
                      {item.title}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </AppGradient>
  );
};

export default ManageWorkoutPlans;
