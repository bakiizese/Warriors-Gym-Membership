import { Entypo, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import profile from "../..//assets/icons/profile.png";
import AppGradient from "../../components/AppGradient";
import EditMember from "../../components/EditMember";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import AttendanceCalendar from "../../components/AttendanceCalendar";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import ApiClient, { ApiClientFile } from "../../utils/ApiClient";
import Confirmation from "../../components/Confirmation";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import AboutDeveloper from "../../components/AboutDeveloper";

const Profile = () => {
  const router = useRouter();
  const [editProfile, setEditProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState();
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
  const [attendanceLog, setAttendanceLog] = useState([]);
  const { t } = useTranslation();
  const { attendanceData } = useLocalSearchParams();
  const [confirmation, setConfirmation] = useState(false);

  useEffect(() => {
    offlineData();
    setErrorMessage("");
    onlineData();
  }, []);

  const offlineData = async () => {
    const attendnaceDataJson = JSON.parse(attendanceData);
    setAttendanceLog(attendnaceDataJson);

    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const parseUserData = JSON.parse(userData);
      i18n.changeLanguage(parseUserData?.language);

      setProfileData(parseUserData ?? {});
    }
  };

  const saveFile = async (member) => {
    const fileUri = member?.image;
    try {
      const filename = fileUri?.split("/").pop();
      const localpath = FileSystem.documentDirectory + filename;
      const checkFile = await FileSystem.getInfoAsync(localpath);

      if (checkFile.exists) {
        member.image = checkFile.uri;
        await AsyncStorage.setItem("userData", JSON.stringify(member));
        return checkFile.uri;
      }

      const { uri } = await FileSystem.downloadAsync(
        `${ADDRESS}/${fileUri}`,
        localpath,
      );
      if (uri) {
        member.image = uri;
        await AsyncStorage.setItem("userData", JSON.stringify(member));
      }
      return uri;
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

  const onlineData = async () => {
    const token = await AsyncStorage.getItem("userToken");
    try {
      const res = await ApiClient.get("/member/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileData(res.data.member);
      i18n.changeLanguage(res.data?.member?.language);
      await AsyncStorage.setItem("userData", JSON.stringify(res.data.member));
      await saveFile(res.data.member);
    } catch (err) {
      offlineData();
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          console.log("backend not responding");
          return;
        } else if (
          err.response?.status === 400 ||
          err.response?.status === 401
        ) {
          console.log("token error");
          await AsyncStorage.clear();
          router.replace("/AuthPage");
          return;
        }
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

  const saveProfile = async (profileData) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    const formData = new FormData();
    formData.append("file", profileData.image ? profileData.image : {});
    formData.append("metadata", JSON.stringify(profileData));
    try {
      const res = await ApiClientFile.put(`/member/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });
      console.log("res", res.data);
      if (res.data?.token) {
        await AsyncStorage.setItem("userToken", res.data?.token);
      }
      setLoading(false);
      await onlineData();
      setEditProfile(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log("backend error", backendError?.error);
        console.log("backend status", err.response?.status);
        setErrorMessage(backendError?.error);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      const localy = await saveLocaly(profileData);
      if (localy) {
        setEditProfile(false);
      }
    }
  };

  const saveLocaly = async (profileData) => {
    try {
      const profiled = await AsyncStorage.getItem("userData");
      const profiledPared = JSON.parse(profiled);
      for (const key in profileData) {
        if (
          profileData[key] !== profiledPared[key] &&
          ![
            "oldPassword",
            "password",
            "confirmPassword",
            "confirmPassword",
          ].includes(key)
        ) {
          if (key === "image") {
            profiledPared[key] = profileData[key].uri;
          } else {
            profiledPared[key] = profileData[key];
          }
        }
      }
      await AsyncStorage.setItem("userData", JSON.stringify(profiledPared));
      offlineData();
      return 1;
    } catch {
      return 0;
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();

    router.dismissAll();
    router.replace("/AuthPage");
  };

  return (
    <AppGradient>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1 mb-5 relative">
          {loading && (
            <View className="flex-1 bg-black/20 absolute inset-0 z-20">
              <ActivityIndicator
                size="large"
                color="#FFFFFF"
                className="flex-1"
                style={{ transform: [{ scale: 2 }] }}
              />
            </View>
          )}
          <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5 justify-between">
            <View className="flex flex-row">
              <Pressable
                onPress={() => {
                  router.back();
                }}
              >
                <Ionicons name="arrow-back" size={33} color="black" />
              </Pressable>
              <Text className="text-white h-10pl-2 leading-none text-[30px] font-jura-bold">
                {t("profile.Profile")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setConfirmation(true)}
              className="rounded-2xl bg-[#777676] border-[1px] border-[#424141]/50 px-3 py-1"
            >
              <Entypo color="black" name="log-out" size={35} />
            </TouchableOpacity>
          </View>
          {confirmation && (
            <Confirmation
              title="Are you sure?"
              content="Do you want to logout?"
              onConfirmed={logout}
              setRemove={setConfirmation}
            />
          )}
          {profileData && (
            <>
              <View className="flex flex-row justify-between px-3 items-center py-1 my-4 h-[65px]">
                <View className="flex flex-row justify-center gap-2">
                  <Image
                    source={
                      profileData?.image
                        ? {
                            uri: profileData?.image.includes("file://")
                              ? profileData?.image
                              : `${ADDRESS}/${profileData.image}`,
                          }
                        : profile
                    }
                    resizeMode="contain"
                    className="h-[65px] w-[65px] rounded-full p-2 border-[1px] border-[#00FF00]"
                  />
                  <View className="flex justify-center items-start max-w-[150px">
                    <Text className="text-white text-[18px] w-full max-h-6 font-jura leading-none tracking-[2px]">
                      {profileData?.full_name}
                    </Text>
                    <Text className="text-white text-[18px] w-full max-h-6 font-jura leading-none tracking-[2px]">
                      {profileData?.phone_number}
                    </Text>
                    <Text className="text-white text-[18px] w-full max-h-6 font-jura leading-none tracking-[2px]">
                      {profileData?.id}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setEditProfile(true)}
                  className="rounded-2xl bg-[#777676] border-[1px] border-[#424141]/50"
                >
                  <Text className="text-white text-[28px] py-1 px-3 font-jura-bold leading-none">
                    {t("profile.Edit")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex flex-row justify-evenly items-center gap-5">
                <View className="h-14 w-auto bg-[#121214]/50 px-2 rounded-2xl justify-center items-center">
                  <Text className="text-white text-[30px] px-1 font-jura-bold leading-none">
                    {t(`profile.${profileData?.gender}`)}
                  </Text>
                </View>
                <View className="h-14 w-auto bg-[#121214]/50 px-2 rounded-2xl justify-center items-center">
                  <Text className="text-white text-[30px] px-1 font-jura-bold leading-none">
                    {profileData?.weight}kg
                  </Text>
                </View>
                <View className="h-14 w-auto bg-[#121214]/50 rounded-2xl justify-center items-center">
                  <Text className="text-white text-[30px] px-1 font-jura-bold leading-none">
                    {profileData?.height}cm
                  </Text>
                </View>
              </View>
              <View className="flex-1 pt-4">
                <View className="h-[410px] flex flex-col">
                  <Text className="text-white text-[40px] h-14 px-2 font-jura leading-none">
                    {t("profile.Attendance Log")}
                  </Text>
                  <View className="flex-1">
                    <AttendanceCalendar selected={attendanceLog} />
                  </View>
                </View>

                <AboutDeveloper />
              </View>
              {editProfile && (
                <EditMember
                  editData={profileData}
                  setRemove={setEditProfile}
                  save={saveProfile}
                  errorMessage={errorMessage}
                  setErrorMessage={setErrorMessage}
                  loading={loading}
                />
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </AppGradient>
  );
};

export default Profile;
