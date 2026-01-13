import React, { useEffect, useState } from "react";
import {
  TextInput,
  View,
  Image,
  Text,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import phone from "@/assets/icons/phone.png";
import key from "@/assets/icons/key.png";
import hide_key from "@/assets/icons/hide_key.png";
import unhide_key from "@/assets/icons/hide_key.png";
import profile from "@/assets/icons/profile.png";

const Sign = ({
  signType,
  setFullName,
  fullName,
  setPhoneNumber,
  phoneNumber,
  setPassword,
  password,
  errorMessage,
}) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isInvisible, setIsInvisible] = useState(true);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <View
      className={`${isKeyboardVisible ? "py-24" : "justify-center"} flex-1 items-center mx-14 gap-2`}
    >
      {signType === "signUp" && (
        <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
          <Image source={profile} resizeMode="contain" className="h-7 w-7" />
          <TextInput
            value={fullName}
            onChangeText={(text) => setFullName?.(text)}
            placeholder="Full name"
            placeholderTextColor={"#FFFFFF6E"}
            className="text-white text-[18px] font-jura w-[90%]"
          />
        </View>
      )}
      <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
        <Image source={phone} resizeMode="contain" className="h-7 w-7" />
        <TextInput
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          placeholder="Phone number"
          placeholderTextColor={"#FFFFFF6E"}
          className="text-white text-[18px] font-jura w-[90%]"
        />
      </View>
      <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
        <Image source={key} resizeMode="contain" className="h-7 w-7" />
        <TextInput
          secureTextEntry={isInvisible}
          value={password}
          onChangeText={(text) => setPassword(text)}
          placeholder="Password"
          placeholderTextColor={"#FFFFFF6E"}
          className="text-white text-[18px] font-jura w-[75%]"
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsInvisible(!isInvisible)}
        >
          <Image
            source={isInvisible ? hide_key : unhide_key}
            resizeMode="contain"
            className="h-7 w-7"
          />
        </TouchableOpacity>
      </View>
      {errorMessage && errorMessage !== "none" && (
        <Text className="text-red-600/80 text-[15px] w-72 text-center">
          * {errorMessage}
        </Text>
      )}
      {errorMessage === "none" && (
        <ActivityIndicator size="large" color="#FFFFFF" />
      )}
    </View>
  );
};

export default Sign;
