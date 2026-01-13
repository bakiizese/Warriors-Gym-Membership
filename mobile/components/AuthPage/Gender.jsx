import React from "react";
import { TouchableOpacity, View, Text, ImageBackground } from "react-native";
import male from "@/assets/images/male.png";
import female from "@/assets/images/female.png";

const Gender = ({ gender, setGender }) => {
  const selectedTexture = "bg-[#363535]/90 border-[5px] border-[#DDDDDD]/80";

  return (
    <View className="flex-1 items-center justify-center mb-14">
      <ImageBackground
        source={gender === "male" ? male : female}
        resizeMode="contain"
        className="absolute h-full w-full"
      />
      <View className="w-[250px] justify-center">
        <TouchableOpacity
          onPress={() => setGender("male")}
          activeOpacity={0.8}
          className={`${gender === "male" ? selectedTexture : "bg-[#363535]/50"} h-[80px] rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setGender("female")}
          activeOpacity={0.8}
          className={`${gender === "female" ? selectedTexture : "bg-[#363535]/50"} h-[80px] bg-[#363535]/50 rounded-xl justify-center items-center`}
        >
          <Text className="text-white text-[45px] font-jura-bold">Female</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Gender;
