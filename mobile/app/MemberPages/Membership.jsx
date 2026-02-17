import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Pressable,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import AppGradient from "../../components/AppGradient";
import { LinearGradient } from "expo-linear-gradient";
import dumbbell from "../../assets/icons/dumbbell.png";
import { useCallback, useEffect } from "react";
import ApiClient from "../../utils/ApiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Membership = () => {
  const router = useRouter();
  const [membershipData, setMembershipData] = useState();
  const { t } = useTranslation();
  const [pressed, setPressed] = useState("");

  useFocusEffect(
    useCallback(() => {
      setPressed("");
    }, []),
  );

  useEffect(() => {
    offlineMembershipPlan();
    const fetchMembership = async () => {
      const token = await AsyncStorage.getItem("userToken");
      try {
        const res = await ApiClient.get("/member/membership_plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembershipData(res.data.membershipPlan);
        await AsyncStorage.setItem(
          "membershipPlan",
          JSON.stringify(res.data.membershipPlan),
        );
      } catch (err) {
        offlineMembershipPlan();
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
  }, []);

  const offlineMembershipPlan = async () => {
    const membershipPlan = await AsyncStorage.getItem("membershipPlan");
    const membershipParsed = JSON.parse(membershipPlan);
    setMembershipData(membershipParsed);
  };

  return (
    <AppGradient>
      <View className="flex-1">
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
            {t("membership.Membership Types")}
          </Text>
        </View>
        <View className="items-center justify-center flex-1 my-6">
          <View className="flex-1 mb-10 w-full justify-center items-center">
            <ScrollView
              className="w-full flex-1 py-10"
              horizontal={true}
              decelerationRate="fast"
              contentContainerClassName="px-6"
              showsHorizontalScrollIndicator={false}
            >
              {membershipData &&
                membershipData.map((membershipItem) => (
                  <View
                    key={membershipItem.id}
                    className="h-full w-[290px] mx-4 rounded-2xl overflow-hidden self-center"
                  >
                    <LinearGradient
                      colors={["#2148E499", "#479AF999"]}
                      className="absolute inset-0 opacity-70"
                      pointerEvents="none"
                      locations={[0, 1]}
                    />
                    <View className="flex items-center">
                      <View className="flex justify-center items-center gap-2 m-3">
                        <Image source={dumbbell} className="h-8 w-12" />
                        <Text className="text-white leading-none text-[60px] font-jura-bold">
                          ${membershipItem.fee}
                        </Text>
                      </View>
                      <View className="h-1 w-[95%] bg-[#55318D]/80" />
                    </View>
                    <View className="flex-1 flex flex-col items-center p-4 w-full">
                      <Text className="text-white  my-4 leading-none text-[25px] h-10 font-jura-bold">
                        {membershipItem.duration_days / 30}{" "}
                        {t(`membership.${membershipItem.membership_name}`)}
                      </Text>
                      <View className="rounded-2xl my-1 w-full flex flex-row justify-between items-center">
                        <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
                          <Text className="text-white text-[18px] font-jura-bold">
                            {t("membership.Plan type")}
                          </Text>
                        </View>
                        <View className="flex flex-row justify-center items-center bg-[#4CA24F] px-5 rounded-2xl">
                          <Text className="text-white text-[18px] font-jura-bold ">
                            {t(`membership.${membershipItem.plan_type}`)}
                          </Text>
                        </View>
                      </View>
                      {membershipItem.plan_type === "Ticket" && (
                        <View className="rounded-2xl my-1 w-full flex flex-row justify-between items-center">
                          <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
                            <Text className="text-white text-[18px] font-jura-bold">
                              {t("membership.Ticket amount")}
                            </Text>
                          </View>
                          <View className="flex flex-row justify-center items-center bg-[#4CA24F] px-5 rounded-2xl">
                            <Text className="text-white text-[18px] font-jura-bold ">
                              {membershipItem.ticket_amount}
                            </Text>
                          </View>
                        </View>
                      )}
                      <View className="rounded-2xl my-1 w-full flex flex-row justify-between items-center">
                        <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
                          <Text className="text-white text-[18px] font-jura-bold">
                            {t("membership.Duration days")}
                          </Text>
                        </View>
                        <View className="flex flex-row justify-center items-center bg-[#4CA24F] px-5 rounded-2xl">
                          <Text className="text-white text-[18px] font-jura-bold ">
                            {membershipItem.duration_days}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-white text-[23px] decoration: underline font-jura-bold ">
                        {t("membership.Description")}
                      </Text>
                      <View className="my-2 w-[90%] gap-4">
                        {membershipItem.description?.split("\n").map((item) => (
                          <Text
                            key={item}
                            className="text-white leading-none text-[16px] font-jura-bold"
                          >
                            {item}
                          </Text>
                        ))}
                      </View>
                    </View>
                    <View className="justify-end py-4">
                      <TouchableOpacity
                        activeOpacity={0.8}
                        className="self-center justify-center items-center bg-white h-[40px] w-[150px] rounded-full px-4"
                        onPress={() => {
                          setPressed("payment");
                          router.push({
                            pathname: "./Payment",

                            params: {
                              membership: null,
                              membershipPlan: JSON.stringify(membershipItem),
                            },
                          });
                        }}
                        disabled={pressed === "payment"}
                      >
                        <Text className="text-[#3B5793] leading-none h-[40px] text-[35px] font-jura-bold">
                          {t("membership.Pay")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </ScrollView>
            <View className="bg-[#869CED] rounded-full h-3 w-[200px]" />
          </View>
        </View>
      </View>
    </AppGradient>
  );
};

export default Membership;
