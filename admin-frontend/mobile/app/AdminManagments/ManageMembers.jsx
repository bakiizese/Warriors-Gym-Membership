import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import remove from "../../assets/icons/delete.png";
import profile from "../../assets/icons/profile.png";
import AppGradient from "../../components/AppGradient";
import MemberCrud from "../../components/MemberCrud";
import SearchAndFilter from "../../components/SearchAndFilter";
import ApiClient from "../../utils/ApiClient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ManageMembers = () => {
  const router = useRouter();
  const [addMember, setAddMember] = useState(false);
  const [membersData, setMembersData] = useState();
  const [reloadPage, setReloadPage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const saveMember = async (personalData) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("adminToken");

    try {
      const res = await ApiClient.post("admin/addMember", personalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setReloadPage(!reloadPage);
      setAddMember(false);
      setLoading(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        setErrorMessage(backendError?.error?.message);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      const token = await AsyncStorage.getItem("adminToken");

      try {
        const res = await ApiClient.get("admin/members", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("members data");
        // console.log(
        //   res.data.members[0].membership.membershipPlan.membership_name,
        // );

        setMembersData(res.data.members);
      } catch (err) {
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
    fetchMembers();
  }, [reloadPage]);

  const removeMember = async (memberId) => {
    const token = await AsyncStorage.getItem("adminToken");

    try {
      const res = await ApiClient.delete(`admin/member/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data.member);
      setReloadPage(!reloadPage);
    } catch (err) {
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

  const formatDate = (createdAt) => {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <AppGradient>
      <View className="flex-1">
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10 pl-2 leading-none text-[30px] font-jura-bold">
            Manage Members
          </Text>
        </View>
        <SearchAndFilter />
        <View className="h-10 w-full flex flex-row justify-between px-6 my-4 items-center">
          <Text className="text-white leading-none text-[25px] font-jura">
            Members
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-[#56C556] rounded-[25px] h-[45px] w-[130px] px-2 items-center justify-center"
            onPress={() => setAddMember(true)}
          >
            <Text className="text-white leading-none text-[20px] font-jura text-center">
              Add Member
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="bg-[#25252A]/60 mb-10 flex-1 mx-3 rounded-xl">
          {Array.isArray(membersData) &&
            membersData.map((item, index) => (
              <View
                key={index}
                className="bg-white/10 h-16 w-full flex flex-row items-center my-1 justify-between"
              >
                <View className="flex flex-row items-center gap-2">
                  <View className="flex w-14 h-full items-center">
                    <View
                      className={`${item.activity_status === "Active" ? "bg-green-800" : item.activity_status === "Payment Due" ? "bg-red-600" : "bg-gray-500"} h-2 w-14`}
                    />
                    <Image
                      source={item.image_id ? { uri: item.image_id } : profile}
                      resizeMode="contain"
                      className="h-[49px] w-[49px] rounded-full p-2 border-[1px] border-[#00FF00]"
                    />
                  </View>
                  <View className="w-44">
                    <Text className="text-black leading-none text-[18px] font-jura text-start w-44 h-6">
                      {item.full_name}
                    </Text>
                    <Text className="text-black leading-none text-[17px] font-jura text-start">
                      {item.membership
                        ? item.membership.membershipPlan
                          ? item.membership.membershipPlan.membership_name
                          : "None-Membership"
                        : "None-Membership"}
                    </Text>
                  </View>
                  <View className="h-full flex justify-center gap-4 pb-2">
                    <View className="h-[5px] w-[5px] bg-black rounded-full" />
                    <View className="h-[5px] w-[5px] bg-black rounded-full" />
                  </View>
                  <View>
                    <Text className="text-black leading-none text-[18px] font-jura text-start">
                      {formatDate(item.createdAt)}
                    </Text>
                    <Text className="text-black leading-none text-[18px] font-jura text-start">
                      {item.id}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="mx-3"
                  onPress={() => removeMember(item.id)}
                >
                  <Image source={remove} className="h-8 w-7" />
                </TouchableOpacity>
              </View>
            ))}
        </ScrollView>
        {addMember && (
          <MemberCrud
            setRemove={setAddMember}
            type="Add Member"
            save={saveMember}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            loading={loading}
          />
        )}
      </View>
    </AppGradient>
  );
};

export default ManageMembers;
