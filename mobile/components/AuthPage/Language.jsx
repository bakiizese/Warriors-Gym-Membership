import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const Language = ({ language, setLanguage }) => {
  const selectedTexture = "bg-[#363535]/90 border-[5px] border-[#DDDDDD]/80";

  return (
    <View className="flex-1 items-center justify-center">
      <View className="flex flex-col w-[250px] gap-1">
        <TouchableOpacity
          onPress={() => setLanguage("english")}
          activeOpacity={0.8}
          className={`${language === "english" ? selectedTexture : "bg-[#363535]/50"} h-[80px] rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage("tigrigna")}
          activeOpacity={0.8}
          className={`${language === "tigrigna" ? selectedTexture : "bg-[#363535]/50"} h-[80px] bg-[#363535]/50 rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">
            Tigrigna
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage("amharic")}
          activeOpacity={0.8}
          className={`${language === "amharic" ? selectedTexture : "bg-[#363535]/50"} h-[80px] bg-[#363535]/50 rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">Amharic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Language;
