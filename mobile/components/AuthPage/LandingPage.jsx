import React from "react";
import { View, Text } from "react-native";
import { ImageBackground } from "../AppImage";
import logo from "@/assets/images/logo.png";
import { useTranslation } from "react-i18next";

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <View className="flex-1">
        <ImageBackground
          source={logo}
          className="flex h-full w-full"
          resizeMode="contain"
        />
      </View>
      <View className="mx-7 flex flex-col gap-4">
        <View className="bg-[#FFFFFF] h-2  rounded-full" />
        <View className="">
          <Text className="text-white text-[15px] font-jura-bold">
            {t("landingPage.Address")} ----, ----, ----
          </Text>
          <Text className="text-white text-[15px] font-jura-bold">
            {t("landingPage.Contact")} +251-9, +251-9
          </Text>
        </View>
      </View>
    </>
  );
};

export default LandingPage;
