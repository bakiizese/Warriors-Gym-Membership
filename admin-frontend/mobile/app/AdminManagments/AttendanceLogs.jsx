import React from "react";
import { View, Text } from "react-native";
import AppGradient from "../../components/AppGradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
const AttendanceLogs = () => {
  const router = useRouter();

  return (
    <AppGradient>
      <View className="flex-1 justify-center items-center">
        <View className="flex flex-row absolute left-0 top-0 bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
            Attendance Logs
          </Text>
        </View>
        <Text>AttendanceLogs</Text>
      </View>
    </AppGradient>
  );
};

export default AttendanceLogs;
