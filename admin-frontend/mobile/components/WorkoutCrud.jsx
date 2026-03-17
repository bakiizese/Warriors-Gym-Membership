import CommonEdit from "./CommonEdit";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import edit from "@/assets/icons/edit.png";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Video } from "react-native-video";
import { useTranslation } from "react-i18next";

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
  const [workoutData, setWorkoutData] = useState({
    workout_title: updateData.workout_title || "",
    workout_rep: updateData.workout_rep ?? "",
    workout_sets: updateData.workout_sets || "",
    workout_break: updateData.workout_break || "",
    workout_type: workoutType,
    workout_level: updateData.workout_level || "",
    workout_video: updateData?.video?.path || "",
  });
  const { t } = useTranslation();
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const video = {
        uri: file.uri || "http//",
        name: file.fileName || "fileaName",
        type: file.mimeType || "video/mp4",
      };
      setWorkoutData((prev) => ({ ...prev, workout_video: video }));
    }
  };

  const checkData = () => {
    for (const key in workoutData) {
      if (!workoutData[key]) {
        console.log(key, "missing");
        setErrorMessage(key);
        return;
      }
    }
    workoutData["id"] = updateData.id;
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
      <View className="flex-1 px-4 my-2 gap-1 justify-start items-center ">
        <View className="flex-1 h-[185px] w-full relative">
          <View className="bg-black/50 h-full w-full rounded-2xl overflow-hidden justify-center items-center">
            {workoutData?.workout_video ? (
              <Video
                source={{
                  uri: workoutData.workout_video.uri
                    ? workoutData.workout_video.uri
                    : `${ADDRESS}/${workoutData.workout_video}`,
                }}
                resizeMode="contain"
                style={{ width: "100%", height: "100%", overflow: "hidden" }}
                paused={true}
              />
            ) : (
              <Text className="text-white font-jura-bold">
                {t("components.Add Video")}
              </Text>
            )}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => pickImage()}
              className="w-full h-full absolute"
            />
          </View>
          <Image
            source={edit}
            resizeMode="contain"
            className="h-6 w-6 m-2 p-2 absolute right-1  top-1"
          />
        </View>
        <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-2">
          <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
            <Text className="text-white text-[18px] font-jura-bold">
              {t("components.Workout title")}
            </Text>
          </View>
          <TextInput
            value={workoutData.workout_title}
            inputMode="text"
            onChangeText={(text) =>
              setWorkoutData((prev) => ({ ...prev, workout_title: text }))
            }
            placeholder="Title"
            placeholderTextColor={"#FFFFFF6E"}
            className="text-white text-[18px] h-full font-jura w-[58%]"
          />
        </View>
        <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-2">
          <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
            <Text className="text-white text-[18px] font-jura-bold">
              {t("components.Reps")}
            </Text>
          </View>
          <View className="flex flex-row justify-center items-center">
            <TextInput
              value={String(workoutData.workout_rep)}
              inputMode="numeric"
              onChangeText={(text) =>
                setWorkoutData((prev) => ({ ...prev, workout_rep: text }))
              }
              placeholder="0"
              placeholderTextColor={"#FFFFFF6E"}
              className="text-white text-[18px] h-full font-jura"
            />
            <Text className="text-white text-[18px] h-full font-jura-bold leading-none">
              {t("components.reps")}
            </Text>
          </View>
        </View>
        <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-2">
          <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
            <Text className="text-white text-[18px] font-jura-bold">
              {t("components.Sets")}
            </Text>
          </View>
          <View className="flex flex-row justify-center items-center">
            <TextInput
              value={String(workoutData.workout_sets)}
              inputMode="numeric"
              onChangeText={(text) =>
                setWorkoutData((prev) => ({ ...prev, workout_sets: text }))
              }
              placeholder="0"
              placeholderTextColor={"#FFFFFF6E"}
              className="text-white text-[18px] h-full font-jura"
            />
            <Text className="text-white text-[18px] h-full font-jura-bold leading-none">
              {t("components.sets")}
            </Text>
          </View>
        </View>
        <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-2">
          <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
            <Text className="text-white text-[18px] font-jura-bold">
              {t("components.Breaks")}
            </Text>
          </View>
          <View className="flex flex-row justify-center items-center">
            <TextInput
              value={String(workoutData.workout_break)}
              inputMode="numeric"
              onChangeText={(text) =>
                setWorkoutData((prev) => ({
                  ...prev,
                  workout_break: String(text),
                }))
              }
              placeholder="0"
              placeholderTextColor={"#FFFFFF6E"}
              className="text-white text-[18px] h-full font-jura"
            />
            <Text className="text-white text-[18px] h-full font-jura-bold leading-none">
              {t("components.mins")}
            </Text>
          </View>
        </View>
        <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-2">
          <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
            <Text className="text-white text-[18px] font-jura-bold">
              {t("components.Workout level")}
            </Text>
          </View>
          <TextInput
            value={String(workoutData.workout_level)}
            inputMode="numeric"
            onChangeText={(text) =>
              setWorkoutData((prev) => ({ ...prev, workout_level: text }))
            }
            placeholder="0"
            placeholderTextColor={"#FFFFFF6E"}
            className="text-white text-[18px] h-full font-jura"
          />
        </View>
      </View>
    </CommonEdit>
  );
};

export default WorkoutCrud;
