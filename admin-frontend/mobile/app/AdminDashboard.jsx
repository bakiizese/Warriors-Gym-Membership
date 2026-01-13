import { View, Text, Image, TouchableOpacity } from "react-native";
import AppGradient from "../components/AppGradient";
import { SafeAreaView } from "react-native-safe-area-context";
import profile from "../assets/icons/profile.png";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

const AdminDashboard = () => {
  const navigation = useNavigation();
  const router = useRouter();
  return (
    <AppGradient>
      <SafeAreaView className="flex-1 p-5">
        <View className="flex flex-row justify-between items-center border-b-[1px] border-[#7E7676] h-[75px]">
          <View className="flex">
            <Text className="text-white text-[22px] font-jura leading-none tracking-[2px]">
              Adonay
            </Text>
            <Text className="text-white text-[22px] font-jura leading-none tracking-[2px]">
              +251-982732232
            </Text>
            <Text className="text-white text-[22px] font-jura leading-none  tracking-[2px]">
              Admin
            </Text>
          </View>
          <Image
            source={profile}
            resizeMode="contain"
            className="h-[68px] w-[68px] rounded-full p-2 border-[1px] border-[#00FF00]"
          />
        </View>
        <View className="flex flex-row justify-between mx-1 my-[9px]">
          <Text className="text-white text-[22px] font-jura leading-none">
            Select Language
          </Text>
          <View className="bg-[#777676] p-1 rounded-md">
            <Text className="text-white text-[22px] font-jura leading-none">
              English
            </Text>
          </View>
        </View>
        <View className="flex flex-row justify-between mx-2 border-b-[4px] pb-3 border-[#7E7876]">
          <View className="h-[120px] w-[110px]">
            <View className="w-full h-[90px] bg-[#121214]/50 rounded-2xl justify-center items-center">
              <Text className="text-white text-[40px] font-jura text-center leading-none">
                480
              </Text>
            </View>
            <Text className="text-white text-[15px] mx-1 font-jura-bold leading-none text-center">
              Total Active Members
            </Text>
          </View>
          <View className="h-[120px] w-[110px]">
            <View className="w-full h-[90px] bg-[#AC8C2D]/70 rounded-2xl justify-center items-center">
              <Text className="text-white text-[40px] font-jura text-center leading-none">
                83
              </Text>
            </View>
            <Text className="text-white h-10 pt-[9px] text-[15px] mx-1 font-jura-bold leading-none text-center">
              Today Visits
            </Text>
          </View>
          <View className="h-[120px] w-[110px]">
            <View className="w-full h-[90px] bg-[#DD2020]/60 rounded-2xl justify-center items-center">
              <Text className="text-white text-[40px] font-jura text-center leading-none">
                34
              </Text>
            </View>
            <Text className="text-white text-[15px] mx-1 font-jura-bold leading-none text-center">
              Payment Due Today
            </Text>
          </View>
        </View>
        <View className="flex-1 gap-4 my-6 mb-8">
          <View className="w-auto h-1/3 flex flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
              onPress={() => router.push("/AdminManagments/ManageMembers")}
            >
              <Text className="text-white text-[30px] font-jura text-center leading-none">
                Manage Members
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
              onPress={() => router.push("/AdminManagments/ManagePayments")}
            >
              <Text className="text-white text-[30px] font-jura text-center leading-none">
                Manage Payments
              </Text>
            </TouchableOpacity>
          </View>
          <View className="w-auto h-1/3 flex flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
              onPress={() => router.push("/AdminManagments/AttendanceLogs")}
            >
              <Text className="text-white text-[30px] font-jura text-center leading-none">
                Attendance Logs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
              onPress={() =>
                router.push("/AdminManagments/ManageMembershipPlans")
              }
            >
              <Text className="text-white text-[30px] font-jura text-center leading-none">
                Manage Membership Plans
              </Text>
            </TouchableOpacity>
          </View>
          <View className="w-auto h-1/3 flex flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
              onPress={() => router.push("/AdminManagments/ManageWorkoutPlans")}
            >
              <Text className="text-white text-[30px] font-jura text-center leading-none">
                Manage Workout Plans
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              className="bg-[#383E4D] flex-1 rounded-3xl justify-center items-center"
              onPress={() => router.push("/AdminManagments/ProgramAndPlans")}
            >
              <Text className="text-white text-[30px] font-jura text-center leading-none">
                Program & Plans
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </AppGradient>
  );
};

export default AdminDashboard;
