import warriors from "@/assets/images/logo.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ImageBackground, View } from "react-native";

const App = () => {
  const router = useRouter();
  useEffect(() => {
    const prepare = async () => {
      const token = await AsyncStorage.getItem("adminToken");
      if (token) {
        console.log("signedin");
        router.replace("/AdminDashboard");
      } else {
        console.log("signin again");
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
