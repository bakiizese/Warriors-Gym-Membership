import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import AppGradient from "../../components/AppGradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import ApiClient from "../../utils/ApiClient";
import ParsedText from "react-native-parsed-text";
import { Linking } from "react-native";
import { useTranslation } from "react-i18next";
import remove from "../../assets/icons/delete.png";
import Confirmation from "../../components/Confirmation";
import { SafeAreaView } from "react-native-safe-area-context";

const ProgramAndPlans = () => {
  const router = useRouter();
  const [program, setProgram] = useState("");
  const [programs, setPrograms] = useState("");
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(false);

  const uploadProgram = async () => {
    const programData = { content: program };
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.post(
        "/admin/programs",
        { ...programData },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log(res.data);
      fetchPrograms();
      setProgram("");
    } catch (err) {
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

  useEffect(() => {
    setProgram("");
    offlineData();
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const token = await AsyncStorage.getItem("adminToken");

    try {
      const res = await ApiClient.get("/admin/programs", {
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

  const removePrograms = async () => {
    const token = await AsyncStorage.getItem("adminToken");
    try {
      const res = await ApiClient.delete(`/admin/programs/${confirm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      fetchPrograms();
      setProgram("");
      setConfirm(false);
    } catch (err) {
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
            <Text className="text-white h-10  pl-2 leading-none text-[30px] font-jura-bold">
              {t("programs.Program & Plans")}
            </Text>
          </View>

          <View className="flex-1 gap-2 p-3">
            <View className="flex items-end gap-2">
              <TextInput
                value={program}
                onChangeText={(text) => setProgram(text)}
                style={{ textAlignVertical: "top" }}
                className="text-white leading-none px-3 w-full text-[16px] h-[130px] text-start border-[1px] border-[#FFFFFF6E] font-jura-bold"
                placeholder="Write Programs Here...."
                inputMode="text"
                multiline
                autoCapitalize="words"
              />
              <TouchableOpacity
                activeOpacity={0.8}
                className={`${program === "" ? "bg-[#636863]" : "bg-[#56C556]"} rounded-[25px] h-[45px] w-[140px] px-2 items-center justify-center`}
                onPress={() => uploadProgram()}
                disabled={program === ""}
              >
                <Text className="text-white leading-none text-[20px] font-jura text-center">
                  {t("programs.Add Program")}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 mb-6 p-2">
              {programs &&
                programs.map((item, index) => (
                  <View
                    key={index}
                    className="bg-black/10 rounded-xl p-3 my-[4px] flex flex-row justify-between"
                  >
                    <ParsedText
                      className="text-white text-[20px] w-[90%] font-jura-bold leading-none"
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
                    <TouchableOpacity
                      activeOpacity={0.8}
                      className="mx-3"
                      onPress={() => setConfirm(item.id)}
                    >
                      <Image source={remove} className="h-8 w-7" />
                    </TouchableOpacity>
                  </View>
                ))}
            </ScrollView>
          </View>
          {confirm && (
            <Confirmation
              setRemove={setConfirm}
              title="Are you sure?"
              content="You want to delete this program"
              onConfirmed={() => removePrograms(confirm)}
            />
          )}
        </View>
      </SafeAreaView>
    </AppGradient>
  );
};

export default ProgramAndPlans;
