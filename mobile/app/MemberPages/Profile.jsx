import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import profile from "../..//assets/icons/profile.png";
import AppGradient from "../../components/AppGradient";
import EditMember from "../../components/EditMember";
import { useEffect, useState } from "react";
import SelectLanguage from "../../components/AuthPage/SelectLanguage";
import ApiClient from "../../utils/ApiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const Profile = () => {
  const router = useRouter();
  const [editProfile, setEditProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState();
  const [language, setLanguage] = useState("English");
  const { userData } = useLocalSearchParams();

  useEffect(() => {
    const parsed = JSON.parse(userData);
    setProfileData(parsed);
    setLanguage(parsed.language);
    setErrorMessage("");
  }, []);

  const saveProfile = async (profileData) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("userToken");

    try {
      const res = await ApiClient.put("/member/profile", profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("res", res.data);
      if (res.data?.token) {
        await AsyncStorage.setItem("userToken", res.data?.token);
      }
      setLoading(false);
      router.push("../MemberDashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setLoading(false);
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

  return (
    <AppGradient>
      <View className="flex-1">
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
            Profile
          </Text>
        </View>
        <View className="flex flex-row px-3 justify-between items-center py-1 my-4 h-[65px]">
          <View className="flex flex-row justify-center gap-2">
            <Image
              source={profileData?.image_id ? profileData.image_id : profile}
              resizeMode="contain"
              className="h-[65px] w-[65px] rounded-full p-2 border-[1px] border-[#00FF00]"
            />
            <View className="flex justify-center items-start w-60">
              <Text className="text-white text-[18px] font-jura leading-none tracking-[2px]">
                {profileData?.full_name}
              </Text>
              <Text className="text-white text-[18px] font-jura leading-none tracking-[2px]">
                {profileData?.phone_number}
              </Text>
              <Text className="text-white text-[18px] font-jura leading-none tracking-[2px]">
                {profileData?.id}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setEditProfile(true)}
            className="flex rounded-2xl bg-[#777676] border-[1px] border-[#424141]/50"
          >
            <Text className="text-white text-[28px] py-1 px-3 font-jura-bold leading-none">
              Edit
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex flex-row justify-evenly items-center gap-5">
          <View className="h-14 w-auto bg-[#121214]/50 px-2 rounded-2xl justify-center items-center">
            <Text className="text-white text-[30px] px-1 font-jura-bold leading-none">
              {profileData?.gender}
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
            Select Language
          </Text>
          <View className="bg-[#777676] p-1 px-2 rounded-md border-[1px] border-[#424141] relative h-9 w-[120px] items-center">
            <SelectLanguage primary={language} setPrimary={setLanguage} />
          </View>
        </View>
        <View className="flex-1 mb-8">
          <View className="flex-1">
            <Text className="text-white text-[40px] font-jura leading-none">
              Programs taken
            </Text>
            <View className="flex-1 justify-center items-center">
              <Text>Programs</Text>
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-white text-[40px] font-jura leading-none">
              Attendance Log
            </Text>
            <View className="flex-1 justify-center items-center">
              <Text>Attendance</Text>
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
      </View>
    </AppGradient>
  );
};

export default Profile;
