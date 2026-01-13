import React from "react";
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchAndFilter = () => {
  return (
    <View className="h-16 w-full flex flex-row justify-between px-5 items-center border-b-[1px] border-[#474747]">
      <View className="flex flex-row gap-2">
        <TextInput
          className="bg-white w-[150px] h-8 rounded-3xl py-0 my-1 px-5 leading-none"
          placeholder="Search"
        />
        <Ionicons name="search" size={33} color="black" />
      </View>
      <View className="flex flex-row gap-1">
        <View className="bg-[#CDC8C8] h-8 w-20 rounded-3xl my-1 items-center justify-center">
          <Text className="text-black leading-none text-[20px] font-jura text-center">
            date
          </Text>
        </View>
        <Ionicons name="filter" size={33} color="black" />
      </View>
    </View>
  );
};

export default SearchAndFilter;
