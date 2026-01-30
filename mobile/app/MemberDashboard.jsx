import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import profile from "../assets/icons/profile.png";
import motive_image from "../assets/images/motive-images/My turn.jpeg";
import AppGradient from "../components/AppGradient";
import ApiClient from "../components/AuthPage/ApiClient";
import axios from "axios";
import LottieView from "lottie-react-native";
import processing from "../assets/icons/processing.json";
import QRCode from "react-native-qrcode-svg";
import sendNFCData from "../utils/sendNFCData";

export default function MemberDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [daysLeft, setDaysLeft] = useState();
  const [remainingTicket, setRemainingTicket] = useState();
  const [isOffline, setIsOffline] = useState(true);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [membership, setMembership] = useState();
  const [isProcess, setIsProcess] = useState("");
  let token;

  useEffect(() => {
    offlineData();
    const network = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log("Working in Online Mode");
        onlineData();
      } else {
        console.log("Working in Offline Mode");
        offlineData();
      }
    });

    return () => network();
  }, []);

  const offlineData = async () => {
    setIsOffline(true);
    // console.log("in Offline");
    const userData = await AsyncStorage.getItem("userData");
    const parseUserData = JSON.parse(userData);
    setUserData(parseUserData.userCheck);

    const MembershipData = await AsyncStorage.getItem("membership");
    const parseMembershipData = JSON.parse(MembershipData);
    setMembership(parseMembershipData);

    if (!parseUserData) {
      router.replace({ pathname: "/AuthPage", params: { path: 2 } });
    }
  };

  const onlineData = async () => {
    // console.log("in Online");
    setIsOffline(false);

    token = await AsyncStorage.getItem("userToken");
    try {
      const res = await ApiClient.get("/member/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({ userCheck: res.data.member }),
      );
      setUserData(res.data.member);
      fetchMembership();
      fetchAttendance();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err);
        if (!err.response) {
          console.log("backend not responding");
          offlineData();
          return;
        } else if (
          err.response?.status === 400 ||
          err.response?.status === 401
        ) {
          console.log("token error");
          router.replace("/AuthPage");
          await AsyncStorage.clear();
          return;
        }
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
  const fetchMembership = async () => {
    token = await AsyncStorage.getItem("userToken");

    try {
      const res = await ApiClient.get("/member/membership", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem(
        "membership",
        JSON.stringify(res.data.membership),
      );
      setMembership(res.data.membership);
    } catch (err) {
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
        if (err.response?.status === 404) {
          console.log("membership not foundd");
          setMembership();
          await AsyncStorage.setItem("membership", JSON.stringify({}));
        }
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
    const token = await AsyncStorage.getItem("userToken");
    try {
      const res = await ApiClient.get("/member/attendanceLog", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res.data.attendanceLog);
      const attendanceLog = res.data.attendanceLog;

      await AsyncStorage.setItem(
        "attendanceLog",
        JSON.stringify(attendanceLog),
      );
      setAttendanceLog(attendanceLog);
    } catch (err) {
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
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
    }
  };

  const saveAttendance = async () => {
    if (isOffline) {
      console.log("offline attend");

      const checkIn = new Date();
      const memberId = userData?.id;
      const membershipId = membership?.id;

      const offlineAttendance = {
        member_id: memberId,
        membership_id: membershipId,
        check_in: String(checkIn),
      };
      const prevAttendancLog = await AsyncStorage.getItem("attendanceLog");
      const parsePrevAttendancLog = prevAttendancLog
        ? JSON.parse(prevAttendancLog)
        : [];
      parsePrevAttendancLog.push(offlineAttendance);
      await AsyncStorage.setItem(
        "attendanceLog",
        JSON.stringify(parsePrevAttendancLog),
      );
      setAttendanceLog(parsePrevAttendancLog);
      console.log(prevAttendancLog);
    } else {
      console.log("online attend");
      fetchAttendance();
    }
  };

  useEffect(() => {
    if (!membership) return;
    if (isOffline) {
      // const now = new Date("2026-02-01T13:48:36.601Z");
      const now = new Date();
      const end = new Date(membership?.end_date);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const daysLeft = Math.floor((endDay - today) / (1000 * 60 * 60 * 24));

      setDaysLeft([daysLeft, "Days Left"]);

      if (membership?.membershipPlan?.plan_type === "Ticket") {
        const ticketAmount = membership?.ticket;
        const attendance = attendanceLog?.filter(
          (item) => item.membership_id === membership.id,
        );
        const remainingT = ticketAmount - attendance?.length;

        setRemainingTicket([remainingT, "Tickets Left"]);
        setDaysLeft(["For", daysLeft, "Days"]);
      }
    } else {
      setDaysLeft([membership?.daysLeft, "Days Left"]);
      if (membership?.membershipPlan?.plan_type === "Ticket") {
        setRemainingTicket([membership?.remainingTicket, "Tickets Left"]);
        setDaysLeft(["For", membership?.daysLeft, "Days"]);
      }
    }
  }, [membership]);

  const { reload } = useLocalSearchParams();
  useFocusEffect(
    useCallback(() => {
      onlineData();
    }, []),
  );

  const checkIn = () => {
    setIsProcess("nfc");
    sendNFCData(userData.id);
    saveAttendance();
  };

  return (
    <AppGradient>
      <SafeAreaView className="flex-1 relative py-5">
        <View className="flex-1">
          <View className="flex flex-row px-5 justify-between items-end py-1 border-b-[1px] border-[#7E7676] h-[65px]">
            <View className="flex">
              <Text className="text-white text-[14px] font-jura leading-none tracking-[2px]">
                Stay, Hard...
              </Text>
              <Text className="text-white text-[28px] font-jura-bold leading-none tracking-[2px]">
                Hi, {userData.full_name?.split(" ")[0]}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "./MemberPages/Profile",
                  params: { userData: JSON.stringify(userData) },
                })
              }
            >
              <Image
                source={userData.image_id ? userData.image_id : profile}
                resizeMode="contain"
                className="h-[60px] w-[60px] rounded-full p-2 border-[1px] border-[#00FF00]"
              />
            </TouchableOpacity>
          </View>
          <View className="bg-black h-[50px] w-full mt-3 mb-1 justify-center items-center">
            <Text className="text-white">Attendace</Text>
          </View>
          <View className="mx-2">
            <Image
              source={motive_image}
              resizeMode="cover"
              className="h-[240px] w-full rounded-2xl"
            />
          </View>
          {isProcess && (
            <>
              <TouchableWithoutFeedback onPress={() => setIsProcess("")}>
                <View className="absolute inset-0 z-40" />
              </TouchableWithoutFeedback>

              <View
                className={`${isProcess === "qrcode" ? "bg-[#00FF00]/70" : "bg-gray-700 rounded-full"} p-2 absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
              >
                {isProcess === "qrcode" ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-1"
                    onPress={() => setIsProcess("nfc")}
                  >
                    <QRCode
                      value={String(userData.id)}
                      size={300}
                      color="black"
                      backgroundColor="white"
                      onPress={() => setIsProcess("nfc")}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="flex-1"
                    onPress={() => setIsProcess("qrcode")}
                  >
                    <LottieView
                      source={processing}
                      autoPlay
                      loop
                      style={{ width: 110, height: 110 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
          <View className="w-full flex flex-row justify-evenly my-4 gap-5">
            <TouchableOpacity
              activeOpacity={0.5}
              className={`border-2 ${membership ? "border-[#00FF00]" : "bg-black/30"}  h-[50px] w-[130px] flex justify-center items-center rounded-3xl`}
              onPress={() => checkIn()}
              disabled={!membership}
            >
              <Text className="text-white text-[23px] font-jura-bold leading-none">
                Check In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.5}
              className={`border-2 ${membership ? "border-[#00FF00]" : "bg-black/30"} h-[50px] w-[133px] flex justify-center items-center rounded-3xl`}
              disabled={!membership}
            >
              <Text className="text-white text-[21px] font-jura-bold leading-none">
                Check Out
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex flex-row justify-between items-center mx-3 bg-[#AC8C2D]/70 rounded-3xl p-2 px-5 mb-2"
            onPress={() => router.push("./MemberPages/Membership")}
          >
            <View className="flex-1 gap-2">
              <View className="flex flex-row items-center gap-2">
                <Text className="text-white text-[16px] font-jura-bold leading-none">
                  Membership
                </Text>
                <View className="h-[4px] w-[4px] bg-white rounded-full" />
                <Text className="text-white text-[16px] font-jura-bold leading-none">
                  {membership
                    ? membership.membershipPlan?.membership_name
                    : "None"}
                </Text>
              </View>
              <View className="flex flex-row items-end gap-2">
                {membership?.membershipPlan ? (
                  <View className="flex flex-row items-end">
                    {membership?.membershipPlan.plan_type === "Ticket" ? (
                      <View className="flex flex-row items-end gap-2">
                        <Text className="text-white text-[30px] font-jura-bold leading-none">
                          {remainingTicket && remainingTicket?.[0]}
                        </Text>
                        <Text className="text-white text-[18px] font-jura-bold leading-none mb-1">
                          {remainingTicket && remainingTicket?.[1]}
                        </Text>
                        <Text className="text-white text-[18px] font-jura-bold leading-none mb-1">
                          {daysLeft?.[0]}
                        </Text>
                        <Text className="text-white text-[18px] font-jura-bold leading-none mb-1">
                          {daysLeft?.[1]}
                        </Text>
                        <Text className="text-white text-[18px] font-jura-bold leading-none mb-1">
                          {daysLeft?.[2]}
                        </Text>
                      </View>
                    ) : (
                      <View className="flex flex-row gap-2 items-end">
                        <Text className="text-white text-[30px] font-jura-bold leading-none">
                          {daysLeft?.[0]}
                        </Text>
                        <Text className="text-white text-[18px] font-jura-bold leading-none mb-1">
                          {daysLeft?.[1]}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Text className="text-red-900 text-[15px] py-1 font-jura-bold leading-none tracking-[2px] mb-1">
                    Select a Membership Plan
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              className="border-2 border-[#00FF00] bg-[#00FF00]/20 rounded-xl h-[43px] w-[85px] justify-center items-center"
              onPress={() =>
                membership
                  ? router.push({
                      pathname: "./MemberPages/Payment",
                      params: {
                        membershipPlan_name:
                          membership?.membershipPlan?.membership_name,
                        amount: membership?.membershipPlan?.fee,
                        membershipPlan_id: membership?.membershipPlan?.id,
                        duration_days:
                          membership?.membershipPlan?.duration_days,
                      },
                    })
                  : router.push("./MemberPages/Membership")
              }
            >
              {/* show only when its about time to due payment */}
              <Text className="text-black text-[30px] font-jura-bold leading-none mb-1">
                Pay
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
          <View className="flex-1">
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-black flex-1 mx-3 rounded-3xl justify-center items-center mb-2"
              onPress={() => router.push("./MemberPages/Workout/WorkoutPlan")}
            >
              <Text className="text-white text-[30px] font-jura-bold leading-none">
                Workout Plans
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-black flex-1 mx-3 rounded-3xl justify-center items-center mb-y"
            >
              <Text className="text-white text-[30px] font-jura-bold leading-none">
                Programs & Plans
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </AppGradient>
  );
}
