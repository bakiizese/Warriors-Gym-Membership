import React from "react";
import { ImageBackground, View, Text } from "react-native";
import logo from "@/assets/images/logo.png";
import { useTranslation } from "react-i18next";

const LangingPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <View className="flex-1">
        <ImageBackground
          source={logo}
          className="flex-1"
          resizeMode="contain"
        />
      </View>
      <View className="mx-7 flex flex-col gap-4">
        <View className="bg-[#FFFFFF] h-2  rounded-full" />
        <View className="">
          <Text className="text-white text-[15px] font-jura-bold">
            {t("landingPage.Address Tigray, Axum, Edaga Hamus")}
          </Text>
          <Text className="text-white text-[15px] font-jura-bold">
            {t("landingPage.Contact")} +251 938985735, +251
          </Text>
        </View>
      </View>
    </>
  );
};

export default LangingPage;
