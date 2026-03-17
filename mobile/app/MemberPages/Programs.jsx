import { View, Text, Pressable, ScrollView } from "react-native";
import AppGradient from "../../components/AppGradient";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ApiClient from "../../utils/ApiClient";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Linking } from "react-native";
import ParsedText from "react-native-parsed-text";
import { SafeAreaView } from "react-native-safe-area-context";

const Programs = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [programs, setPrograms] = useState([]);
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const token = await AsyncStorage.getItem("userToken");

    try {
      const res = await ApiClient.get("/member/programs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.setItem("programs", JSON.stringify(res.data.programs));
      setPrograms(res.data.programs);
    } catch (err) {
      offlineData();
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400 || err.response?.status === 401) {
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
    }
  };

  const offlineData = async () => {
    const offlinePrograms = await AsyncStorage.getItem("programs");
    if (offlinePrograms) {
      const parsedPrograms = JSON.parse(offlinePrograms);
      setPrograms(parsedPrograms);
    }
  };
  return (
    <AppGradient>
      <SafeAreaView className="flex-1" edges={["bottom"]}>
        <View className="flex-1">
          <View className="flex flex-row bg-black/20 w-full h-[110px] items-end p-3 pb-0.5">
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={33} color="black" />
            </Pressable>
            <Text className="text-white h-10 pl-2 leading-none text-[30px] font-jura-bold">
              {t("workout.Programs")}
            </Text>
          </View>
          <ScrollView className="flex-1 mb-6 p-2">
            {programs &&
              programs.map((item, index) => (
                <View
                  key={index}
                  className="bg-black/10 rounded-xl p-3 my-[4px]"
                >
                  <ParsedText
                    className="text-white text-[20px] font-jura-bold leading-none"
                    parse={[
                      {
                        type: "url",
                        style: {
                          color: "blue",
                          textDecorationLine: "underline",
                        },
                        onPress: (url) => Linking.openURL(url),
                      },
                    ]}
                  >
                    {item.content}
                  </ParsedText>
                </View>
              ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </AppGradient>
  );
};

export default Programs;
