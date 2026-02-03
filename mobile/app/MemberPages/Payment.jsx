import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Pressable,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AppGradient from "../../components/AppGradient";
import phone from "../../assets/icons/phone.png";
import payment from "../../assets/icons/payment.png";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiClient from "../../utils/ApiClient";
import axios from "axios";

const Payment = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState();
  const {
    membershipPlan_name,
    amount,
    membershipPlan_id,
    duration_days,
    ticket,
  } = useLocalSearchParams();
  const [reloadPage, setReloadPage] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState("new");
  const [membershipData, setMembershipData] = useState();

  useEffect(() => {
    const fetchMembership = async () => {
      const token = await AsyncStorage.getItem("userToken");

      try {
        const res = await ApiClient.get("member/membership", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log(res.data.membership);
        setMembershipData(res.data.membership);
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
    fetchMembership();
  }, []);

  const savePayment = async () => {
    const token = await AsyncStorage.getItem("userToken");
    try {
      const paymentRes = await ApiClient.post(
        "/member/payment",
        {
          payment_method: "TeleBirr",
          amount: amount,
          payment_for: membershipPlan_name,
          membershipPlan_id: membershipPlan_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      // console.log(paymentRes.data);
      const checkout = paymentRes.data.checkout_url;
      console.log(checkout);
      window.location.href = checkout;

      //new membership should also come here when wanting to change plans

      if (
        !membershipData ||
        membershipData?.membership_plan_id !== membershipPlan_id
      ) {
        console.log("in new");
        if (
          membershipData &&
          membershipData?.membership_plan_id !== membershipPlan_id
        ) {
          console.log("first cancel or finish current membership plan");
          const res = await ApiClient.put(
            "/member/membershipCancel",
            { id: membershipData?.id },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          // console.log(res.data);
        }

        const membershipRes = await ApiClient.post(
          "/member/membership",
          {
            membership_plan_id: membershipPlan_id,
            status: "Active",
            ticket: ticket,
            duration_days: duration_days,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // console.log(membershipRes.data);
      } else {
        console.log("in renew");
        console.log(membershipData);

        const membershipRes = await ApiClient.put(
          "/member/membershipRenew",
          {
            membership_id: membershipData.id,
            duration_days: Number(duration_days),
            status: "Active",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        // console.log(membershipRes.data);
      }

      setReloadPage(!reloadPage);
      router.push("../MemberDashboard");
      AsyncStorage.setItem(
        "membership",
        JSON.stringify({ membership: membershipData }),
      );
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
  useEffect(() => {
    const fetchTransactions = async () => {
      const token = await AsyncStorage.getItem("userToken");

      try {
        const res = await ApiClient.get("/member/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log(res.data.transactions);
        setTransactionHistory(res.data.transactions);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const backendError = err.response?.data;
          console.log(backendError?.error.message);
          console.log(err.response?.status);
        } else if (err instanceof Error) {
          console.log("Generic Error:", err.message);
        } else {
          console.log("An unexpected error occurred", err);
        }
      }
    };
    fetchTransactions();
  }, [reloadPage]);

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
          <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
            Payment
          </Text>
        </View>
        <View className="flex-1 px-4 py-8">
          <View className="w-full py-4 bg-[#AC8C2D]/70 rounded-2xl justify-center items-center">
            <Text className="text-white leading-none text-[30px] font-jura-bold]">
              {membershipPlan_name} Membership
            </Text>
          </View>
          <View className="flex gap-2 my-4">
            <View className="flex">
              <Text className="text-white leading-none text-[20px] font-jura pl-2  py-2">
                Choose Payment Method
              </Text>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
                <Image
                  source={payment}
                  resizeMode="contain"
                  className="h-7 w-7"
                />
                <Text className="text-white text-[25px] font-jura-bold w-[90%]">
                  TeleBirr
                </Text>
              </View>
            </View>
            <View className="flex">
              <Text className="text-white pl-2 leading-none text-[20px] font-jura py-2">
                Enter Phone Number
              </Text>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
                <Image
                  source={phone}
                  resizeMode="contain"
                  className="h-7 w-7"
                />
                <TextInput
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(text)}
                  placeholder="Phone number"
                  placeholderTextColor={"#FFFFFF6E"}
                  className="text-white text-[18px] font-jura w-[90%]"
                />
              </View>
            </View>
            <View className="flex flex-row items-end justify-between">
              <View>
                <Text className="text-white pl-2 leading-none text-[20px] font-jura py-2">
                  Amount
                </Text>
                <View className="bg-[#1F1F21]/80 justify-center items-center rounded-2xl">
                  <Text className="text-white leading-none text-[30px] font-jura-bold px-3 py-2">
                    {amount}$
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-[#00FF00]/10 border-2 border-[#00FF00] rounded-2xl"
                onPress={() => savePayment()}
              >
                <Text className="text-[#00FF00] leading-none text-[28px] px-4 tracking-[2px] font-jura-bold py-2">
                  Pay
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-1 py-3">
            <Text className="text-white leading-none text-[30px] font-jura-bold py-2">
              Transaction History
            </Text>
            <ScrollView className="flex-1 bg-[#25252A]/60 rounded-xl py-2 px-2">
              {Array.isArray(transactionHistory) &&
                transactionHistory.map((item, index) => {
                  return (
                    <View
                      key={index}
                      className="bg-white/10 h-14 w-full rounded-xl flex flex-row items-center my-1 px-2 justify-between"
                    >
                      <View className="flex flex-row items-center gap-2">
                        <View className="w-[150px]">
                          <Text className="text-black leading-none text-[17px] font-jura text-start w-44 h-5">
                            {item.id}
                          </Text>
                          <Text className="text-black leading-none text-[17px] font-jura text-start">
                            {formatDate(item.createdAt)}
                          </Text>
                        </View>
                        <View className="h-full flex justify-center gap-4 pb-2">
                          <View className="h-[5px] w-[5px] bg-black rounded-full" />
                          <View className="h-[5px] w-[5px] bg-black rounded-full" />
                        </View>
                        <View className="w-[80px]">
                          <Text className="text-black leading-none text-[17px] font-jura text-start">
                            {item.payment_for}
                          </Text>
                          <Text className="text-black leading-none text-[17px] font-jura text-start">
                            {item.amount} Birr
                          </Text>
                        </View>
                        <View className="h-full flex justify-center gap-4 pb-2">
                          <View className="h-[5px] w-[5px] bg-black rounded-full" />
                          <View className="h-[5px] w-[5px] bg-black rounded-full" />
                        </View>
                        <View>
                          <Text className="text-black leading-none text-[17px] font-jura text-start">
                            {item.payment_method}
                          </Text>
                          <Text className="text-black leading-none text-[17px] font-jura text-start">
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </View>
    </AppGradient>
  );
};

export default Payment;
