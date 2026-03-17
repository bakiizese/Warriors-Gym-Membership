import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import { useTranslation } from "react-i18next";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import profile from "../assets/icons/profile.png";

import pp from "../assets/icons/pp.png";
import wp from "../assets/icons/wp.png";

import AppGradient from "../components/AppGradient";
import AttendanceHead from "../components/AttendanceHead";
import { femaleImages, maleImages } from "../constants/motivation-image";
import i18n from "../i18n";
import ApiClient from "../utils/ApiClient";

export default function MemberDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [daysLeft, setDaysLeft] = useState(0);
  const [remainingTicket, setRemainingTicket] = useState(0);
  const [isOffline, setIsOffline] = useState(true);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [membership, setMembership] = useState({});
  const [isProcess, setIsProcess] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lineSignal, setLineSignal] = useState("");
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;
  const [attendanceDays, setAttendanceDays] = useState([]);
  const { t } = useTranslation();
  let token;
  const nowTime = new Date();
  const [todayImage, setTodayImage] = useState(nowTime.getDate());
  const [loading, setLoading] = useState(false);
  const [pressed, setPressed] = useState(null);

  const onRefresh = async () => {
    setIsProcess("");
    setPressed("");
    setRefreshing(true);
    await loadPage();
    setRefreshing(false);
  };

  useEffect(() => {
    setPressed("");
    loadPage();
  }, []);

  const loadPage = async () => {
    setTodayImage(nowTime.getDate());
    await offlineData();
    const network = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log("Working in Online Mode");
        setLineSignal("Online");
        await onlineData();
        await fetchMembership();
      } else {
        console.log("Working in Offline Mode");
        setLineSignal("Offline");
        await offlineData();
      }
    });
    return () => network();
  };

  const offlineData = async () => {
    setIsOffline(true);
    console.log("in Offline");
    const userData = await AsyncStorage.getItem("userData");
    if (userData) {
      const parseUserData = JSON.parse(userData);
      setUserData(parseUserData ?? {});
    }
    const MembershipData = await AsyncStorage.getItem("membership");
    if (MembershipData) {
      const parseMembershipData = JSON.parse(MembershipData);
      setMembership(parseMembershipData ?? {});
    }

    const attendanceLogData = await AsyncStorage.getItem("attendanceLog");
    if (attendanceLogData) {
      const parseAttendanceLog = JSON.parse(attendanceLogData);
      setAttendanceLog(parseAttendanceLog ?? []);
      setAttendanceDays(
        attendanceToNumber(
          parseAttendanceLog ? parseAttendanceLog.slice(-5) : [],
        ),
      );
    }
  };

  const onlineData = async () => {
    setPressed("");
    setIsOffline(false);
    token = await AsyncStorage.getItem("userToken");
    if (!token) {
      router.replace("/AuthPage");
      return;
    }
    try {
      const res = await ApiClient.get("/member/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userD = res.data.member;

      await AsyncStorage.setItem("userData", JSON.stringify(userD));

      if (res?.data?.member?.image) {
        setLoading(true);
        setLoading(false);
        saveFile(res?.data?.member);
      }

      setUserData(userD);
      i18n.changeLanguage(userD.language);
      fetchMembership();
      fetchAttendance();
      fetchMembershipPlans();
      fetchPrograms();
    } catch (err) {
      offlineData();
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          console.log("backend not responding");
        } else if (
          err.response?.status === 400 ||
          err.response?.status === 401
        ) {
          console.log("token error");
          await AsyncStorage.clear();
          router.replace("/AuthPage");
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
      return;
    }
  };

  const saveFile = async (member) => {
    const fileUri = member?.image;
    try {
      const filename = fileUri?.split("/").pop();
      const localpath = FileSystem.documentDirectory + filename;
      const checkFile = await FileSystem.getInfoAsync(localpath);

      if (checkFile.exists) {
        member.image = checkFile.uri;
        await AsyncStorage.setItem("userData", JSON.stringify(member));
        return checkFile.uri;
      }

      const { uri } = await FileSystem.downloadAsync(
        `${ADDRESS}/${fileUri}`,
        localpath,
      );
      if (uri) {
        member.image = uri;
        await AsyncStorage.setItem("userData", JSON.stringify(member));
      }
      return uri;
    } catch (err) {
      console.log(err);
      return 0;
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
        } else if (err.response?.status === 404) {
          setMembership({});
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
      const attendanceLog = res.data.attendanceLog;

      await AsyncStorage.setItem(
        "attendanceLog",
        JSON.stringify(attendanceLog),
      );
      setAttendanceLog(attendanceLog);
      setAttendanceDays(attendanceToNumber(attendanceLog.slice(-5)));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          console.log("backend not responding");
          offlineData();
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

  const attendanceToNumber = (attendance) => {
    const newList = [];
    const now = new Date();

    for (const attend of attendance) {
      const att = new Date(attend.check_in);
      if (
        !newList.includes(att.getDate()) &&
        now >= att &&
        now.getMonth() === att.getMonth() &&
        now.getFullYear() === att.getFullYear()
      ) {
        newList.push(att.getDate());
      }
    }
    return newList;
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

      const prevCheckIn =
        parsePrevAttendancLog[parsePrevAttendancLog.length - 1]?.check_in;
      const prevCheckInDate = new Date(prevCheckIn);
      const subs = Math.abs(checkIn - prevCheckInDate) / (1000 * 60 * 60);
      if (subs < 23) {
        console.log("already attended");
        return;
      }

      parsePrevAttendancLog.push(offlineAttendance);
      await AsyncStorage.setItem(
        "attendanceLog",
        JSON.stringify(parsePrevAttendancLog),
      );
      setAttendanceDays(
        attendanceToNumber(
          parsePrevAttendancLog ? parsePrevAttendancLog.slice(-5) : [],
        ),
      );
      setAttendanceLog(parsePrevAttendancLog);
    } else {
      console.log("online attend");
      setTimeout(() => {
        fetchAttendance();
      }, 5000);
    }
  };

  useEffect(() => {
    if (!membership || Object.keys(membership).length <= 0) return;
    if (isOffline) {
      const now = new Date();
      const end = new Date(membership?.end_date);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const daysLeft = Math.floor((endDay - today) / (1000 * 60 * 60 * 24));

      setDaysLeft(daysLeft);

      if (membership?.membershipPlan?.plan_type === "Ticket") {
        const ticketAmount = membership?.ticket;
        const attendance = attendanceLog?.filter(
          (item) => item.membership_id === membership.id,
        );

        const remainingT = ticketAmount - attendance?.length;
        setRemainingTicket(remainingT);
        setDaysLeft(daysLeft);
      }
    } else {
      setDaysLeft(membership?.daysLeft);
      if (membership?.membershipPlan?.plan_type === "Ticket") {
        setRemainingTicket(membership?.remainingTicket);
      }
    }
  }, [attendanceLog, membership]);

  useFocusEffect(
    useCallback(() => {
      onlineData();
    }, []),
  );

  useEffect(() => {
    if (lineSignal !== "") {
      const timer = setTimeout(() => {
        setLineSignal("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lineSignal]);

  const checkIn = () => {
    setIsProcess("qrcode");
    saveAttendance();
  };

  const checkInAvailable = () => {
    return (
      Object.keys(membership).length === 0 ||
      daysLeft <= 0 ||
      (membership.membershipPlan.plan_type === "Ticket" && remainingTicket <= 0)
    );
  };

  const fetchMembershipPlans = async () => {
    const token = await AsyncStorage.getItem("userToken");
    try {
      const res = await ApiClient.get("/member/membership_plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem(
        "membershipPlan",
        JSON.stringify(res.data.membershipPlan),
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

  const fetchPrograms = async () => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      const res = await ApiClient.get("/member/programs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem("programs", JSON.stringify(res.data.programs));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400 || err.response?.status === 401) {
          console.log("token error");
          await AsyncStorage.clear();
          router.replace("/AuthPage");
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

  return (
    <AppGradient>
      <SafeAreaView className="flex-1 relative py-3">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {loading && (
            <View className="flex-1 bg-black/10 absolute inset-0 z-20">
              <ActivityIndicator
                size="large"
                color="#FFFFFF"
                className="flex-1"
                style={{ transform: [{ scale: 2 }] }}
              />
            </View>
          )}
          <View className="flex-1">
            <View className="flex flex-row px-3 justify-between items-end py-1 border-b-[1px] border-[#7E7676] h-[65px]">
              <View className="flex">
                <Text className="text-white text-[28px] font-jura-bold leading-none tracking-[2px]">
                  {t(`dashboard.Hi`)}, {userData.full_name?.split(" ")[0]}
                </Text>
                <Text className="text-white text-[14px] font-jura leading-none tracking-[7px]">
                  {t("dashboard.Stay Hard...")}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  (setPressed("profile"),
                    router.push({
                      pathname: "./MemberPages/Profile",
                      params: {
                        userData: JSON.stringify(userData),
                        attendanceData: JSON.stringify(attendanceLog),
                      },
                    }));
                }}
                disabled={pressed === "profile"}
              >
                <Image
                  source={
                    userData?.image
                      ? {
                          uri: userData?.image.includes("file://")
                            ? userData?.image
                            : null,
                        }
                      : profile
                  }
                  resizeMode="contain"
                  className="h-[60px] w-[60px] rounded-full p-2 border-[1px] border-[#00FF00]"
                />
              </TouchableOpacity>
            </View>
            <View
              className={`items-center ${lineSignal === "" ? "Online" : lineSignal === "Online" ? "bg-[#00FF00]/20" : "bg-gray-400"}`}
            >
              <Text
                className={`${lineSignal === "Online" ? "text-[#00FF00]/70" : "text-gray-600"} text-[13px] font-jura-bold leading-none h-[15px] tracking-[3px]`}
              >
                {t(`dashboard.${lineSignal}`)}
              </Text>
            </View>
            <View className="h-[50px] w-full justify-center items-center relative">
              <AttendanceHead attendance={attendanceDays} now={nowTime} />
            </View>
            <View className="mx-2 relative overflow-hidden rounded-2xl bg-black items-center">
              <TouchableOpacity
                onPress={() => {
                  setTodayImage(todayImage >= 30 ? 1 : todayImage + 1);
                }}
                className="bg-black/10 left-0 h-full w-24 absolute z-20 rounded-r-[60%]"
              />
              <Image
                source={
                  userData.gender === "Female"
                    ? femaleImages[todayImage]
                    : maleImages[todayImage]
                }
                resizeMode="cover"
                className="h-[240px] w-full absolute"
                blurRadius={5}
              />
              <Image
                source={
                  userData.gender === "Female"
                    ? femaleImages[todayImage]
                    : maleImages[todayImage]
                }
                resizeMode="center"
                className="h-[240px] w-full"
              />
              <TouchableOpacity
                onPress={() => {
                  setTodayImage(todayImage <= 0 ? 30 : todayImage - 1);
                }}
                className="bg-black/10 right-0 h-full w-24 absolute z-20 rounded-l-[60%]"
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
                  {isProcess === "qrcode" && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className="flex-1"
                      onPress={() => setIsProcess("")}
                    >
                      <QRCode
                        value={String(userData.id)}
                        size={300}
                        color="black"
                        backgroundColor="white"
                        onPress={() => setIsProcess("nfc")}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
            <View className="w-full flex flex-row justify-evenly my-2 gap-5">
              <TouchableOpacity
                activeOpacity={0.5}
                className={`border-2 ${checkInAvailable() ? "bg-black/30" : "border-[#00FF00]"}  h-[40px] w-[130px] flex justify-center items-center rounded-3xl`}
                onPress={() => checkIn()}
                disabled={checkInAvailable()}
              >
                <Text className="text-white text-[23px] font-jura-bold leading-none">
                  {t("dashboard.Check In")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                className={`border-2 ${checkInAvailable() ? "bg-black/30" : "border-[#00FF00]"} h-[40px] w-[133px] flex justify-center items-center rounded-3xl`}
                disabled={checkInAvailable()}
              >
                <Text className="text-white text-[21px] font-jura-bold leading-none">
                  {t("dashboard.Check Out")}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              className={`flex flex-row justify-between items-center mx-3 rounded-3xl p-2 px-5 mb-2`}
              onPress={() => {
                setPressed("membership&payment");
                router.push("./MemberPages/Membership");
              }}
              style={{
                backgroundColor: membership?.membershipPlan
                  ? daysLeft <= 5 ||
                    (membership?.membershipPlan?.plan_type === "Ticket" &&
                      remainingTicket <= 3)
                    ? "#ef4444BF"
                    : "#AC8C2DBF"
                  : "#AC8C2DBF",
              }}
              disabled={pressed === "membership&payment"}
            >
              <View className="flex-1 gap-2">
                <View className="flex flex-row items-center gap-2">
                  <Text className="text-white text-[16px] font-jura-bold leading-none">
                    {t("dashboard.Membership")}
                  </Text>
                  <View className="h-[4px] w-[4px] bg-white rounded-full" />
                  <Text className="text-white text-[16px] font-jura-bold leading-none">
                    {Object.keys(membership).length > 0
                      ? membership.membershipPlan?.duration_days / 30 +
                        " " +
                        t(
                          `dashboard.${membership.membershipPlan?.membership_name}`,
                        )
                      : t("dashboard.None")}
                  </Text>
                </View>
                <View className="flex flex-row items-end gap-2">
                  {membership?.membershipPlan ? (
                    <View className="flex flex-row items-end">
                      {membership?.membershipPlan.plan_type === "Ticket" ? (
                        <View className="flex flex-row items-end gap-2">
                          <Text
                            className={`${remainingTicket <= 3 || daysLeft <= 5 ? "text-red-900" : "text-white"} text-[18px] font-jura-bold leading-none mb-1`}
                          >
                            {`${remainingTicket}`} {t(`dashboard.Tks Left for`)}{" "}
                            {`${daysLeft}`} {t(`dashboard.days`)}
                          </Text>
                        </View>
                      ) : (
                        <View className="flex flex-row gap-2 items-end">
                          <Text
                            className={`${daysLeft === 0 ? "text-red-900" : "text-white"} text-[18px] font-jura-bold leading-none mb-1`}
                          >
                            {daysLeft} {t("dashboard.Days Left")}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text className="text-red-900 text-[15px] py-1 font-jura-bold leading-none tracking-[2px] mb-1">
                      {t("dashboard.Select a Membership Plan")}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                className="border-2 border-[#00FF00] bg-[#00FF00]/20 rounded-xl h-[43px] w-[85px] justify-center items-center"
                onPress={() => {
                  setPressed("membership&payment");
                  Object.keys(membership).length > 0
                    ? router.push({
                        pathname: "./MemberPages/Payment",
                        params: {
                          membership: JSON.stringify(membership),
                          membershipPlan: {},
                        },
                      })
                    : router.push("./MemberPages/Membership");
                }}
                disabled={pressed === "membership&payment"}
              >
                <Text className="text-black text-[30px] font-jura-bold leading-none mb-1">
                  {t("dashboard.Pay")}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <View className="flex-1 pb-3 pt-1 flex-col gap-1">
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-black relative mx-3 flex-1 rounded-3xl overflow-hidden justify-center items-center mb-2"
                onPress={() => {
                  (setPressed("workout"),
                    router.push("./MemberPages/Workout/WorkoutPlan"));
                }}
                disabled={pressed === "workout"}
              >
                <ImageBackground
                  source={wp}
                  resizeMode="cover"
                  className="absolute h-full w-full"
                />
                <Text className="text-white text-[30px] my-3 font-jura-bold leading-none">
                  {t("dashboard.Workout Plans")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-black relative mx-3 flex-1 rounded-3xl overflow-hidden justify-center items-center"
                onPress={() => {
                  (setPressed("program"),
                    router.push("./MemberPages/Programs"));
                }}
                disabled={pressed === "program"}
              >
                <ImageBackground
                  source={pp}
                  resizeMode="cover"
                  className="absolute h-full w-full"
                />
                <Text className="text-white text-[30px] text-center font-jura-bold leading-none">
                  {t("dashboard.Programs and Competitions")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AppGradient>
  );
}
