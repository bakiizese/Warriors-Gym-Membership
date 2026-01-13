import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    <View>
      <Text>App</Text>
    </View>
  );
};

export default App;
