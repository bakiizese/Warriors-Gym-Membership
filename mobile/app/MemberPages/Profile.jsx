import { Ionicons } from "@expo/vector-icons";
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
import SelectLanguage from "../../components/AuthPage/SelectLanguage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import AttendanceCalendar from "../../components/AttendanceCalendar";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { ApiClientFile, fetchUrl, getAddress } from "../../utils/ApiClient";

const Profile = () => {
  const router = useRouter();
  const [editProfile, setEditProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState();
  const ADDRESS = getAddress();
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [language, setLanguage] = useState("");
  const { t } = useTranslation();
  const { userData, attendanceData } = useLocalSearchParams();

  useEffect(() => {
    const userDataJson = JSON.parse(userData);
    setProfileData(userDataJson);
    setLanguage(userDataJson.language);
    const attendnaceDataJson = JSON.parse(attendanceData);
    setAttendanceLog(attendnaceDataJson);
    setErrorMessage("");
  }, []);

  const saveProfile = async (profileData) => {
    setLoading(true);
    fetchUrl();
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
      router.push("../MemberDashboard");
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
    }
  };

  const changeLang = (ln) => {
    setProfileData((prev) => ({ ...prev, language: ln }));
    i18n.changeLanguage(ln);
  };

  const saveLanguage = async () => {
    if (language !== profileData.language) {
      await saveProfile(profileData);
      router.replace("../MemberDashboard");
    } else {
      router.back();
    }
  };

  return (
    <AppGradient>
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
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable
            onPress={() => {
              saveLanguage();
            }}
          >
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10pl-2 leading-none text-[30px] font-jura-bold">
            {t("profile.Profile")}
          </Text>
        </View>
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
            <View className="flex flex-row justify-between my-[9px] border-y-[1px] border-[#505050] py-3 px-3">
              <Text className="text-white text-[26px] font-jura leading-none">
                {t("profile.Select Language")}
              </Text>
              <View className="bg-[#777676] p-1 px-2 rounded-md border-[1px] border-[#424141] relative h-9 w-[120px] items-center">
                <SelectLanguage
                  primary={i18n.language}
                  setPrimary={changeLang}
                />
              </View>
            </View>
            <View className="flex-1 flex-col py-8">
              <View className="h-full">
                <Text className="text-white text-[40px] h-14 px-2 font-jura leading-none">
                  {t("profile.Attendance Log")}
                </Text>
                <View className="flex-1">
                  <AttendanceCalendar selected={attendanceLog} />
                </View>
              </View>
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
    </AppGradient>
  );
};

export default Profile;
