import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
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
import SelectLanguage from "../components/SelectLanguage";
import ApiClient, { fetchUrl, getAddress } from "../utils/ApiClient";
import NFC from "../utils/NFC";
import * as FileSystem from "expo-file-system/legacy";

const AdminDashboard = () => {
  const router = useRouter();
  const [adminData, setAdminData] = useState();
  const [language, setLanguage] = useState("English");
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
  const ADDRESS = getAddress();
  const [pressedPage, setPressedPage] = useState("");

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
    fetchUrl();
    loadPage();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPressedPage("");
    }, []),
  );

  const offlineData = async () => {
    console.log("in offline");
    const adminData = await AsyncStorage.getItem("adminData");
    const parseAdminData = JSON.parse(adminData);

    setAdminData(parseAdminData);

    const activeMembersData = await AsyncStorage.getItem("activeMembers");
    const parseAMsData = JSON.parse(activeMembersData);
    setTotalActiveMembers(parseAMsData);

    const paymentDueMembersData =
      await AsyncStorage.getItem("paymentDueMembers");
    const parsePDMsData = JSON.parse(paymentDueMembersData);
    setPaymentDueMembers(parsePDMsData);

    const attendanceCount = await AsyncStorage.getItem("attendanceCount");
    setTodayAttendance(attendanceCount);
  };

  const saveFile = async (user) => {
    const fileUri = user?.image;
    try {
      const filename = fileUri?.split("/").pop();
      const localpath = FileSystem.documentDirectory + filename;
      const checkFile = await FileSystem.getInfoAsync(localpath);

      if (checkFile.exists) {
        user.image = checkFile.uri;
        await AsyncStorage.setItem("userData", JSON.stringify(user));
        return checkFile.uri;
      }

      const { uri } = await FileSystem.downloadAsync(
        `${ADDRESS}/${fileUri}`,
        localpath,
      );
      console.log("uri", uri);
      if (uri) {
        user.image = uri;
        await AsyncStorage.setItem("userData", JSON.stringify(user));
      }
      return uri;
    } catch (err) {
      console.log(err);
      return 0;
    }
  };

  const onlineData = () => {
    fetchUrl();
    const fetchAdminDashboard = async () => {
      try {
        const token = await AsyncStorage.getItem("adminToken");
        const res = await ApiClient.get("admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        await AsyncStorage.setItem("adminData", JSON.stringify(res.data.user));
        if (res?.data?.user?.image) {
          setLoadings(true);
          await saveFile(res?.data?.user);
          setLoadings(false);
        }
        setAdminData(res.data.user);
        fetchMembersStatus();
        fetchAttendanceLog();
      } catch (err) {
        console.log("ee", err);
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
      // console.log("member status", res.data.members_status);
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

  const scanNFC = async () => {
    console.log("in scanning");
    decoded = await NFC();
    if (decoded) {
      console.log(decoded);
      attendance(decoded);
    }
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
      // console.log("attendance", res.data.attendance);
      console.log("postat", res.data.attendance[1].full_name);
      setScanned(res.data.attendance[1].full_name);
      fetchAttendanceLog();
    } catch (err) {
      if (err.response?.status === 400) {
        setScanned("Already Attended");
      } else {
        setScanned("Not Found");
      }
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
    setLoading(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const image = {
        uri: file.uri || "http//",
        name: file.fileName || "fileaName",
        type: file.mimeType || "image/jpeg",
      };

      const token = await AsyncStorage.getItem("adminToken");
      const formData = new FormData();

      formData.append("file", image);

      try {
        const res = await axios.put(
          `http://${ADDRESS}/admin/picture`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log(res.data);
        onlineData();
      } catch (err) {
        console.log(err);
        if (axios.isAxiosError(err)) {
          const backendError = err.response?.data;
          console.log("backend error", backendError?.error);
          console.log("backend status", err.response?.status);
        } else if (err instanceof Error) {
          console.log("Generic Error:", err.message);
        } else {
          console.log("An unexpected error occurred", err);
        }
      }
    }
  };

  return (
    <AppGradient>
      <SafeAreaView className="flex-1 p-5 relative">
        {loadings && (
          <View className="flex-1 bg-black/10 absolute inset-0 z-20">
            <ActivityIndicator
              size="large"
              color="#FFFFFF"
              className="flex-1"
              style={{ transform: [{ scale: 2 }] }}
            />
          </View>
        )}
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
                  {adminData?.admin_level}
                </Text>
              </View>
              <TouchableOpacity
                className="flex"
                activeOpacity={0.8}
                onPress={() => pickImage()}
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
            <View className="flex flex-row justify-between mx-1 my-[9px]">
              <Text className="text-white text-[22px] font-jura leading-none">
                Select Language
              </Text>
              <View className="bg-[#777676] p-1 px-2 rounded-md border-[1px] border-[#424141] relative h-9 w-[120px] items-center">
                <SelectLanguage primary={language} setPrimary={setLanguage} />
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
                  Total Active Members
                </Text>
              </View>
              <View className="flex-1">
                <View className="h-[80px] bg-[#AC8C2D]/70 rounded-2xl justify-center items-center">
                  <Text className="text-white text-[40px] font-jura text-center leading-none">
                    {todayAttendance || 0}
                  </Text>
                </View>
                <Text className="text-white pt-[9px] text-[15px] mx-1 font-jura-bold leading-none text-center">
                  Today Visits
                </Text>
              </View>
              <View className="flex-1">
                <View className="h-[80px] bg-[#DD2020]/60 rounded-2xl justify-center items-center">
                  <Text className="text-white text-[40px] font-jura text-center leading-none">
                    {paymentDueMembers || 0}
                  </Text>
                </View>
                <Text className="text-white text-[15px] mx-1 font-jura-bold leading-none text-center">
                  Payment Due Soon
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
                    <View className="flex flex-row justify-center gap-1 items-center my-1">
                      <Text className="text-white h-6 text-[24px] font-jura-bold text-center leading-none">
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
                    className="bg-[#0e970e] self-center px-2 py-1  mt-2 rounded-2xl"
                    onPress={() => {
                      (setScanned(""), setScannedData(""));
                    }}
                  >
                    <Text className="text-white font-jura-bold text-center text-2xl">
                      Scan Again
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            <View className="flex flex-row h-14 w-full pt-3 px-2 items-center justify-between">
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-[#00FF00]/50 px-3 rounded-2xl justify-center items-center h-10"
                onPress={scanNFC}
              >
                <Text className="text-white text-[24px] font-jura-bold text-center leading-none">
                  Scan Tags
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                className="bg-[#00FF00]/50 px-3 rounded-2xl justify-center items-center h-10"
                onPress={scanQR}
              >
                <Text className="text-white text-[24px] font-jura-bold text-center leading-none">
                  QR-Code
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-1 gap-4 mt-5 mb-8">
              <View className="w-auto h-1/3 flex flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
                  onPress={() => {
                    setPressedPage("ManageMembers");
                    router.push("/AdminManagments/ManageMembers");
                  }}
                  disabled={pressedPage === "ManageMembers"}
                >
                  <Text className="text-white text-[25px] font-jura text-center leading-none">
                    Manage Members
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
                  onPress={() => {
                    setPressedPage("ManagePayments");
                    router.push("/AdminManagments/ManagePayments");
                  }}
                  disabled={pressedPage === "ManagePayments"}
                >
                  <Text className="text-white text-[25px] font-jura text-center leading-none">
                    Manage Payments
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="w-auto h-1/3 flex flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
                  onPress={() => {
                    setPressedPage("AttendanceLogs");
                    router.push("/AdminManagments/AttendanceLogs");
                  }}
                  disabled={pressedPage === "AttendanceLogs"}
                >
                  <Text className="text-white text-[25px] font-jura text-center leading-none">
                    Attendance Logs
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
                  onPress={() => {
                    setPressedPage("ManageMembershipPlans");
                    router.push("/AdminManagments/ManageMembershipPlans");
                  }}
                  disabled={pressedPage === "ManageMembershipPlans"}
                >
                  <Text className="text-white text-[25px] font-jura text-center leading-none">
                    Manage Membership Plans
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="w-auto h-1/3 flex flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
                  onPress={() => {
                    setPressedPage("ManageWorkoutPlans");
                    router.push("/AdminManagments/ManageWorkoutPlans");
                  }}
                  disabled={pressedPage === "ManageWorkoutPlans"}
                >
                  <Text className="text-white text-[25px] font-jura text-center leading-none">
                    Manage Workout Plans
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
                  onPress={() => {
                    setPressedPage("ProgramAndPlans");

                    router.push("/AdminManagments/ProgramAndPlans");
                  }}
                  disabled={pressedPage === "ProgramAndPlans"}
                >
                  <Text className="text-white text-[25px] font-jura text-center leading-none">
                    Program & Plans
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppGradient>
  );
};

export default AdminDashboard;
