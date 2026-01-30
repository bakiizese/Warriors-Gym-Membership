import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import dumbbell from "../assets/icons/dumbbell.png";
import remove from "../assets/icons/remove.png";

const Add = ({
  setRemove,
  save,
  setLoading,
  loading,
  setErrorMessage,
  errorMessage,
  prevData = null,
}) => {
  const router = useRouter();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [membershipData, setMembershipData] = useState({
    membership_name: prevData?.membership_name || "",
    plan_type: prevData?.plan_type || "Daily",
    ticket_amount: prevData?.ticket_amount || 0,
    fee: prevData?.fee || 0,
    description: prevData?.description || "\u25CF ",
    status: prevData?.status || "Active",
    duration_days: prevData?.duration_days || 0,
  });
  const membershipKeys = [
    "fee",
    "membership_name",
    "plan_type",
    "ticket_amount",
    "description",
    "status",
    "duration_days",
  ];
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const checkData = () => {
    for (const key of membershipKeys) {
      if (!membershipData[key]) {
        if (key === "ticket_amount") {
          if (membershipData["plan_type"] === "Ticket") {
            console.log(key, "is empty");
            setErrorMessage(key, "is empty");
            return;
          }
        } else {
          console.log(key, "is empty");
          setErrorMessage(key, "is empty");
          return;
        }
      }
    }
    setErrorMessage("");
    setLoading(true);
    save(membershipData, prevData ? prevData.id : "");
  };

  const calDurationDays = (month) => {
    const days = month * 30;
    setMembershipData((prev) => ({
      ...prev,
      duration_days: days,
    }));
  };

  return (
    <View
      className={`${isKeyboardVisible ? "pb-150px] top-[280px]" : "top-1/2"} z-40  flex-1 justify-center items-center absolute -translate-x-1/2  -translate-y-1/2 left-1/2`}
    >
      {loading && (
        <View className="flex-1 bg-black/20 absolute inset-0 z-20">
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            className="flex-1"
            style={{ transform: [{ scale: 2 }] }}
          />
        </View>
      )}
      <View className="h-[100%] w-[360px] rounded-3xl overflow-hidden">
        <LinearGradient
          colors={["#6292EB", "#EBA262"]}
          className="absolute inset-0"
          pointerEvents="none"
        />
        <View className="flex-1 justify-start items-center ">
          <View className="bg-black/20 h-14  w-full justify-center items-center relative">
            <TouchableOpacity
              onPress={() => setRemove(false)}
              className="absolute h-6 w-10 top-2 right-2"
            >
              <Image
                source={remove}
                resizeMode="contain"
                className="h-6 w-10"
              />
            </TouchableOpacity>

            <Text className="text-white text-[30px] font-jura">
              Add Membership
            </Text>
          </View>
          <ScrollView className={`${isKeyboardVisible ? "h-[300px]" : ""}`}>
            <View className="flex-1 px-4 my-2 gap-1 w-full justify-start items-center">
              <View className="w-[290px] mx-4 rounded-2xl overflow-hidden self-center items-center">
                <LinearGradient
                  colors={["#2148E499", "#479AF999"]}
                  className="absolute inset-0 opacity-70"
                  pointerEvents="none"
                  locations={[0, 1]}
                />
                <View className="flex items-center">
                  <View className="flex justify-center items-center gap-2 m-3">
                    <Image source={dumbbell} className="h-8 w-12" />
                    <View className="flex flex-row items-center">
                      <Text className="text-white leading-none text-[50px] font-jura-bold">
                        $
                      </Text>
                      <TextInput
                        placeholder="Fee"
                        value={String(membershipData.fee)}
                        onChangeText={(text) =>
                          setMembershipData((prev) => ({
                            ...prev,
                            fee: Number(text),
                          }))
                        }
                        placeholderTextColor={"#FFFFFF6E"}
                        className="text-white text-[50px] text-center font-jura-bold border-[1px] border-[#FFFFFF6E]"
                        inputMode="decimal"
                      />
                    </View>
                  </View>
                  <View className="h-1 w-[95%] bg-[#55318D]/80" />
                </View>
                <View className="flex items-center justify-center p-4 w-[80%]">
                  <View className="flex flex-row">
                    <TextInput
                      value={String(membershipData.duration_days / 30)}
                      onChangeText={(text) => calDurationDays(text)}
                      className="text-white my-2 leading-none text-[25px] h-[45px] font-jura-bold text-center px-4 border-[1px] border-[#FFFFFF6E]"
                      placeholder="0"
                      placeholderTextColor={"#FFFFFF6E"}
                      inputMode="numeric"
                    />
                    <TextInput
                      value={membershipData.membership_name}
                      onChangeText={(text) =>
                        setMembershipData((prev) => ({
                          ...prev,
                          membership_name: text,
                        }))
                      }
                      className="text-white my-2 leading-none text-[25px] h-[45px] font-jura-bold text-center px-4 border-[1px] border-[#FFFFFF6E]"
                      placeholder="Membership name"
                      placeholderTextColor={"#FFFFFF6E"}
                      inputMode="text"
                    />
                  </View>

                  <View className="my-2 w-[90%] gap-4">
                    <TextInput
                      className="text-white leading-none text-[16px] text-start border-[1px] border-[#FFFFFF6E] font-jura-bold"
                      placeholder="Description"
                      value={membershipData.description}
                      onChangeText={(text) =>
                        setMembershipData((prev) => ({
                          ...prev,
                          description: text.endsWith("\n")
                            ? text + "\u25CF "
                            : text,
                        }))
                      }
                      inputMode="text"
                      multiline
                      autoCapitalize="words"
                    />
                  </View>
                </View>
                <View className="flex-1 justify-end py-4">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="self-center justify-center items-center bg-white h-[40px] w-[150px] rounded-full px-4"
                    disabled={true}
                  >
                    <Text className="text-[#3B5793] leading-none h-[40px] text-[35px] font-jura-bold">
                      Pay
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-[90%] flex flex-row justify-between items-center">
                <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl  w-[100px] items-center">
                  <Text className="text-white text-[18px] font-jura-bold">
                    Status
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setMembershipData((prev) => ({
                      ...prev,
                      status: prev.status === "Active" ? "Inactive" : "Active",
                    }))
                  }
                  className={`flex flex-row justify-center items-center ${membershipData.status === "Active" ? "bg-[#4CA24F]" : "bg-[#777676]"} px-5 rounded-2xl`}
                >
                  <Text className="text-white text-[23px] font-jura-bold ">
                    {membershipData.status}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-[90%] flex flex-row justify-between items-center">
                <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl  w-[120px] items-center">
                  <Text className="text-white text-[18px] font-jura-bold">
                    Plan type
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    setMembershipData((prev) => ({
                      ...prev,
                      plan_type:
                        prev.plan_type === "Ticket" ? "Daily" : "Ticket",
                    }))
                  }
                  className="flex flex-row justify-center items-center bg-[#777676] px-5 rounded-2xl"
                >
                  <Text className="text-white text-[23px] font-jura-bold ">
                    {membershipData.plan_type}
                  </Text>
                </TouchableOpacity>
              </View>
              {membershipData.plan_type === "Ticket" && (
                <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-[90%] flex flex-row justify-between items-center">
                  <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl  w-[150px] items-center">
                    <Text className="text-white text-[18px] font-jura-bold">
                      Ticket amount
                    </Text>
                  </View>
                  <TextInput
                    value={membershipData.ticket_amount}
                    onChangeText={(text) =>
                      setMembershipData((prev) => ({
                        ...prev,
                        ticket_amount: Number(text),
                      }))
                    }
                    className="text-white text-[23px] font-jura-bold "
                    placeholder="0"
                    placeholderTextColor={"#FFFFFF6E"}
                    inputMode="decimal"
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
        {errorMessage && (
          <Text className="text-red-700 text-[18px] font-jura leading-none text-center mb-1">
            * {errorMessage}
          </Text>
        )}
        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-[#56C556]/40 mx-[90px] h-[45px] rounded-3xl justify-center items-center p-2 mb-2"
          onPress={() => checkData()}
        >
          <Text className="text-white text-[32px] font-jura-bold leading-none">
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Add;
