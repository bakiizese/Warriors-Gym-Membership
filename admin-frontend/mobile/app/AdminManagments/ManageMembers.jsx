import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import AppGradient from "../../components/AppGradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import SearchAndFilter from "../../components/SearchAndFilter";
import profile from "../../assets/icons/profile.png";
import remove from "../../assets/icons/delete.png";

const ManageMembers = () => {
  const router = useRouter();
  return (
    <AppGradient>
      <View className="flex-1">
        <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={33} color="black" />
          </Pressable>
          <Text className="text-white h-10 pl-2 leading-none text-[30px] font-jura-bold">
            Manage Members
          </Text>
        </View>
        <SearchAndFilter />
        <View className="h-10 w-full flex flex-row justify-between px-6 my-4 items-center">
          <Text className="text-white leading-none text-[25px] font-jura">
            Members
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            className="bg-[#56C556] rounded-[25px] h-[45px] w-[130px] px-2 items-center justify-center"
          >
            <Text className="text-white leading-none text-[20px] font-jura text-center">
              Add Member
            </Text>
          </TouchableOpacity>
        </View>
        <View className="bg-[#25252A]/60 mb-10 flex-1 mx-3 rounded-xl overflow-hidden py-2">
          <View className="bg-white/10 h-16 w-full flex flex-row items-center  justify-between">
            <View className="flex flex-row items-center gap-2">
              <View className="flex w-14 h-full items-center">
                <View className="h-2 w-14 bg-red-600" />
                <Image
                  source={profile}
                  resizeMode="contain"
                  className="h-[49px] w-[49px] rounded-full p-2 border-[1px] border-[#00FF00]"
                />
              </View>
              <View>
                <Text className="text-black leading-none text-[18px] font-jura text-start">
                  Samuel Brhane
                </Text>
                <Text className="text-black leading-none text-[18px] font-jura text-start">
                  Monthly Plan
                </Text>
              </View>
              <View className="h-full flex justify-center gap-4 pb-2">
                <View className="h-[5px] w-[5px] bg-black rounded-full" />
                <View className="h-[5px] w-[5px] bg-black rounded-full" />
              </View>
              <View>
                <Text className="text-black leading-none text-[18px] font-jura text-start">
                  24-04-2025
                </Text>
                <Text className="text-black leading-none text-[18px] font-jura text-start">
                  32897
                </Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.8} className="mx-3">
              <Image source={remove} className="h-8 w-7" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppGradient>
  );
};

export default ManageMembers;
