import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import profile from "../assets/icons/profile.png";
import AppGradient from "../components/AppGradient";
import { Linking } from "react-native";
import ApiClient, { ApiClientFile } from "../utils/ApiClient";
import saveImage from "../utils/saveImage";
import { useTranslation } from "react-i18next";
import workoutM from "../assets/icons/workoutM.png";
import programsM from "../assets/icons/programsM.png";
import membershipM from "../assets/icons/membershipM.png";
import transactionM from "../assets/icons/transactionM.png";
import attendanceM from "../assets/icons/attendanceM.png";
import memberM from "../assets/icons/memberM.png";
import UpdateProfile from "../components/UpdateProfile";
import remove from "../assets/icons/delete.png";
import i18n from "i18next";
import Confirmation from "../components/Confirmation";

const AdminDashboard = () => {
  const router = useRouter();
  const [adminData, setAdminData] = useState();
  const [totalActiveMembers, setTotalActiveMembers] = useState(0);
  const [paymentDueMembers, setPaymentDueMembers] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [QRScan, setQRScan] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState("");
  const [scannedData, setScannedData] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
  const [pressedPage, setPressedPage] = useState("");
  const { t } = useTranslation();
  const [memberLocalNumber, setMemberLocalNumber] = useState(0);
  const [attendancLocalNumber, setAttendancLocalNumber] = useState(0);
  const [localTransactionNumber, setLocalTransactionNumber] = useState(0);
  const [editProfile, setEditProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [membersData, setMembersData] = useState([]);
  const [confirm, setConfirm] = useState(false);

  const loadPage = async () => {
    await offlineData();
    const network = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log("Working in Online Mode");
        onlineData();
      } else {
        console.log("Working in Offline Mode");
        await offlineData();
      }
    });

    return () => network();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPage();
    setRefreshing(false);
  };

  useEffect(() => {
    setPressedPage("");
    loadPage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPressedPage("");
      offlineData();
    }, []),
  );

  const saveProfile = async (profileData) => {
    setLoadings(true);
    const token = await AsyncStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("file", profileData.image ? profileData.image : {});
    formData.append("metadata", JSON.stringify(profileData));
    try {
      const res = await ApiClientFile.put(`/admin/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });
      console.log("res", res.data);
      if (res.data?.token) {
        await AsyncStorage.setItem("adminToken", res.data?.token);
      }
      setLoadings(false);
      onlineData();
      setEditProfile(false);
    } catch (err) {
      setLoadings(false);
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

  const offlineData = async () => {
    console.log("in offline");
    const adminData = await AsyncStorage.getItem("adminData");
    const parseAdminData = JSON.parse(adminData);
    if (parseAdminData) {
      setAdminData(parseAdminData);
    }

    const activeMembersData = await AsyncStorage.getItem("activeMembers");
    const parseAMsData = JSON.parse(activeMembersData);
    if (parseAMsData) {
      setTotalActiveMembers(parseAMsData);
    }

    const paymentDueMembersData =
      await AsyncStorage.getItem("paymentDueMembers");
    const parsePDMsData = JSON.parse(paymentDueMembersData);
    if (parsePDMsData) {
      setPaymentDueMembers(parsePDMsData);
    }

    const attendanceCount = await AsyncStorage.getItem("attendanceCount");
    if (attendanceCount) {
      setTodayAttendance(attendanceCount);
    }

    const MemberLocalAdd = await AsyncStorage.getItem("MemberLocalAdd");
    const parsedMemberLocalAdd = JSON.parse(MemberLocalAdd);
    if (parsedMemberLocalAdd) {
      setMemberLocalNumber(parsedMemberLocalAdd.length);
    }

    const members = await AsyncStorage.getItem("members");
    if (members) {
      const parseMembers = JSON.parse(members);
      setMembersData(parseMembers);
    }

    const attendnacLocal = await AsyncStorage.getItem("localAttendance");
    if (attendnacLocal) {
      const attendnacLocalParse = JSON.parse(attendnacLocal);
      setAttendancLocalNumber(attendnacLocalParse.length);
    }

    const localTransaction = await AsyncStorage.getItem("localTransaction");
    if (localTransaction) {
      const parsedLocalTransaction = JSON.parse(localTransaction);
      setLocalTransactionNumber(parsedLocalTransaction.length);
    }
  };

  const onlineData = () => {
    const fetchAdminDashboard = async () => {
      try {
        const token = await AsyncStorage.getItem("adminToken");
        const res = await ApiClient.get("admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        await AsyncStorage.setItem("adminData", JSON.stringify(res.data.user));
        if (res?.data?.user?.image) {
          const savedData = await saveImage(res?.data?.user);
          await AsyncStorage.setItem("userData", JSON.stringify(savedData));
        }
        setAdminData(res.data.user);
        i18n.changeLanguage(res.data.user.language);
        fetchMembersStatus();
        fetchAttendanceLog();
        fetchMembers();
      } catch (err) {
        console.log(err);
        if (axios.isAxiosError(err)) {
          if (!err.response) {
            console.log("backend not responding");
            offlineData();
            return;
          } else if (
            err.response?.status === 400 ||
            err.response?.status === 401
          ) {
            console.log("token error");
            router.replace({ pathname: "/AuthPage", params: { path: 2 } });
            await AsyncStorage.clear();
            return;
          }
          const backendError = err.response?.data;
          console.log("err", backendError?.error);
          console.log("err status", err.response?.status);
        } else if (err instanceof Error) {
          console.log("Generic Error:", err.message);
        } else {
          console.log("An unexpected error occurred", err);
        }
      }
    };
    fetchAdminDashboard();
  };

  const fetchMembersStatus = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("admin/members_status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const status = res.data.members_status;
      await AsyncStorage.setItem("activeMembers", String(status.activeMembers));
      await AsyncStorage.setItem(
        "paymentDueMembers",
        String(status.paymentDueMembers),
      );
      setTotalActiveMembers(status.activeMembers);
      setPaymentDueMembers(status.paymentDueMembers);
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

  const fetchAttendanceLog = async () => {
    const token = await AsyncStorage.getItem("adminToken");

    try {
      const res = await ApiClient.get("admin/attendanceLog/today", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const count = res.data.attendanceCount;

      await AsyncStorage.setItem("attendanceCount", String(count));
      setTodayAttendance(count);
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
      setLoading(false);
      return 1;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        setErrorMessage(backendError?.error);
        console.log(err.response?.status);
        setLoading(false);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      setLoading(false);
      return 0;
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

  const fetchAttendance = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("/admin/attendanceLog", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem(
        "attendances",
        JSON.stringify(res.data.attendanceLog),
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

  const saveMember = async (personalData) => {
    const token = await AsyncStorage.getItem("adminToken");
    const formData = new FormData();
    formData.append("file", personalData.image ? personalData.image : "");
    formData.append("metadata", JSON.stringify(personalData));
    try {
      const res = await ApiClientFile.post(`/admin/addMember`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });
      return 1;
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
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

  const syncMember = async () => {
    const MemberLocalAdd = await AsyncStorage.getItem("MemberLocalAdd");
    const parsedMemberLocalAdd = JSON.parse(MemberLocalAdd);
    if (parsedMemberLocalAdd) {
      setMemberLocalNumber(parsedMemberLocalAdd.length);

      const remainingParsedMember = [];

      for (const key in parsedMemberLocalAdd) {
        const save = await saveMember(parsedMemberLocalAdd[key]);
        if (!save) {
          remainingParsedMember.push(parsedMemberLocalAdd[key]);
          setMemberLocalNumber(remainingParsedMember.length);
        }
      }
      await AsyncStorage.setItem(
        "MemberLocalAdd",
        JSON.stringify(remainingParsedMember),
      );
      setMemberLocalNumber(remainingParsedMember.length);
    }
  };

  const syncAttendance = async () => {
    const localAttendance = await AsyncStorage.getItem("localAttendance");
    const parsedlocalAttendance = JSON.parse(localAttendance);
    if (parsedlocalAttendance) {
      setAttendancLocalNumber(parsedlocalAttendance.length);

      const remainingParsedAttendance = [];

      for (const key in parsedlocalAttendance) {
        const save = await attendance(
          parsedlocalAttendance[key].attendanceMember.id,
        );
        if (!save) {
          remainingParsedAttendance.push(parsedlocalAttendance[key]);
          setAttendancLocalNumber(remainingParsedAttendance.length);
        }
      }
      await AsyncStorage.setItem(
        "localAttendance",
        JSON.stringify(remainingParsedAttendance),
      );
      setAttendancLocalNumber(remainingParsedAttendance.length);
    }
  };

  const syncPayment = async () => {
    const localTransaction = await AsyncStorage.getItem("localTransaction");
    const parsedlocalTransaction = JSON.parse(localTransaction);
    if (parsedlocalTransaction) {
      setLocalTransactionNumber(parsedlocalTransaction.length);

      const remainingParsedTransaction = [];

      for (const key in parsedlocalTransaction) {
        const save = await saveTransaction(parsedlocalTransaction[key]);
        if (!save) {
          remainingParsedTransaction.push(parsedlocalTransaction[key]);
          setLocalTransactionNumber(remainingParsedTransaction.length);
        }
      }
      await AsyncStorage.setItem(
        "localTransaction",
        JSON.stringify(remainingParsedTransaction),
      );
      setLocalTransactionNumber(remainingParsedTransaction.length);
    }
  };

  const syncData = async () => {
    await syncMember();
    await syncPayment();
    await syncAttendance();
    fetchMembers();
    fetchTransactions();
    fetchAttendance();
  };

  const scanQR = () => {
    if (!permission) return null;
    if (!permission.granted) {
      requestPermission();
    }
    setScannedData("");
    setScanned("");
    setQRScan(true);
  };

  const attendance = async (data) => {
    setLoading(true);
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.post(
        `admin/memberAttendance/${data}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("attendance", res.data);
      setScanned(res.data.attendance[1].full_name);
      fetchAttendanceLog();
      return 1;
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 400) {
        setScanned("Already Attended");
        return 400;
      } else if (err.response?.status === 404) {
        setScanned("Not Found");
        return 404;
      }
      if (axios.isAxiosError(err)) {
        saveLocalAttendance(data);
        const backendError = err.response?.data;
        console.log(backendError?.error);
        console.log(err.response?.status);
        return 0;
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      return 0;
    }
  };

  const fetchMembers = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("admin/members", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem("members", JSON.stringify(res.data.members));
      setMembersData(res.data.members);
    } catch (err) {
      console.log(err);
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

  const saveLocalAttendance = async (attendId) => {
    const exists = membersData.find(
      (member) => member.id === attendId && member.activity_status === "Active",
    );

    if (!exists) {
      setScanned("Not found");
      return;
    }

    const date = new Date();
    const localAttend = await AsyncStorage.getItem("localAttendance");
    if (localAttend) {
      const parsedLocalAttend = JSON.parse(localAttend);
      const checkDate = parsedLocalAttend.find(
        (attend) =>
          attend.attendanceMember.id === attendId &&
          new Date(attend.date).getDate() === date.getDate(),
      );
      if (checkDate) {
        setScanned("Already Attended");
        return;
      }
      parsedLocalAttend.push({
        date: date,
        check_in: date,
        isLocal: true,
        attendanceMember: { ...exists },
      });
      await AsyncStorage.setItem(
        "localAttendance",
        JSON.stringify(parsedLocalAttend),
      );
    } else {
      await AsyncStorage.setItem(
        "localAttendance",
        JSON.stringify([
          {
            isLocal: true,
            check_in: date,
            date: date,
            attendanceMember: { ...exists },
          },
        ]),
      );
    }
    const memberName = exists.full_name;
    setScanned(memberName);

    const count = Number(todayAttendance) + 1;
    await AsyncStorage.setItem("attendanceCount", String(count));
    offlineData();
  };

  const emptyLocalData = async () => {
    await AsyncStorage.setItem("MemberLocalAdd", JSON.stringify([]));
    await AsyncStorage.setItem("localAttendance", JSON.stringify([]));
    await AsyncStorage.setItem("localTransaction", JSON.stringify([]));
    offlineData();
    setConfirm(false);
  };
  return (
    <AppGradient>
      <SafeAreaView className="flex-1 p-5 relative">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1">
            <View className="flex flex-row justify-between items-center border-b-[1px] border-[#7E7676] h-[75px]">
              <View className="flex">
                <Text className="text-white text-[22px] font-jura leading-none tracking-[2px]">
                  {adminData?.full_name}
                </Text>
                <Text className="text-white text-[22px] font-jura leading-none tracking-[2px]">
                  {adminData?.phone_number}
                </Text>
                <Text className="text-white text-[22px] font-jura leading-none  tracking-[2px]">
                  {t(`dashboard.${adminData?.admin_level}`)}
                </Text>
              </View>
              <TouchableOpacity
                className="flex"
                activeOpacity={0.8}
                onPress={() => setEditProfile(true)}
              >
                <Image
                  source={
                    adminData?.image
                      ? {
                          uri: adminData?.image.includes("file://")
                            ? adminData?.image
                            : `${ADDRESS}/${adminData.image}`,
                        }
                      : profile
                  }
                  resizeMode="contain"
                  className="h-[68px] w-[68px] rounded-full p-2 border-[1px] border-[#00FF00]"
                />
              </TouchableOpacity>
            </View>
            <View className="flex flex-col my-[4px]">
              <Text className="leading-none text-center font-jura-bold h-5">
                Developer Info
              </Text>
              <View className="flex flex-row justify-between mx-1">
                <Text
                  style={{ color: "blue" }}
                  className="decoration: underline leading-none"
                  onPress={() =>
                    Linking.openURL("mailto:bereketzeselassie@gmail.com")
                  }
                >
                  bereketzeselassie@gmail.com
                </Text>
                <Text
                  style={{ color: "blue" }}
                  className="decoration: underline leading-none"
                  onPress={() =>
                    Linking.openURL(
                      "https://www.linkedin.com/in/bereket-zeselassie-embaye",
                    )
                  }
                >
                  LinkedIn
                </Text>
                <Text
                  style={{ color: "blue" }}
                  className="decoration: underline leading-none"
                  onPress={() => Linking.openURL("https://wa.me/251941353944")}
                >
                  WhatsApp
                </Text>
                <Text
                  style={{ color: "blue" }}
                  className="decoration: underline leading-none"
                  onPress={() =>
                    Linking.openURL("https://t.me/bereket_zeselassie")
                  }
                >
                  Telegram
                </Text>
              </View>
            </View>
            <View className="flex flex-row justify-evenly gap-3 mx-2 border-b-[4px] pb-3 border-[#7E7876]">
              <View className="flex-1">
                <View className="h-[80px] bg-[#121214]/50 rounded-2xl justify-center items-center">
                  <Text className="text-white text-[40px] font-jura text-center leading-none">
                    {totalActiveMembers || 0}
                  </Text>
                </View>
                <Text className="text-white text-[15px] mx-1 font-jura-bold leading-none text-center">
                  {t(`dashboard.Total Active Members`)}
                </Text>
              </View>
              <View className="flex-1">
                <View className="h-[80px] bg-[#AC8C2D]/70 rounded-2xl justify-center items-center">
                  <Text className="text-white text-[40px] font-jura text-center leading-none">
                    {todayAttendance || 0}
                  </Text>
                </View>
                <Text className="text-white pt-[9px] text-[15px] mx-1 font-jura-bold leading-none text-center">
                  {t(`dashboard.Today Visits`)}
                </Text>
              </View>
              <View className="flex-1">
                <View className="h-[80px] bg-[#DD2020]/60 rounded-2xl justify-center items-center">
                  <Text className="text-white text-[40px] font-jura text-center leading-none">
                    {paymentDueMembers || 0}
                  </Text>
                </View>
                <Text className="text-white text-[15px] mx-1 font-jura-bold leading-none text-center">
                  {t(`dashboard.Payment Due Soon`)}
                </Text>
              </View>
            </View>
            {QRScan && (
              <>
                <TouchableWithoutFeedback onPress={() => setQRScan(false)}>
                  <View className="absolute inset-0 z-40" />
                </TouchableWithoutFeedback>
                <View className="absolute z-50 h-[330px] w-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
                  {loading ? (
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  ) : (
                    <View className="flex flex-row justify-center gap-1 items-center">
                      <Text className="text-white bg-gray-700 h-8 text-[24px] font-jura-bold text-center leading-none">
                        {scanned}
                      </Text>
                      {!["Not Found", "Already Attended", ""].includes(
                        scanned,
                      ) && (
                        <AntDesign
                          name="check-circle"
                          size={24}
                          color="green"
                        />
                      )}
                    </View>
                  )}
                  <View className="flex-1 rounded-2xl overflow-hidden">
                    <CameraView
                      style={{ flex: 1 }}
                      barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                      }}
                      onBarcodeScanned={({ data }) => {
                        if (scannedData === data) return null;
                        setScannedData(data);
                        attendance(data);
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="bg-[#0e970e] self-center px-2 py-1 mt-2 rounded-2xl"
                    onPress={() => {
                      (setScanned(""), setScannedData(""));
                    }}
                  >
                    <Text className="text-white font-jura-bold text-center text-2xl">
                      {t(`dashboard.Scan Again`)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            <View className="flex flex-row h-14 w-full pt-3 px-2 items-center justify-between">
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#00FF00]/50 px-3 rounded-2xl justify-center items-center h-10"
                  onPress={syncData}
                >
                  <Text className="text-white text-[24px] font-jura-bold text-center leading-none">
                    Sync -{" "}
                    {Number(memberLocalNumber) +
                      Number(attendancLocalNumber) +
                      Number(localTransactionNumber)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setConfirm(true)}>
                  <Image source={remove} className="h-7 w-6" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-[#00FF00]/50 px-3 rounded-2xl justify-center items-center h-10"
                onPress={scanQR}
              >
                <Text className="text-white text-[24px] font-jura-bold text-center leading-none">
                  {t(`dashboard.QR-Code`)}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 gap-4 mt-5 mb-8">
              <View className="w-auto h-1/3 flex flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl relative justify-center py-2 items-center gap-2"
                  onPress={() => {
                    setPressedPage("ManageMembers");
                    router.push("/AdminManagments/ManageMembers");
                  }}
                  disabled={pressedPage === "ManageMembers"}
                >
                  {!["0", 0].includes(memberLocalNumber) && (
                    <Text className="absolute top-0 left-4 text-white text-[20px] font-jura">
                      {memberLocalNumber}
                    </Text>
                  )}
                  <Image source={memberM} />
                  <View>
                    <Text className="text-white text-[25px] font-jura text-center tracking-[2px] leading-none">
                      {t(`dashboard.Manage Members`)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center relative py-2 items-center gap-2"
                  onPress={() => {
                    setPressedPage("ManagePayments");
                    router.push("/AdminManagments/ManagePayments");
                  }}
                  disabled={pressedPage === "ManagePayments"}
                >
                  {!["0", 0].includes(localTransactionNumber) && (
                    <Text className="absolute top-0 left-4 text-white text-[20px] font-jura">
                      {localTransactionNumber}
                    </Text>
                  )}
                  <Image source={transactionM} />
                  <View>
                    <Text className="text-white text-[25px] font-jura text-center tracking-[2px] leading-none">
                      {t(`dashboard.Manage Payments`)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View className="w-auto h-1/3 flex flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl relative justify-center py-2 items-center gap-2"
                  onPress={() => {
                    setPressedPage("AttendanceLogs");
                    router.push("/AdminManagments/AttendanceLogs");
                  }}
                  disabled={pressedPage === "AttendanceLogs"}
                >
                  {!["0", 0].includes(attendancLocalNumber) && (
                    <Text className="absolute top-0 left-4 text-white text-[20px] font-jura">
                      {attendancLocalNumber}
                    </Text>
                  )}
                  <Image source={attendanceM} />
                  <View>
                    <Text className="text-white text-[25px] font-jura text-center tracking-[2px] leading-none">
                      {t(`dashboard.Attendance Logs`)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center py-2 items-center gap-2"
                  onPress={() => {
                    setPressedPage("ManageMembershipPlans");
                    router.push("/AdminManagments/ManageMembershipPlans");
                  }}
                  disabled={pressedPage === "ManageMembershipPlans"}
                >
                  <Image source={membershipM} />
                  <View>
                    <Text className="text-white text-[25px] font-jura text-center leading-none">
                      {t(`dashboard.Manage Membership Plans`)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View className="w-auto h-1/3 flex flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center py-2 items-center gap-2"
                  onPress={() => {
                    setPressedPage("ManageWorkoutPlans");
                    router.push("/AdminManagments/ManageWorkoutPlans");
                  }}
                  disabled={pressedPage === "ManageWorkoutPlans"}
                >
                  <Image source={workoutM} />
                  <View>
                    <Text className="text-white text-[25px] font-jura text-center leading-none">
                      {t(`dashboard.Manage Workout Plans`)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center py-2 items-center gap-2"
                  onPress={() => {
                    setPressedPage("ProgramAndPlans");

                    router.push("/AdminManagments/ProgramAndPlans");
                  }}
                  disabled={pressedPage === "ProgramAndPlans"}
                >
                  <Image source={programsM} />
                  <View>
                    <Text className="text-white text-[25px] font-jura text-center leading-none">
                      {t(`dashboard.Program & Plans`)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            {editProfile && (
              <UpdateProfile
                setRemove={setEditProfile}
                type="Edit Profile"
                save={saveProfile}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                loading={loadings}
                adminData={adminData}
              />
            )}
            {confirm && (
              <Confirmation
                setRemove={setConfirm}
                title="Are you sure?"
                content="This will delete all offline datas before sync"
                onConfirmed={emptyLocalData}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppGradient>
  );
};

export default AdminDashboard;
