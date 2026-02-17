import arrow from "@/assets/icons/arrow.png";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Age from "./Attributes/Age";
import ApiClient, { fetchUrl } from "../../utils/ApiClient";
import Gender from "./Attributes/Gender";
import Height from "./Attributes/Height";
import LangingPage from "./LangingPage";
import SignIn from "./Signs/SignIn";
import SignUp from "./Signs/SignUp";
import Weight from "./Attributes/Weight";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import SelectLanguage from "./SelectLanguage";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

const Auth = ({ path } = {}) => {
  const router = useRouter();

  const [pageNumber, setPageNumber] = useState(Number(path) || 0);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState();
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState("English");
  const [gender, setGender] = useState("Male");
  const [selectedAge, setSelectedAge] = useState(25);
  const [selectedHeight, setSelectedHeight] = useState(160);
  const [selectedWeight, setSelectedWeight] = useState(160);

  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStat, setLoadingStat] = useState(false);
  const { t } = useTranslation();

  const authNavigation = {
    title: [
      "Get Fit, Warrior!",
      "Login",
      "Register",
      "What is your gender",
      "What is your age",
      "What is your height",
      "What is your weight",
    ],
    desc: [
      "Get started now",
      "Please enter your phone number and password",
      "Please enter your full name, phone number and password",
      "Please select your gender",
      "Please select your age",
      "Please select your height",
      "Please select your weight",
    ],
    page: [
      <LangingPage />,
      <SignIn
        setPhoneNumber={setPhoneNumber}
        phoneNumber={phoneNumber}
        setPassword={setPassword}
        password={password}
        errorMessage={errorMessage}
      />,
      <SignUp
        setFullName={setFullName}
        fullName={fullName}
        setPhoneNumber={setPhoneNumber}
        phoneNumber={phoneNumber}
        setPassword={setPassword}
        password={password}
        errorMessage={errorMessage}
      />,
      <Gender gender={gender} setGender={setGender} />,
      <Age setSelectedAge={setSelectedAge} />,
      <Height setSelectedHeight={setSelectedHeight} />,
      <Weight setSelectedWeight={setSelectedWeight} />,
    ],
    buttonText: [
      "Let's Go",
      "Login",
      "Continue",
      "Continue",
      "Continue",
      "Continue",
      "Finish",
    ],
  };
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);
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

    requestLogin();
  };

  const requestLogin = async () => {
    try {
      const res = await ApiClient.post("auth/sign-in/member", {
        phone_number: phoneNumber,
        password: password,
        language: language,
      });
      const { token } = res.data;

      await AsyncStorage.setItem("userToken", token);
      router.replace("MemberDashboard");
      setLoadingStat(false);
      setErrorMessage("");
    } catch (error) {
      if (!error.response) {
        fetchUrl();
      }
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

  const fetchRegister = async () => {
    setLoadingStat(true);
    setErrorMessage("none");
    try {
      const res = await ApiClient.post("/auth/sign-up/member", {
        full_name: fullName,
        phone_number: phoneNumber,
        gender: gender,
        height: selectedHeight,
        weight: selectedWeight,
        age: selectedAge,
        password: password,
        language: language,
      });
      console.log("fetch regitration", res.data.user);
      requestLogin();
    } catch (err) {
      if (!err.response) {
        fetchUrl();
      }
      if (axios.isAxiosError(err)) {
        const backendError = err.response?.data;
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      setErrorMessage("");
      setLoadingStat(false);
      setPageNumber(2);
    }
  };

  const checkRegister = async () => {
    if (!fullName) {
      setErrorMessage("full name is empty");
      return;
    }
    if (!phoneNumber) {
      setErrorMessage("phone number is empty");
      return;
    }
    const checkNumber = Number(phoneNumber);
    if (!checkNumber) {
      setErrorMessage("phone number must not include alphabets");
      return;
    }
    if (!password) {
      setErrorMessage("password is empty");
      return;
    }
    const checkExistance = await checkPhone();
    if (checkExistance) {
      setErrorMessage(checkExistance);
      return;
    }
    setErrorMessage("");
    setPageNumber(pageNumber + 1);
  };

  const checkPhone = async () => {
    try {
      const res = await ApiClient.get(`/auth/sign-up/${phoneNumber}`);
      console.log(res.data);
      return "user exists with this phone number";
    } catch (err) {
      if (!err.response) {
        fetchUrl();
      }
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setErrorMessage("backend error");
          return "backend not responding";
        }
        const backendError = err.response?.data;
        console.log(backendError);
      } else if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      return 0;
    }
  };
  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
      accessible={false}
      className=""
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View className="flex flex-col h-full">
          <View className="mx-7 flex flex-col gap-8">
            <View className="">
              <View className="flex flex-row justify-center mt-8 py-4 items-end gap-2  border-b-[2px] border-[#FFFFFF]/20">
                <Text className="text-white text-[18px] font-jura-bold">
                  Warriors
                </Text>
                <View className="flex flex-row gap-2 my-[5px] items-end">
                  <View
                    className={`${pageNumber === 0 || pageNumber === 1 ? "bg-[#FFFFFF] h-2 w-[44px]" : "bg-[#FFFFFF]/20 h-[6px] w-[39px]"} rounded-full`}
                  />
                  <View
                    className={`${pageNumber === 2 || pageNumber === 3 ? "bg-[#FFFFFF] h-2 w-[44px]" : "bg-[#FFFFFF]/20 h-[6px] w-[39px]"} rounded-full`}
                  />
                  <View
                    className={`${pageNumber === 4 ? "bg-[#FFFFFF] h-2 w-[44px]" : "bg-[#FFFFFF]/20 h-[6px] w-[39px]"} rounded-full`}
                  />
                  <View
                    className={`${pageNumber === 5 ? "bg-[#FFFFFF] h-2 w-[44px]" : "bg-[#FFFFFF]/20 h-[6px] w-[39px]"} rounded-full`}
                  />
                  <View
                    className={`${pageNumber === 6 ? "bg-[#FFFFFF] h-2 w-[44px]" : "bg-[#FFFFFF]/20 h-[6px] w-[39px]"} rounded-full`}
                  />
                  <View
                    className={`${pageNumber === 7 ? "bg-[#FFFFFF] h-2 w-[44px]" : "bg-[#FFFFFF]/20 h-[6px] w-[39px]"} rounded-full`}
                  />
                </View>
              </View>
              {authNavigation.title[pageNumber] === "Login" && (
                <View className="flex flex-row justify-between py-2">
                  <Text className="text-white text-[26px] font-jura leading-none">
                    {t("auth.Select Language")}
                  </Text>
                  <View className="bg-[#777676] p-1 px-2 rounded-md border-[1px] border-[#424141] relative h-9 w-[120px] items-center">
                    <SelectLanguage
                      primary={language}
                      setPrimary={setLanguage}
                    />
                  </View>
                </View>
              )}
            </View>
            <View>
              <Text className="text-white text-[30px] font-jura-bold">
                {t(`auth.${authNavigation.title[pageNumber]}`)}
              </Text>
              <Text className="text-white text-[22px] font-jura-bold">
                {t(`auth.${authNavigation.desc[pageNumber]}`)}
              </Text>
            </View>
          </View>
          <View className="flex-1">
            <View className="flex-1 justify-center">
              {authNavigation.page[pageNumber]}
            </View>
            <View className=" justify-end py-6 gap-2">
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-[#56C556]/70 h-[50px] mx-7 rounded-full justify-center items-center flex flex-row gap-2"
                onPress={() => {
                  if (authNavigation.buttonText[pageNumber] === "Login") {
                    fetchLogin();
                  } else if (authNavigation.title[pageNumber] === "Register") {
                    checkRegister();
                  } else if (
                    authNavigation.title[pageNumber] === "What is your weight"
                  ) {
                    fetchRegister();
                  } else if (pageNumber < 6) {
                    setPageNumber(pageNumber + 1);
                  }
                }}
              >
                <Text className="text-white text-[28px] font-jura-bold">
                  {t(`auth.${authNavigation.buttonText[pageNumber]}`)}
                </Text>
                {loadingStat ? (
                  <ActivityIndicator size="large" color="#FFFFFF" />
                ) : (
                  <Image source={arrow} className="w-8 h-7" />
                )}
              </TouchableOpacity>
              {authNavigation.buttonText[pageNumber] !== "Let's Go" && (
                <TouchableOpacity
                  disabled={loadingStat}
                  activeOpacity={0.7}
                  className="h-[50px] mx-7 rounded-full justify-center items-center flex flex-row gap-2"
                  onPress={() => {
                    if (authNavigation.buttonText[pageNumber] === "Login") {
                      setPageNumber(pageNumber + 1);
                    } else if (pageNumber > 0) {
                      setPageNumber(pageNumber - 1);
                    }
                  }}
                >
                  {pageNumber !== 1 && (
                    <Image source={arrow} className="w-8 h-7 scale-x-[-1]" />
                  )}
                  <Text className="text-white text-[28px] font-jura-bold">
                    {pageNumber === 1 ? t("auth.Register") : t("auth.Back")}
                  </Text>
                  {pageNumber === 1 && (
                    <Image source={arrow} className="w-8 h-7" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Auth;
