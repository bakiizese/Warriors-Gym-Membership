import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { ImageBackground } from "../components/AppImage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import warriors from "@/assets/images/logo.png";

const App = () => {
  const router = useRouter();
  useEffect(() => {
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
