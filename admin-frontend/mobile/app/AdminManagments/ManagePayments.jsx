import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddTransaction from "../../components/AddTransaction";
import AppGradient from "../../components/AppGradient";
import SearchAndFilter from "../../components/SearchAndFilter";
import ApiClient, { fetchUrl } from "../../utils/ApiClient";

const ManagePayments = () => {
  const router = useRouter();
  const [addPayment, setAddPayment] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    fetchUrl();
    offlineData();
    fetchTransactions();
  }, []);

  const offlineData = async () => {
    const transactions = await AsyncStorage.getItem("transactions");
    const paresedTransaction = JSON.parse(transactions);
    if (paresedTransaction) {
      setTransactionHistory(paresedTransaction);
    }
  };

  const fetchTransactions = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem(
        "transactions",
        JSON.stringify(res.data.transactions),
      );
      setTransactionHistory(res.data.transactions);
    } catch (err) {
      fetchUrl();
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

  const saveTransaction = async (saveData) => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.post("/admin/transaction", saveData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data.transaction);
      fetchTransactions();
      setAddPayment(false);
      setLoading(false);
    } catch (err) {
      fetchUrl();
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        setErrorMessage(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      setLoading(false);
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
            Manage Payments
          </Text>
        </View>
        <SearchAndFilter />
        <View className="h-10 w-full flex flex-row justify-between px-6 my-4 items-center">
          <Text className="text-white leading-none text-[20px] font-jura">
            Transaction History
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-[#56C556] rounded-[25px] h-[45px] w-[130px] px-2 items-center justify-center"
            onPress={() => setAddPayment(true)}
          >
            <Text className="text-white leading-none text-[18px] font-jura text-center">
              Add Transaction
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView className="flex-1 bg-[#25252A]/60 rounded-xl px-2 mx-2 mb-6">
          {Array.isArray(transactionHistory) &&
            transactionHistory.map((item, index) => {
              return (
                <View
                  key={index}
                  className="bg-white/10 h-14 w-full rounded-xl flex flex-row items-center my-1 px-2 justify-between"
                >
                  <View className="flex flex-row items-center gap-2">
                    <View className="w-[50px]">
                      <Text className="text-black leading-none text-[16px] max-h-5  font-jura text-start w-44 h-5">
                        {item.payer.full_name}
                      </Text>
                      <Text className="text-black leading-none text-[16px] max-h-5  font-jura text-start">
                        {item.payer.id}
                      </Text>
                    </View>
                    <View className="h-full flex justify-center gap-4 pb-2">
                      <View className="h-[5px] w-[5px] bg-black rounded-full" />
                      <View className="h-[5px] w-[5px] bg-black rounded-full" />
                    </View>
                    <View className="w-[120px]">
                      <Text className="text-black leading-none text-[16px] max-w-[120px] max-h-5 font-jura text-start">
                        {item.id}
                      </Text>
                      <Text className="text-black leading-none text-[16px]  max-w-[120px] max-h-5 font-jura text-start">
                        {formatDate(item.paid_at)}
                      </Text>
                    </View>
                    <View className="h-full flex justify-center gap-4 pb-2">
                      <View className="h-[5px] w-[5px] bg-black rounded-full" />
                      <View className="h-[5px] w-[5px] bg-black rounded-full" />
                    </View>
                    <View className="w-[70px]">
                      <Text className="text-black leading-none text-[16px] max-w-[80px] max-h-5 font-jura text-start">
                        {item.payment_for}
                      </Text>
                      <Text className="text-black leading-none text-[16px] max-w-[80px] max-h-5 font-jura text-start">
                        {item.amount} Birr
                      </Text>
                    </View>
                    <View className="h-full flex justify-center gap-4 pb-2">
                      <View className="h-[5px] w-[5px] bg-black rounded-full" />
                      <View className="h-[5px] w-[5px] bg-black rounded-full" />
                    </View>
                    <View>
                      <Text className="text-black leading-none text-[16px] max-w-[80px] max-h-5 font-jura text-start">
                        {item.payment_method}
                      </Text>
                      <Text className="text-black leading-none text-[16px] max-w-[80px] max-h-5 font-jura text-start">
                        {item.status}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
        </ScrollView>
        {addPayment && (
          <AddTransaction
            setRemove={setAddPayment}
            save={saveTransaction}
            setLoading={setLoading}
            loading={loading}
            setErrorMessage={setErrorMessage}
            errorMessage={errorMessage}
          />
        )}
      </View>
    </AppGradient>
  );
};

export default ManagePayments;
