import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import AppGradient from "../../components/AppGradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import SearchAndFilter from "../../components/SearchAndFilter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiClient, { fetchUrl } from "../../utils/ApiClient";
import axios from "axios";

const AttendanceLogs = () => {
  const router = useRouter();
  const [attendanceLog, setAttendanceLog] = useState([]);

  useEffect(() => {
    offlineData();
    fetchAttendance();
  }, []);

  const offlineData = async () => {
    const attendances = await AsyncStorage.getItem("attendances");
    const paresedAttendance = JSON.parse(attendances);
    if (paresedAttendance) {
      setAttendanceLog(paresedAttendance);
    }
  };

  const fetchAttendance = async () => {
    fetchUrl();
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.get("/admin/attendanceLog", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem(
        "attendances",
        JSON.stringify(res.data.attendanceLog),
      );
      setAttendanceLog(res.data.attendanceLog);
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

  const formatDate = (createdAt, onlyTime = "") => {
    const date = new Date(createdAt);
    if (onlyTime) {
      const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return time;
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <AppGradient>
      <View className="flex-1 justify-center items-center">
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
            Attendance Logs
          </Text>
        </View>
        <SearchAndFilter />
        <View className="h-10 w-full flex flex-row justify-between px-6 my-2 items-center">
          <Text className="text-white leading-none text-[20px] font-jura">
            Attendance Log
          </Text>
        </View>
        <View className="flex-1 w-full">
          <ScrollView
            className="flex-1 mx-2 bg-[#25252A]/60 rounded-xl px-2 mb-6"
            horizontal
          >
            <ScrollView stickyHeaderIndices={[0]}>
              <View className="flex bg-[#4b4b50] flex-row items-center gap-3 px-2">
                <Text
                  style={{ width: "100" }}
                  className="text-white bg-zinc-800 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  Date
                </Text>
                <Text
                  style={{ width: "105" }}
                  className="text-white bg-zinc-800 py-[2px] leading-none text-[16px] font-jura text-center"
                >
                  Member
                </Text>
                <Text className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center">
                  Member Id
                </Text>
                <Text className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center">
                  Gender
                </Text>
                <Text className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center">
                  Check In
                </Text>
                <Text className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center">
                  Check Out
                </Text>
              </View>
              {attendanceLog.map((item, index) => {
                return (
                  <View
                    key={index}
                    className="bg-white/10 flex-1 rounded-xl flex flex-row items-center my-1 py-1 px-2 justify-between"
                  >
                    <View className="flex flex-row items-center gap-3">
                      <Text
                        style={{ width: "100" }}
                        className="text-black leading-none text-[16px] max-h-5 font-jura text-center"
                      >
                        {formatDate(item.check_in)}
                      </Text>
                      <Text
                        style={{ width: "105" }}
                        className="text-black leading-none text-center text-[16px] max-h-5 font-jura"
                      >
                        {item.attendanceMember.full_name}
                      </Text>
                      <Text
                        style={{ width: "95" }}
                        className="text-black leading-none text-[16px] max-h-5  font-jura text-center"
                      >
                        {item.attendanceMember.id}
                      </Text>
                      <Text
                        style={{ width: "67" }}
                        className="text-black leading-none text-[16px] max-h-5  font-jura text-center"
                      >
                        {item.attendanceMember.gender}
                      </Text>
                      <Text
                        style={{ width: "80" }}
                        className="text-black leading-none text-[16px] max-h-5  font-jura text-center"
                      >
                        {formatDate(item.check_in, "onlyTime")}
                      </Text>
                      <Text
                        style={{ width: "85" }}
                        className="text-black leading-none text-[16px] max-h-5  font-jura text-center"
                      >
                        {item.check_out || "--------"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </ScrollView>
        </View>
      </View>
    </AppGradient>
  );
};

export default AttendanceLogs;
