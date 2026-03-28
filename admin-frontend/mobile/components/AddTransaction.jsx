import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CommonEdit from "./CommonEdit";
import ApiClient from "../utils/ApiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTranslation } from "react-i18next";

const AddTransaction = ({
  setRemove,
  save,
  setLoading,
  loading,
  setErrorMessage,
  errorMessage,
}) => {
  const nowDate = new Date();
  const formatDate = (createdAt) => {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const [transactionData, setTransactionData] = useState({
    payment_method: "Cash",
    payer_id: "",
    amount: "",
    payment_for: "",
    membershipPlan_id: "",
    isNew: true,
    ticket_amount: "",
    duration_days: "",
    membership_id: "",
    paid_at: formatDate(nowDate) || "",
  });
  const [membershipData, setMembershipData] = useState([]);
  const { t } = useTranslation();

  const checkData = () => {
    const transactionKeys = [
      "payer_id",
      "amount",
      "payment_for",
      "membershipPlan_id",
    ];

    for (const key of transactionKeys) {
      if (!transactionData[key]) {
        if (["amount", "payment_for", "membershipPlan_id"].includes(key)) {
          setErrorMessage("membership missing");
          return;
        }
        setErrorMessage(key, "missing");
        return;
      }
    }
    setErrorMessage("");
    setLoading(true);
    save(transactionData);
  };

  useEffect(() => {
    offlineData();
    setErrorMessage("");
    const fetchMembership = async () => {
      const token = await AsyncStorage.getItem("adminToken");
      try {
        const res = await ApiClient.get("/admin/membership_plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedData = res.data;
        setMembershipData(fetchedData.membershipPlan);
        await AsyncStorage.setItem(
          "membershipPlan",
          JSON.stringify(fetchedData.membershipPlan),
        );
      } catch (err) {
        offlineData();
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

  const offlineData = async () => {
    const membershipPlan = await AsyncStorage.getItem("membershipPlan");
    const parsedMembershipPlan = JSON.parse(membershipPlan);
    if (parsedMembershipPlan) {
      setMembershipData(parsedMembershipPlan);
    }
  };
  const fetchExistMembership = async () => {
    if (!transactionData.payer_id) {
      setErrorMessage("enter payer id first");
      return 0;
    }
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get(
        `/admin/membership/${transactionData.payer_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const fetchedData = res.data.membership;
      setTransactionData((prev) => ({
        ...prev,
        amount: fetchedData.membershipPlan.fee,
        membershipPlan_id: fetchedData.membershipPlan.id,
        ticket_amount: fetchedData.membershipPlan.ticket_amount,
        duration_days: fetchedData.membershipPlan.duration_days,
        payment_for:
          fetchedData.membershipPlan.duration_days / 30 +
          " " +
          fetchedData.membershipPlan.membership_name,
        membership_id: fetchedData.id,
      }));
      return 1;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        if (err.response?.status === 404) {
          if (backendError?.error === "member not found") {
            setErrorMessage(`member ${transactionData.payer_id} not found`);
          } else {
            setErrorMessage("no previous membership");
          }
          return 0;
        }
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      return 0;
    }
  };

  return (
    <CommonEdit
      errorMessage={errorMessage}
      checkData={checkData}
      setRemove={setRemove}
      loading={loading}
      title="Add Transaction"
    >
      <View className="flex-1 px-4 my-2 gap-1 w-full justify-start items-center">
        <View className="w-full gap-2 mx-4 rounded-2xl overflow-hidden self-center items-center">
          <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center justify-between gap-3">
            <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
              <Text className="text-white text-[18px] font-jura-bold">
                {t("components.Payment type")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setTransactionData((prev) => ({
                  ...prev,
                  payment_method:
                    prev.payment_method === "Cash" ? "Transfer" : "Cash",
                }))
              }
              className="flex flex-row justify-center items-center bg-[#777676] px-3 py-1 rounded-2xl"
            >
              <Text className="text-white text-[23px] font-jura-bold leading-none">
                {transactionData.payment_method}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-3">
            <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
              <Text className="text-white text-[18px] font-jura-bold">
                {t("components.Payer id")}
              </Text>
            </View>
            <TextInput
              value={transactionData.payer_id}
              inputMode="decimal"
              onChangeText={(text) =>
                setTransactionData((prev) => ({ ...prev, payer_id: text }))
              }
              placeholder="Id number"
              placeholderTextColor={"#FFFFFF6E"}
              className="text-white text-[18px] h-full font-jura"
            />
          </View>
          <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-3">
            <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl w-[80px] items-center">
              <Text className="text-white text-[18px] font-jura-bold">
                {t("components.Date")}
              </Text>
            </View>
            <View className="flex flex-row justify-center items-center">
              <TextInput
                value={transactionData.paid_at}
                onChangeText={(text) =>
                  setTransactionData((prev) => ({
                    ...prev,
                    paid_at: text,
                  }))
                }
                placeholder="00-00-0000"
                placeholderTextColor={"#FFFFFF6E"}
                className="text-white text-[18px] h-full font-jura"
              />
            </View>
          </View>
          <View className="justify-center gap-10 items-center h-8 w-full flex flex-row">
            <TouchableOpacity
              className={`${transactionData.isNew ? "bg-[#00FF00]/60" : "bg-[#4CA24F]/30"} border-2 border-[#787878] rounded-xl px-4 h-10`}
              onPress={() =>
                setTransactionData((prev) => ({ ...prev, isNew: true }))
              }
            >
              <Text className=" text-white text-[22px] font-jura-bold">
                {t("components.New")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`${!transactionData.isNew ? "bg-[#00FF00]/60" : "bg-[#4CA24F]/30"} border-2 border-[#787878] rounded-xl px-2 h-10`}
              onPress={async () => {
                const check = await fetchExistMembership();
                if (check) {
                  setTransactionData((prev) => ({
                    ...prev,
                    isNew: false,
                  }));
                }
              }}
            >
              <Text className="text-white text-[22px] font-jura-bold">
                {t("components.Renew")}
              </Text>
            </TouchableOpacity>
          </View>
          <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-3">
            <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl items-center">
              <Text className="text-white text-[18px] font-jura-bold">
                {t("components.Amount")}
              </Text>
            </View>
            <View className="flex flex-row justify-center items-center">
              <Text className="text-white text-[18px] h-full font-jura-bold">
                {transactionData.amount} {t("components.Birr")}
              </Text>
            </View>
          </View>
          {membershipData.length > 0 ? (
            <View className="flex-1 h-[130px] w-full">
              <ScrollView
                horizontal={true}
                className="h-[130px] py-2 w-full my-2"
              >
                {Array.isArray(membershipData) &&
                  membershipData.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={0.8}
                      className="h-full mx-1 w-[120px] rounded-xl overflow-hidden items-center justify-evenly"
                      onPress={() =>
                        setTransactionData((prev) => ({
                          ...prev,
                          payment_for:
                            item.duration_days / 30 +
                            " " +
                            item.membership_name,
                          amount: item.fee,
                          membershipPlan_id: item.id,
                          ticket_amount: item.ticket_amount,
                          duration_days: item.duration_days,
                        }))
                      }
                      disabled={!transactionData.isNew}
                    >
                      <LinearGradient
                        colors={["#2148E499", "#479AF999"]}
                        className={`absolute inset-0 ${transactionData.membershipPlan_id === item.id ? "opacity-100" : "opacity-70"}`}
                        pointerEvents="none"
                        locations={[0, 1]}
                      />
                      <Text className="text-white text-center font-jura text-[20px] max-h-12 max-w-[120px]">
                        {item.duration_days / 30 + " " + item.membership_name}
                      </Text>
                      <Text className="text-white text-center font-jura text-[20px] max-h-12 max-w-[120px]">
                        {item.plan_type === "Ticket"
                          ? item.ticket_amount + " Ticket"
                          : "Daily"}
                      </Text>
                      <Text className="text-white text-center font-jura text-[20px] max-h-12 max-w-[120px]">
                        ${item.fee}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          ) : (
            <Text className="text-red-800 text-center font-jura text-[20px] max-h-12">
              *{t("components.No Membership Found")}
            </Text>
          )}
        </View>
      </View>
    </CommonEdit>
  );
};

export default AddTransaction;
