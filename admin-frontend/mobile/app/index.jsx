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
        router.replace("/AdminDashboard");
        console.log("signed-offline");
      } else {
        console.log("signin again");
        await AsyncStorage.clear();
        router.replace({ pathname: "/AuthPage", params: { path: 2 } });
      }
    };
    prepare();
  }, []);

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
