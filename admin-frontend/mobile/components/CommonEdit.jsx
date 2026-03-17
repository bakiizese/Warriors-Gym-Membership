import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import remove from "../assets/icons/remove.png";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

const CommonEdit = ({
  children,
  errorMessage,
  checkData,
  setRemove,
  loading,
  title,
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  return (
    <View
      className={`${isKeyboardVisible ? "pb-150px] top-[280px]" : "top-1/2"} z-40  flex-1 justify-center items-center absolute -translate-x-1/2  -translate-y-1/2 left-1/2`}
    >
      {loading && (
        <View className="flex-1 bg-black/20 absolute inset-0 z-20">
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            className="flex-1"
            style={{ transform: [{ scale: 2 }] }}
          />
        </View>
      )}
      <View className="h-[100%] w-[360px] rounded-3xl overflow-hidden">
        <LinearGradient
          colors={["#6292EB", "#EBA262"]}
          className="absolute inset-0"
          pointerEvents="none"
        />
        <View className="flex-1 justify-start items-center ">
          <View className="bg-black/20 h-14  w-full justify-center items-center relative">
            <TouchableOpacity
              onPress={() => setRemove(false)}
              className="absolute h-6 w-10 top-2 right-2"
            >
              <Image
                source={remove}
                resizeMode="contain"
                className="h-6 w-10"
              />
            </TouchableOpacity>

            <Text className="text-white text-[30px] font-jura">{title}</Text>
          </View>

          <ScrollView
            className={`${isKeyboardVisible ? "h-[300px]" : ""} w-full`}
          >
            {children}
          </ScrollView>
        </View>
        {errorMessage && (
          <Text className="text-red-700 text-[18px] font-jura leading-none text-center mb-1">
            * {errorMessage}
          </Text>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-[#56C556]/40 mx-[90px] h-[45px] rounded-3xl justify-center items-center p-2 mb-2"
          onPress={checkData}
        >
          <Text className="text-white text-[32px] font-jura-bold leading-none">
            {t("components.Save")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommonEdit;
