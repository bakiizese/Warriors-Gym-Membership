import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const Language = ({ language, setLanguage }) => {
  const selectedTexture = "bg-[#363535]/90 border-[5px] border-[#DDDDDD]/80";

  return (
    <View className="flex-1 items-center justify-center">
      <View className="flex flex-col w-[250px] gap-1">
        <TouchableOpacity
          onPress={() => setLanguage("English")}
          activeOpacity={0.8}
          className={`${language === "English" ? selectedTexture : "bg-[#363535]/50"} h-[80px] rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage("Tigrigna")}
          activeOpacity={0.8}
          className={`${language === "Tigrigna" ? selectedTexture : "bg-[#363535]/50"} h-[80px] bg-[#363535]/50 rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">
            Tigrigna
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage("Amharic")}
          activeOpacity={0.8}
          className={`${language === "Amharic" ? selectedTexture : "bg-[#363535]/50"} h-[80px] bg-[#363535]/50 rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">Amharic</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Language;
