import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import warriors from "@/assets/images/logo.png";
import { fetchUrl } from "@/utils/ApiClient";

const App = () => {
  const router = useRouter();
  useEffect(() => {
    fetchUrl();
    const prepare = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        router.replace("/MemberDashboard");
        console.log("signed");
      } else {
        router.replace("/AuthPage");
        console.log("sign-in again");
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
