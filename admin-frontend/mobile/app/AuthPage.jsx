import AppGradient from "@/components/AppGradient";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import arrow from "@/assets/icons/arrow.png";
import logo from "@/assets/images/logo.png";
import axios from "axios";
import ApiClient from "../components/ApiClient";

import {
  TextInput,
  View,
  Image,
  Text,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import phone from "@/assets/icons/phone.png";
import key from "@/assets/icons/key.png";
import hide_key from "@/assets/icons/hide_key.png";
import unhide_key from "@/assets/icons/hide_key.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function AuthPage() {
  const navigation = useNavigation();

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isInvisible, setIsInvisible] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState();
  const [password, setPassword] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStat, setLoadingStat] = useState(false);

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

  const fetchLogin = () => {
    if (!phoneNumber) {
      setErrorMessage("phone number is empty");
      return;
    }
    if (!password) {
      setErrorMessage("password is empty");
      return;
    }
    const checkNumber = Number(phoneNumber);
    if (!checkNumber) {
      setErrorMessage("phone number must not include alphabets");
      return;
    }
    setLoadingStat(true);
    setErrorMessage("none");

    //fetch post login
    console.log("phoneNumber = " + phoneNumber);
    console.log("password = " + password);
    requestLogin();
  };

  const requestLogin = async ({ phone_number, pwd } = {}) => {
    try {
      const res = await ApiClient.post("auth/sign-in/admin", {
        phone_number: phoneNumber,
        password: password,
      });
      const { userCheck, token } = res.data;

      await AsyncStorage.setItem("adminToken", token);
      await AsyncStorage.setItem(
        "adminData",
        JSON.stringify({ userCheck: userCheck })
      );

      navigation.navigate("AdminDashboard");

      setLoadingStat(false);
      setErrorMessage("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendError = error.response?.data;
        console.log("Backend Error Message:", backendError?.error);
        setLoadingStat(false);
        setErrorMessage(backendError?.error);
        console.log("Status Code:", error.response?.status);
      } else if (error instanceof Error) {
        console.log("Generic Error:", error.message);
      } else {
        console.log("An unexpected error occurred", error);
      }
    }
  };

  return (
    <AppGradient>
      <SafeAreaView className="flex-1">
        <ImageBackground
          source={logo}
          className="h-[600px] w-[600px] mt-24 absolute opacity-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          resizeMode="cover"
        />
        <View className="mx-7 flex flex-col gap-8">
          <View className="flex flex-row justify-center items-end gap-2 mt-8 py-4 border-b-[2px] border-[#FFFFFF]/20">
            <Text className="text-white text-[48px] font-jura-bold tracking-[5px]">
              Warriors
            </Text>
          </View>
          <View>
            <Text className="text-white text-[43px] font-jura-bold">Login</Text>
            <Text className="text-white text-[22px] font-jura-bold">
              Please enter your phone number and password
            </Text>
          </View>
        </View>
        <View
          className={`${isKeyboardVisible ? "py-20" : "justify-center"} flex-1 mb-20 items-center mx-14 gap-2`}
        >
          <View className="bg-[#2A2A2C] rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
            <Image source={phone} resizeMode="contain" className="h-7 w-7" />
            <TextInput
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              placeholder="Phone number"
              placeholderTextColor={"#FFFFFF6E"}
              className="text-white text-[18px] font-jura w-[90%]"
            />
          </View>
          <View className="bg-[#2A2A2C] rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
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
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-[#56C556] h-[50px] w-2/4 rounded-full justify-center items-center flex flex-row gap-2"
            onPress={() => fetchLogin()}
          >
            <Text className="text-white text-[28px] font-jura-bold leading-none">
              Login
            </Text>
            {loadingStat ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Image source={arrow} className="w-8 h-7" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </AppGradient>
  );
}
