import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import warriors from "@/assets/images/logo.png";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import ApiClient from "../utils/ApiClient";

const App = () => {
  const router = useRouter();
  useEffect(() => {
    const prepare = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        const network = NetInfo.addEventListener((state) => {
          if (state.isConnected && state.isInternetReachable) {
            verifyOnline();
          } else {
            router.replace("/MemberDashboard");
            console.log("signed-offline");
          }
        });
        network();
      } else {
        await AsyncStorage.clear();
        router.replace("/AuthPage");
        console.log("sign-in again");
      }
    };
    prepare();
  }, []);

  const verifyOnline = async () => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      const res = await ApiClient.get("/member/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.member) {
        router.replace("/MemberDashboard");
        console.log("signed-online");
      } else {
        await AsyncStorage.clear();
        router.replace("/AuthPage");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log(err);
        if (!err.response) {
          console.log("backend not responding");
          router.replace("/MemberDashboard");
          console.log("signed-offline");
          return;
        } else if (
          err.response?.status === 400 ||
          err.response?.status === 401
        ) {
          console.log("token error");
          await AsyncStorage.clear();
          router.replace("/AuthPage");
          return;
        }
        const backendError = err.response?.data;
        console.log(backendError?.error);
        console.log(err.response?.status);
      } else if (err instanceof Error) {
        console.log("Generic Error:", err.message);
      } else {
        console.log("An unexpected error occurred", err);
      }
      console.log("unknown error, signin-agin");
      await AsyncStorage.clear();
      router.replace("/AuthPage");
    }
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={warriors}
        resizeMode="cover"
        className="flex-1 opacity-60"
      />
    </View>
  );
};

export default App;
