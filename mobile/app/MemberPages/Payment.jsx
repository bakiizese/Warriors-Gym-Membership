import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import payment from "../../assets/icons/payment.png";
import phone from "../../assets/icons/phone.png";
import AppGradient from "../../components/AppGradient";
import Confirmation from "../../components/Confirmation";
import ApiClient from "../../utils/ApiClient";

const Payment = () => {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState();
  const { membership, membershipPlan } = useLocalSearchParams();
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [membershipData, setMembershipData] = useState({});
  const [newMembership, setNewMembership] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [maxReached, setMaxReached] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (membership) {
      const parsed = JSON.parse(membership);
      setMembershipData(parsed);
      setNewMembership(false);
    } else {
      const parsed = JSON.parse(membershipPlan);
      setMembershipData(parsed);
      setNewMembership(true);
    }
  }, []);

  const savePayment = async () => {
    setLoading(true);
    setConfirm(false);
    const token = await AsyncStorage.getItem("userToken");
    membershipData.isNew = newMembership;
    try {
      const res = await ApiClient.post("/member/membership", membershipData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setTimeout(() => {
        setLoading("paid");
        router.push("../MemberDashboard");
      }, 2000);
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
      setLoading("error");
    }
  };

  useEffect(() => {
    offlineTransaction();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      const res = await ApiClient.get("/member/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactionHistory(res.data.transactions);
      await AsyncStorage.setItem(
        "transaction",
        JSON.stringify(res.data.transactions),
      );
    } catch (err) {
      offlineTransaction();
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

  const offlineTransaction = async () => {
    const transaction = await AsyncStorage.getItem("transaction");
    const parsedTransaction = JSON.parse(transaction);
    if (!parsedTransaction) {
      setTransactionHistory([]);
    }
    setTransactionHistory(parsedTransaction);
  };

  const checkMaxPay = () => {
    const durationDays = membershipData.membershipPlan.duration_days;
    const daysLeft = membershipData.daysLeft;
    const times = Math.ceil(daysLeft / durationDays);
    if (membershipData.membershipPlan.plan_type === "Ticket") {
      const orignalDays = times * durationDays;
      const oneThird = orignalDays * 0.3;
      if (daysLeft < oneThird) {
        setMaxReached(false);
        savePayment();
      } else {
        if (times >= 3) {
          console.log("max reached only 3 times");
          setMaxReached(true);
        } else {
          setMaxReached(false);
          savePayment();
        }
      }
    } else {
      if (times >= 3) {
        console.log("max reached only 3 times");
        setMaxReached(true);
      } else {
        setMaxReached(false);
        savePayment();
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
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        {Object.keys(membershipData).length !== 0 && (
          <View className="flex-1">
            {loading && (
              <View className="w-full h-full  bg-black/20 absolute inset-0 z-20 justify-center ">
                {loading === "paid" ? (
                  <AntDesign
                    name="check-circle"
                    size={48}
                    color="green"
                    className="self-center"
                  />
                ) : loading === "error" ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setLoading(false)}
                  >
                    <Entypo
                      name="circle-with-cross"
                      size={64}
                      color="red"
                      className="self-center"
                    />

                    <Text className="text-red-500 font-jura-bold text-[15px] text-center">
                      *{t("payment.Unable to make payment")}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <ActivityIndicator
                    size="large"
                    color="#FFFFFF"
                    className="flex-1"
                    style={{ transform: [{ scale: 2 }] }}
                  />
                )}
              </View>
            )}
            <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
              <Pressable onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={33} color="black" />
              </Pressable>
              <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
                {t("payment.Payment")}
              </Text>
            </View>
            <View className="justify-center items-center">
              <Text className="text-white bg-[#AC8C2D]/70 px-4 rounded-t-md leading-none text-[20px] font-jura-bold] text-center">
                {newMembership ? t("payment.New") : t("payment.Renewal")}
              </Text>
            </View>
            <View className="flex-1 px-4 pb-5 relative">
              {confirm && (
                <Confirmation
                  setRemove={setConfirm}
                  title="Are you sure?"
                  content="This will replace your previous plan."
                  onConfirmed={savePayment}
                />
              )}
              <View className="w-full py-4 bg-[#AC8C2D]/70 rounded-2xl justify-center items-center">
                <Text className="text-white leading-none text-[30px] font-jura-bold]">
                  {newMembership
                    ? membershipData.duration_days / 30 +
                      " " +
                      membershipData.membership_name
                    : membershipData.membershipPlan.duration_days / 30 +
                      " " +
                      membershipData.membershipPlan.membership_name}
                </Text>
              </View>
              <View className="flex gap-2 my-4">
                <View className="flex">
                  <Text className="text-white leading-none text-[20px] font-jura pl-2  py-2">
                    {t("payment.Choose Payment Method")}
                  </Text>
                  <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
                    <Image
                      source={payment}
                      resizeMode="contain"
                      className="h-7 w-7"
                    />
                    <Text className="text-white text-[25px] font-jura-bold w-[90%]">
                      Chappa Payment
                    </Text>
                  </View>
                </View>
                <View className="flex">
                  <Text className="text-white pl-2 leading-none text-[20px] font-jura py-2">
                    {t("payment.Enter Phone Number")}
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
                      {t("payment.Amount")}
                    </Text>
                    <View className="bg-[#1F1F21]/80 justify-center items-center rounded-2xl">
                      <Text className="text-white leading-none text-[30px] font-jura-bold px-3 py-2">
                        {newMembership
                          ? membershipData.fee
                          : membershipData.membershipPlan.fee}
                        $
                      </Text>
                    </View>
                  </View>
                  {membershipData?.membershipPlan?.status === "Inactive" ? (
                    <View className="flex flex-col max-w-[340px] items-center">
                      <Text className="text-red-500 leading-none text-center text-[18px] font-jura-bold py-2">
                        {t(
                          "payment.This plan is inactive please choose a different plan",
                        )}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        className="bg-[#00FF00]/10 border-2 border-[#00FF00] rounded-2xl w-[200px]"
                        onPress={() => router.push("./Membership")}
                      >
                        <Text className="text-[#00FF00] leading-none text-[28px] px-4 tracking-[2px] font-jura-bold py-2">
                          {t("payment.New Plan")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className={`bg-[#00FF00]/10 border-2 ${maxReached ? "bg-black/30" : "border-[#00FF00]"} rounded-2xl`}
                      onPress={() =>
                        newMembership ? setConfirm(true) : checkMaxPay()
                      }
                      disabled={maxReached}
                    >
                      <Text
                        className={`${maxReached ? "text-black/30" : "text-[#00FF00]"} leading-none text-[28px] px-4 tracking-[2px] font-jura-bold py-2`}
                      >
                        {t("payment.Pay")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View className="flex-1 py-3">
                <Text className="text-white leading-none text-[30px] font-jura-bold py-2">
                  {t("payment.Transaction History")} -{" "}
                  {Array.isArray(transactionHistory) &&
                    transactionHistory.length}
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
        )}
      </SafeAreaView>
    </AppGradient>
  );
};

export default Payment;
