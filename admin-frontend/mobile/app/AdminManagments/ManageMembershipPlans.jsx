import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import AppGradient from "../../components/AppGradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import Add from "../../components/AddMembership";
import ApiClient, { fetchUrl } from "../../utils/ApiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const ManageMembershipPlans = () => {
  const router = useRouter();
  const [updateMembership, setUpdateMembership] = useState(false);
  const [membershipData, setMembershipData] = useState();
  const [reloadFetch, setReloadFetch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedMembership, setSelectedMembership] = useState();

  useEffect(() => {
    fetchUrl();
    offlineData();
    const fetchMembership = async () => {
      const token = await AsyncStorage.getItem("adminToken");
      try {
        const res = await ApiClient.get("/admin/membership_plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedData = res.data;
        await AsyncStorage.setItem(
          "membershipPlan",
          JSON.stringify(fetchedData.membershipPlan),
        );
        setMembershipData(fetchedData.membershipPlan);
      } catch (err) {
        // fetchUrl();
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
    fetchMembership();
  }, [reloadFetch]);

  const offlineData = async () => {
    const membershipPlan = await AsyncStorage.getItem("membershipPlan");
    const parsedMembershipPlan = JSON.parse(membershipPlan);
    if (parsedMembershipPlan) {
      setMembershipData(parsedMembershipPlan);
    }
  };

  const save = async (saveData, membershipId = null) => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = membershipId
        ? await ApiClient.put(
            `/admin/membership_plan/${membershipId}`,
            saveData,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          )
        : await ApiClient.post("/admin/membership_plan", saveData, {
            headers: { Authorization: `Bearer ${token}` },
          });
      console.log(res.data);
      setLoading(false);
      setUpdateMembership(false);
      setReloadFetch(!reloadFetch);
    } catch (err) {
      // fetchUrl();
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      setLoading(false);
      setErrorMessage("an Error occured");
    }
  };

  const deleteMembership = async (membershipId) => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.delete(
        `/admin/membership_plan/${membershipId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log(res.data);
      setReloadFetch(!reloadFetch);
    } catch (err) {
      // fetchUrl();
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

  return (
    <AppGradient>
      <View className="flex-1">
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
            Manage Membership
          </Text>
        </View>
        <View className="flex-1">
          <View className="h-10 w-full flex flex-row justify-end px-6 my-4">
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#56C556] rounded-[25px] h-[45px] w-[140px] px-2 items-center justify-center"
              onPress={() => setUpdateMembership("addNew")}
            >
              <Text className="text-white leading-none text-[20px] font-jura text-center">
                Add Membership
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView className="flex-1 flex my-4 mb-10 px-3">
            {membershipData &&
              membershipData.map((membershipItem) => (
                <View
                  key={membershipItem.id}
                  className="relative my-1 flex overflow-hidden flex-row w-full h-[120px] justify-between px-3 bg-[#425CB1]/50 py-2 rounded-2xl"
                >
                  <View
                    className={`absolute h-3 w-36 ${membershipItem.status === "Active" ? "bg-[#4CA24F]" : "bg-[#868686]"} top-0 left-0`}
                  />
                  <View className="flex h-full justify-evenly items-start">
                    <Text className="text-white leading-none text-[20px] font-jura text-center">
                      {membershipItem.membership_name}
                    </Text>
                    <Text className="text-white leading-none text-[20px] font-jura text-center">
                      {membershipItem.plan_type}
                    </Text>
                    <Text className="text-white leading-none text-[20px] font-jura text-center">
                      ${membershipItem.fee}
                    </Text>
                  </View>
                  <View className="flex h-full justify-evenly items-start">
                    {membershipItem?.description?.split("\n").map((item) => (
                      <Text
                        key={item}
                        className="text-white leading-none text-[15px] font-jura text-center"
                      >
                        {item}
                      </Text>
                    ))}
                  </View>
                  <View className="flex h-full justify-between items-center">
                    <View className="bg-[#AC8C2D]/70 py-1 px-4 rounded-2xl">
                      <Text className="text-white leading-none text-[30px] font-jura text-center">
                        {membershipItem.memberships.length}
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className=" bg-[#777676]  px-4 py-1 rounded-2xl"
                      onPress={() => {
                        setSelectedMembership(membershipItem);
                        setUpdateMembership("update");
                      }}
                    >
                      <Text className="text-white leading-none text-[20px] font-jura-bold text-center">
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="flex rounded-2xl bg-[#c22626]/80 border-[1px] border-[#424141]/50"
                      onPress={() => deleteMembership(membershipItem.id)}
                    >
                      <Text className="text-white text-[20px] py-1 px-2 font-jura-bold leading-none">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
          </ScrollView>
        </View>
        {updateMembership &&
          (updateMembership === "addNew" ? (
            <Add
              setRemove={setUpdateMembership}
              save={save}
              setLoading={setLoading}
              loading={loading}
              setErrorMessage={setErrorMessage}
              errorMessage={errorMessage}
            />
          ) : (
            <Add
              setRemove={setUpdateMembership}
              save={save}
              setLoading={setLoading}
              loading={loading}
              setErrorMessage={setErrorMessage}
              errorMessage={errorMessage}
              prevData={selectedMembership}
            />
          ))}
      </View>
    </AppGradient>
  );
};

export default ManageMembershipPlans;
