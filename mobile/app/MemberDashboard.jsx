import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { Text, TouchableOpacity, Image, View } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import ApiClient from "../components/AuthPage/ApiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import AppGradient from "../components/AppGradient";
import { SafeAreaView } from "react-native-safe-area-context";
import motive_image from "../assets/images/motive-images/My turn.jpeg";
import profile from "../assets/icons/profile.png";
// import SendTag from "../utils/NFC_HCE";

export default function MemberDashboard() {
  const navigation = useNavigation();
  const router = useRouter();
  const [userData, setUserData] = useState({});

  const sendNFCData = () => {
    console.log("sending");
//    SendTag();
    console.log("sent");
  };

  ///get trigered when online
  useEffect(() => {
    getOfflineData();
    const verifyInStore = async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        try {
          const token = await AsyncStorage.getItem("userToken");
          await ApiClient.get(`/auth/self`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Token verified online!");
          getOnlineData();
        } catch (error) {
          if (error.response?.status === 401) {
            await AsyncStorage.clear();
            console.log("clear token");
            router.replace({ pathname: "/AuthPage", params: { path: 2 } });
            return;
          }
          console.log(error);
          console.log("Working in Offline Mo");
        }
      } else {
        console.log("Working in Offline Mode");
      }
    };

    verifyInStore();
  }, []);

  const getOfflineData = async () => {
    const offlineData = await AsyncStorage.getItem("userData");
    const offData = JSON.parse(offlineData);
    console.log(offData);
    console.log("this is offile Data");
  };

  const getOnlineData = async () => {
    console.log("fetch online Data");
  };

  return (
    <AppGradient>
      <SafeAreaView className="flex-1 py-5">
        <View className="flex flex-row px-5 justify-between items-end py-1 border-b-[1px] border-[#7E7676] h-[65px]">
          <View className="flex">
            <Text className="text-white text-[14px] font-jura leading-none tracking-[2px]">
              Stay, Hard...
            </Text>
            <Text className="text-white text-[28px] font-jura-bold leading-none tracking-[2px]">
              Hi, Dawit
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Image
              source={profile}
              resizeMode="contain"
              className="h-[60px] w-[60px] rounded-full p-2 border-[1px] border-[#00FF00]"
            />
          </TouchableOpacity>
        </View>
        <View className="bg-black h-[50px] w-full mt-3 mb-1 justify-center items-center">
          <Text className="text-white">Attendace</Text>
        </View>
        <View className="mx-2">
          <Image
            source={motive_image}
            resizeMode="cover"
            className="h-[240px] w-full rounded-2xl"
          />
        </View>
        <View className="w-full flex flex-row justify-evenly my-4 gap-5">
          <TouchableOpacity
            activeOpacity={0.5}
            className="border-2 border-[#00FF00] h-[50px] w-[130px] flex justify-center items-center rounded-3xl"
            onPress={() => sendNFCData()}
          >
            <Text className="text-white text-[23px] font-jura-bold leading-none">
              Check In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.5}
            className="border-2 border-[#00FF00] h-[50px] w-[133px] flex justify-center items-center rounded-3xl"
          >
            <Text className="text-white text-[21px] font-jura-bold leading-none">
              Check Out
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          className="flex flex-row justify-between items-center mx-3 bg-[#AC8C2D]/70 rounded-3xl p-2 px-5 mb-2"
        >
          <View>
            <View className="flex flex-row items-center gap-2">
              <Text className="text-white text-[16px] font-jura-bold leading-none">
                Membership
              </Text>
              <View className="h-[4px] w-[4px] bg-white rounded-full" />
              <Text className="text-white text-[16px] font-jura-bold leading-none">
                Monthly
              </Text>
            </View>
            <View className="flex flex-row items-end gap-2">
              <Text className="text-white text-[35px] font-jura-bold leading-none">
                21
              </Text>
              <Text className="text-white text-[20px] font-jura-bold leading-none mb-1">
                days left
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            className="border-2 border-[#00FF00] bg-[#00FF00]/20 rounded-xl h-[43px] w-[85px] justify-center items-center"
          >
            <Text className="text-black text-[30px] font-jura-bold leading-none mb-1">
              Pay
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-black h-[145px] mx-3 rounded-3xl justify-center items-center mb-2"
        >
          <Text className="text-white text-[30px] font-jura-bold leading-none">
            Workout Plans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-black h-[145px] mx-3 rounded-3xl justify-center items-center mb-y"
        >
          <Text className="text-white text-[30px] font-jura-bold leading-none">
            Programs & Plans
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </AppGradient>
  );
}
