import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import AppGradient from "../../components/AppGradient";
import SearchAndFilter from "../../components/SearchAndFilter";
import ApiClient from "../../utils/ApiClient";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

const AttendanceLogs = () => {
  const router = useRouter();
  const [attendanceLog, setAttendanceLog] = useState([]);
  const filterSelections = ["Member Id", "Name", "Gender", "Date", "Check In"];
  const [filteredAttendanceLog, setfilteredAttendanceLog] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    offlineData();
    fetchAttendance();
  }, []);

  const offlineData = async () => {
    const localAttendances = await AsyncStorage.getItem("localAttendance");
    const parsedLocalAttendances = JSON.parse(localAttendances);

    const attendances = await AsyncStorage.getItem("attendances");
    const paresedAttendance = JSON.parse(attendances);
    if (paresedAttendance) {
      if (parsedLocalAttendances) {
        const concated = paresedAttendance.concat(parsedLocalAttendances);
        setAttendanceLog(concated);
        search(filterSelections[0], true, concated);
      } else {
        setAttendanceLog(paresedAttendance);
        search(filterSelections[0], true, paresedAttendance);
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
      setAttendanceLog(res.data.attendanceLog);
      search(filterSelections[0], true, res.data.attendanceLog);
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

  const search = (filterDataBy, isAscending, Datas = null, searchText = "") => {
    const filterMap = {
      Date: "check_in",
      "Member Id": "id",
      Name: "full_name",
      Gender: "gender",
      "Check In": "check_in",
    };

    const filterBy = filterMap[filterDataBy];
    let data = Datas ?? attendanceLog;
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();

      data = data.filter((item) => {
        let value;

        if (["Member Id", "Name", "Gender"].includes(filterDataBy)) {
          value = item.attendanceMember[filterBy];
        } else {
          value = item[filterBy];
        }

        if (["Name", "Gender"].includes(filterDataBy)) {
          return value.toLowerCase().includes(lowerSearch);
        }

        if (filterDataBy === "Member Id") {
          return value.toString().includes(searchText);
        }

        if (["Date", "Check In"].includes(filterDataBy)) {
          const formattedDate =
            filterDataBy === "Check In"
              ? formatDate(value, true)
              : formatDate(value);
          return formattedDate.toLowerCase().includes(lowerSearch);
        }

        return false;
      });
    }

    const sorted = [...data].sort((a, b) => {
      const modifier = isAscending ? 1 : -1;

      let aValue = ["Member Id", "Name", "Gender"].includes(filterDataBy)
        ? a.attendanceMember[filterBy]
        : a[filterBy];
      let bValue = ["Member Id", "Name", "Gender"].includes(filterDataBy)
        ? b.attendanceMember[filterBy]
        : b[filterBy];

      if (["Date", "Check In"].includes(filterDataBy)) {
        return (new Date(aValue) - new Date(bValue)) * modifier;
      }

      if (filterDataBy === "Member Id") {
        return (aValue - bValue) * modifier;
      }

      if (filterDataBy === "Name" || filterDataBy === "Gender") {
        return aValue.localeCompare(bValue) * modifier;
      }

      return aValue.localeCompare(bValue) * modifier;
    });

    setfilteredAttendanceLog(sorted);
  };

  return (
    <AppGradient>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1 justify-center items-center">
          <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={33} color="black" />
            </Pressable>
            <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
              {t("attendanceLog.Attendance Logs")}
            </Text>
          </View>
          <SearchAndFilter
            filterSelections={filterSelections}
            search={search}
          />

          <View className="h-10 w-full flex flex-row justify-between px-6 my-2 items-center">
            <Text className="text-white leading-none text-[20px] font-jura">
              {t("attendanceLog.Attendance Logs")}
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
                    {t("attendanceLog.Date")}
                  </Text>
                  <Text
                    style={{ width: "105" }}
                    className="text-white bg-zinc-800 py-[2px] leading-none text-[16px] font-jura text-center"
                  >
                    {t("attendanceLog.Member")}
                  </Text>
                  <Text className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center">
                    {t("attendanceLog.Member Id")}
                  </Text>
                  <Text className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center">
                    {t("attendanceLog.Gender")}
                  </Text>
                  <Text className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center">
                    {t("attendanceLog.Check In")}
                  </Text>
                  <Text className="text-white bg-zinc-800 px-2 py-[2px] leading-none text-[16px] font-jura text-center">
                    {t("attendanceLog.Check Out")}
                  </Text>
                </View>
                {filteredAttendanceLog.map((item, index) => {
                  return (
                    <View
                      key={index}
                      className={`${item?.isLocal ? "bg-gray-600" : "bg-white/10"} flex-1 rounded-xl flex flex-row items-center my-1 py-1 px-2 justify-between`}
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
      </SafeAreaView>
    </AppGradient>
  );
};

export default AttendanceLogs;
