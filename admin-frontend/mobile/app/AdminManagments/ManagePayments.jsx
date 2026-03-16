import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState, useTransition } from "react";
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
import ApiClient from "../../utils/ApiClient";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

const ManagePayments = () => {
  const router = useRouter();
  const [addPayment, setAddPayment] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [filteredTransactionData, setFilteredTransactionData] = useState([]);
  const [membersData, setMembersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const filterSelections = [
    "Member Id",
    "Name",
    "Date",
    "Status",
    "Amount",
    "Plan",
    "Method",
  ];
  const { t } = useTranslation();

  useEffect(() => {
    offlineData();
    fetchTransactions();
  }, []);

  const offlineData = async () => {
    const localTransaction = await AsyncStorage.getItem("localTransaction");
    const parsedLocalTransaction = JSON.parse(localTransaction);
    console.log(parsedLocalTransaction);
    const transactions = await AsyncStorage.getItem("transactions");
    const paresedTransaction = JSON.parse(transactions);
    if (paresedTransaction) {
      if (parsedLocalTransaction) {
        const concated = paresedTransaction.concat(parsedLocalTransaction);
        setTransactionHistory(concated);
        search(filterSelections[0], true, concated);
      } else {
        setTransactionHistory(paresedTransaction);
        search(filterSelections[0], true, paresedTransaction);
      }
    }

    const members = await AsyncStorage.getItem("members");
    if (members) {
      const parsedMembers = JSON.parse(members);
      setMembersData(parsedMembers);
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
      search(filterSelections[0], true, res.data.transactions);
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
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        setErrorMessage(backendError?.error);
        console.log(err.response?.status);
        setLoading(false);

        const offlineSave = await localTransactionSave(saveData);
        if (offlineSave) {
          setAddPayment(false);
          offlineData();
        }

        return;
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      setLoading(false);
    }
  };

  const localTransactionSave = async (saveData) => {
    const existsMember = membersData.find(
      (member) => member.id === saveData.payer_id,
    );
    if (existsMember) {
      const localTransaction = await AsyncStorage.getItem("localTransaction");
      const parsedLocalTransaction = JSON.parse(localTransaction);
      saveData.payer = existsMember;
      if (parsedLocalTransaction) {
        const checkExist = parsedLocalTransaction.find(
          (transaction) => transaction.payer_id === saveData.payer_id,
        );
        if (checkExist) {
          setErrorMessage("transaction already exists");
          return 0;
        }
        parsedLocalTransaction.push(saveData);
        await AsyncStorage.setItem(
          "localTransaction",
          JSON.stringify(parsedLocalTransaction),
        );
      } else {
        await AsyncStorage.setItem(
          "localTransaction",
          JSON.stringify([saveData]),
        );
      }
      return 1;
    } else {
      setErrorMessage(`${saveData.payer_id} doesn't exist`);
      return 0;
    }
  };

  const formatDate = (createdAt) => {
    const date = new Date(createdAt);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const search = (filterDataBy, isAscending, Datas = null, searchText = "") => {
    const filterMap = {
      Date: "paid_at",
      "Member Id": "id",
      Name: "full_name",
      Status: "status",
      Amount: "amount",
      Plan: "payment_for",
      Method: "payment_method",
    };

    const filterBy = filterMap[filterDataBy];
    let data = Datas ?? transactionHistory;

    if (searchText) {
      const lowerSearch = searchText.toLowerCase();

      data = data.filter((item) => {
        const value =
          filterDataBy === "Name" || filterDataBy === "Member Id"
            ? item.payer[filterBy]
            : item[filterBy];

        if (
          filterDataBy === "Name" ||
          filterDataBy === "Status" ||
          filterDataBy === "Plan" ||
          filterDataBy === "Method"
        ) {
          return value.toLowerCase().includes(lowerSearch);
        } else if (filterDataBy === "Member Id" || filterDataBy === "Amount") {
          return value.toString().includes(searchText);
        } else if (filterDataBy === "Date") {
          const dateFormatted = formatDate(value);
          return dateFormatted.includes(lowerSearch);
        }
        return false;
      });
    }

    const sorted = [...data].sort((a, b) => {
      const modifier = isAscending ? 1 : -1;
      switch (filterDataBy) {
        case "Date":
          return (new Date(a[filterBy]) - new Date(b[filterBy])) * modifier;

        case "Member Id":
          return (a.payer[filterBy] - b.payer[filterBy]) * modifier;

        case "Name":
          return a.payer[filterBy].localeCompare(b.payer[filterBy]) * modifier;

        case "Amount":
          return (a[filterBy] - b[filterBy]) * modifier;

        default:
          return a[filterBy].localeCompare(b[filterBy]) * modifier;
      }
    });

    setFilteredTransactionData(sorted);
  };

  return (
    <AppGradient>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1">
          <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={33} color="black" />
            </Pressable>
            <Text className="text-white h-10 pl-2 leading-none text-[30px] font-jura-bold">
              {t("managePayment.Manage Payments")}
            </Text>
          </View>
          <SearchAndFilter
            filterSelections={filterSelections}
            search={search}
          />

          <View className="h-10 w-full flex flex-row justify-between px-6 my-4 items-center">
            <Text className="text-white leading-none text-[20px] font-jura">
              {t("managePayment.Transaction History")}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#56C556] rounded-[25px] h-[45px] w-[130px] px-2 items-center justify-center"
              onPress={() => setAddPayment(true)}
            >
              <Text className="text-white leading-none text-[18px] font-jura text-center">
                {t("managePayment.Add Transaction")}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            className="flex-1 bg-[#25252A]/60 rounded-xl px-2 mx-2 mb-6"
          >
            <ScrollView stickyHeaderIndices={[0]}>
              <View className="flex bg-[#4b4b50] flex-row items-center gap-3 px-2">
                <Text
                  style={{ width: "150" }}
                  className="text-white bg-zinc-800 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  {t("attendanceLog.Full-name")}
                </Text>
                <Text
                  style={{ width: "80" }}
                  className="text-white bg-zinc-800 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  {t("attendanceLog.Member Id")}
                </Text>
                <Text
                  style={{ width: "200" }}
                  className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  {t("attendanceLog.Payment Id")}
                </Text>
                <Text
                  style={{ width: "100" }}
                  className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  {t("attendanceLog.Date")}
                </Text>
                <Text
                  style={{ width: "150" }}
                  className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  {t("attendanceLog.Membership Plan")}
                </Text>
                <Text
                  style={{ width: "80" }}
                  className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  {t("attendanceLog.Amount")}
                </Text>
                <Text
                  style={{ width: "150" }}
                  className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  {t("attendanceLog.Payment By")}
                </Text>
                <Text
                  style={{ width: "100" }}
                  className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  {t("attendanceLog.Status")}
                </Text>
              </View>

              {Array.isArray(filteredTransactionData) &&
                filteredTransactionData.map((item, index) => {
                  return (
                    <View
                      key={index}
                      className={`${item?.id ? "bg-white/10" : "bg-gray-600"} h-7 w-full rounded-xl flex flex-row items-center my-1 px-2 justify-between`}
                    >
                      <View className="flex flex-row items-center gap-3">
                        <Text className="text-black leading-none text-[16px] max-h-5  font-jura text-center w-[150] h-5">
                          {item.payer.full_name}
                        </Text>
                        <Text className="text-black leading-none text-[16px] max-h-5  w-[80px]  font-jura text-center">
                          {item.payer.id}
                        </Text>
                        <Text className="text-black leading-none text-[16px] w-[200px] max-h-5 font-jura text-center">
                          {item.id}
                        </Text>
                        <Text className="text-black leading-none text-[16px]  w-[100px] max-h-5 font-jura text-center">
                          {formatDate(item.paid_at)}
                        </Text>
                        <Text className="text-black leading-none text-[16px] w-[150px] max-h-5 font-jura text-center">
                          {item.payment_for}
                        </Text>
                        <Text className="text-black leading-none text-[16px] w-[80px] max-h-5 font-jura text-center">
                          {item.amount} {t("managePayment.Birr")}
                        </Text>
                        <Text className="text-black leading-none text-[16px] w-[150px] max-h-5 font-jura text-center">
                          {item.payment_method}
                        </Text>
                        <Text className="text-black leading-none text-[16px] w-[100px] max-h-5 font-jura text-center">
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </ScrollView>
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
      </SafeAreaView>
    </AppGradient>
  );
};

export default ManagePayments;
