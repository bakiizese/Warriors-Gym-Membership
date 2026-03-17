import React from "react";
import { TouchableOpacity, View, Text, ImageBackground } from "react-native";
import male from "@/assets/images/male.png";
import female from "@/assets/images/female.png";
import { useTranslation } from "react-i18next";

const Gender = ({ gender, setGender }) => {
  const selectedTexture = "bg-[#363535]/90 border-[5px] border-[#DDDDDD]/80";
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center">
      <ImageBackground
        source={gender === "Male" ? male : female}
        resizeMode="contain"
        className="absolute h-full w-full"
      />
      <View className="w-[250px] justify-center gap-3">
        <TouchableOpacity
          onPress={() => setGender("Male")}
          activeOpacity={0.8}
          className={`${gender === "Male" ? selectedTexture : "bg-[#363535]/50"} h-[80px] rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">
            {t(`profile.Male`)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setGender("Female")}
          activeOpacity={0.8}
          className={`${gender === "Female" ? selectedTexture : "bg-[#363535]/50"} h-[80px] bg-[#363535]/50 rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">
            {t(`profile.Female`)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Gender;
