import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppGradient from "../../../components/AppGradient";
import { useEffect, useState } from "react";
import { Video } from "react-native-video";
import Thumbnail from "../../../components/Thumbnail";
import { useTranslation } from "react-i18next";
import * as FileSystem from "expo-file-system/legacy";
import { SafeAreaView } from "react-native-safe-area-context";

const WorkoutDetail = () => {
  const router = useRouter();
  const { workoutTitle, workoutData } = useLocalSearchParams();
  const [workouts, setWorkouts] = useState([]);
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
  const [currentVideo, setCurrentVideo] = useState();
  const [showControl, setShowcontrol] = useState(false);
  const { t } = useTranslation();
  const [showThumbnail, setShowThumbnail] = useState(true);

  useEffect(() => {
    if (workoutData) {
      const parsed = JSON.parse(workoutData);
      const sorted = parsed.sort(
        (a, b) => Number(a.workout_level) - Number(b.workout_level),
      );
      const filtered = sorted.filter(
        (item) =>
          typeof item.video.path === "number" ||
          (typeof item.video.path === "string" &&
            item.video.path.includes("file://")),
      );
      setWorkouts(filtered);
    }
  }, []);

  useEffect(() => {
    setCurrentVideo(workouts[0]);
  }, [workouts]);

  const deleteFile = async (uri) => {
    try {
      setShowThumbnail(false);
      await FileSystem.deleteAsync(uri);
    } catch {
      console.log("alredy deleted");
    }
  };

  return (
    <AppGradient>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1">
          <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={33} color="black" />
            </Pressable>
            <Text className="text-white h-10 pl-1 w-[90%] leading-none text-[30px] font-jura-bold">
              {t(`workout.${workoutTitle}`)} {t("workout.Workout Steps")}
            </Text>
          </View>
          {workouts.length > 0 && currentVideo && (
            <View className="flex-1">
              <View className="w-full h-[43%] p-2 border-b-[1px] border-black relative">
                <View className="flex-1 bg-black justify-center items-center rounded-2xl">
                  {(typeof currentVideo?.video?.path === "string" &&
                    currentVideo.video.path.includes("file://")) ||
                  typeof currentVideo?.video?.path === "number" ? (
                    <>
                      <Video
                        source={
                          typeof currentVideo?.video?.path === "string" &&
                          currentVideo.video.path.includes("file://")
                            ? { uri: currentVideo?.video?.path }
                            : currentVideo?.video?.path
                        }
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: 15,
                          overflow: "hidden",
                        }}
                        muted={true}
                        mixWithOthers="mix"
                        disableFocus={true}
                        playInBackground={false}
                        resizeMode="contain"
                        paused={false}
                        controls={showControl}
                        repeat
                        onLoad={() => setShowThumbnail(true)}
                        onError={() => deleteFile(currentVideo.video.path)}
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
                      {t("workout.No Video Provided")}
                    </Text>
                  )}
                </View>
                <View className="flex flex-row h-[25%]">
                  <View className="flex-1 flex flex-col justify-center items-start pl-3 gap-1 mt-1">
                    <Text className="text-white max-h-[50px] font-jura-bold text-[27px] leading-none">
                      {currentVideo?.workout_title}
                    </Text>
                    <Text className="text-white font-jura text-[21px] leading-none">
                      {currentVideo?.workout_break} {t("workout.mins break")}
                    </Text>
                  </View>
                  <View className="w-[90px] flex flex-col justify-center items-end pr-3 gap-1">
                    <Text className="text-white font-jura text-[21px] leading-none">
                      {currentVideo?.workout_rep} {t("workout.reps")}
                    </Text>
                    <Text className="text-white font-jura text-[21px] leading-none">
                      {currentVideo?.workout_sets} {t("workout.sets")}
                    </Text>
                  </View>
                </View>
              </View>
              <ScrollView className="flex-1 mb-4">
                {workouts &&
                  workouts?.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.7}
                      className="h-[140px] w-full flex flex-row p-2 gap-1"
                      onPress={() => {
                        setCurrentVideo(item);
                        setShowcontrol(false);
                      }}
                    >
                      <View className="flex-1 bg-black rounded-2xl justify-center items-center">
                        {item?.video?.path && Thumbnail ? (
                          <Thumbnail videoUri={item.video.path} />
                        ) : (
                          <Text className="text-white text-3xl">
                            {t("workout.Video")}
                          </Text>
                        )}
                      </View>
                      <View className="flex-1 justify-evenly items-start py-1">
                        <Text className="text-white max-h-[55px] font-jura-bold text-[27px] leading-none w-full overflow-x-hidden">
                          {item?.workout_title}
                        </Text>
                        <Text className="text-white font-jura text-[20px] leading-none">
                          {item?.workout_rep} {t("workout.reps")}
                        </Text>
                        <Text className="text-white font-jura text-[20px] leading-none">
                          {item?.workout_sets} {t("workout.sets")}
                        </Text>
                        <Text className="text-white font-jura text-[20px] leading-none">
                          {item?.workout_break} {t("workout.mins break")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>
    </AppGradient>
  );
};

export default WorkoutDetail;
