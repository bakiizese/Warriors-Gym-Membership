import warriors from "@/assets/images/logo.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ImageBackground, View } from "react-native";
import ApiClient from "../utils/ApiClient";

const App = () => {
  const router = useRouter();
  useEffect(() => {
    const prepare = async () => {
      const token = await AsyncStorage.getItem("adminToken");
      if (token) {
        const network = NetInfo.addEventListener((state) => {
          if (state.isConnected && state.isInternetReachable) {
            verifyOnline();
          } else {
            router.replace("/AdminDashboard");
            console.log("signed-offline");
          }
        });
        network();
      } else {
        console.log("signin again");
        await AsyncStorage.clear();
        router.replace({ pathname: "/AuthPage", params: { path: 2 } });
      }
    };
    prepare();
  }, []);

  const verifyOnline = async () => {
    const token = await AsyncStorage.getItem("adminToken");

    try {
      const res = await ApiClient.get("/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.user) {
        router.replace("/AdminDashboard");
        console.log("signed-online");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          console.log("backend not responding");
          router.replace("/AdminDashboard");
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
