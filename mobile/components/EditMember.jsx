import edit from "@/assets/icons/edit.png";
import {
  default as hide_key,
  default as unhide_key,
} from "@/assets/icons/hide_key.png";
import key from "@/assets/icons/key.png";
import phone from "@/assets/icons/phone.png";
import remove from "@/assets/icons/remove.png";
import * as ImagePicker from "expo-image-picker";
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
import profile_r from "../assets/icons/profile-r.png";
import profile from "../assets/icons/profile.png";

const EditMember = ({
  editData,
  setRemove,
  save,
  errorMessage,
  setErrorMessage,
  loading,
}) => {
  const [isInvisiblePassword, setIsInvisiblePassword] = useState(true);
  const [isInvisibleOldPassword, setIsInvisibleOldPassword] = useState(true);
  const [isInvisibleConfirm, setIsInvisibleConfirm] = useState(true);
  const [localImage, setLocalImage] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [personalData, setPersonalData] = useState({
    full_name: editData.full_name || "",
    phone_number: editData.phone_number || "",
    weight: editData.weight || "",
    height: editData.height || "",
    age: editData.age || "",
    oldPassword: "",
    password: "",
    confirmPassword: "",
    image: editData.image_id || "",
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPersonalData((prev) => ({ ...prev, image: result.assets[0].uri }));
      setLocalImage(result.assets[0].uri);
    }
  };

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
    for (const key in personalData) {
      if (
        personalData[key] === "" &&
        !["image", "password", "confirmPassword", "oldPassword"].includes(key)
      ) {
        console.log(key, "is missing");
        setErrorMessage(`${key} is missing`);
        return;
      } else if (key === "phone_number" && !Number(personalData[key])) {
        setErrorMessage(`phone number must be an integer`);

        console.log("phone_number", "must be integer");
        return;
      } else if (personalData["oldPassword"]) {
        if (personalData["password"] === "") {
          console.log("password is missing");
          setErrorMessage(`password is missing`);
          return;
        }
        if (personalData["confirmPassword"] === "") {
          console.log("confirmPassword is missing");
          setErrorMessage(`confirmPassword is missing`);
          return;
        }
        if (personalData["password"] && personalData["confirmPassword"]) {
          if (personalData["password"] !== personalData["confirmPassword"]) {
            console.log("password and confirm password must be the same");
            setErrorMessage("password and confirm password must be the same");
            return;
          }
        }
      } else {
        setErrorMessage("");
      }
    }
    setErrorMessage("");
    save(personalData);
  };

  return (
    <View
      className={`${isKeyboardVisible ? "pb-150px] top-[280px]" : "top-1/2"} z-40 flex-1 justify-center items-center absolute -translate-x-1/2  -translate-y-1/2 left-1/2`}
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
      <View className=" w-[360px] flex-1 rounded-3xl overflow-hidden">
        <LinearGradient
          colors={["#6292EB", "#EBA262"]}
          className="absolute inset-0"
          pointerEvents="none"
        />
        <View className="flex-1 justify-start items-center">
          <View className="bg-black/20 h-14 w-full justify-center items-center relative">
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
              Profile Edit
            </Text>
          </View>
          <ScrollView className={`${isKeyboardVisible ? "h-[300px]" : ""}`}>
            <View className="flex-1 px-4 my-2 gap-1 w-full justify-start items-center ">
              <TouchableOpacity
                activeOpacity={0.9}
                className="flex relative"
                onPress={() => pickImage()}
              >
                <Image
                  source={localImage ? { uri: localImage } : profile}
                  resizeMode="contain"
                  className="h-[110px] w-[110px] m-2 rounded-full p-2 border-[1px] border-[#00FF00]"
                />
                <Image
                  source={edit}
                  resizeMode="contain"
                  className="h-6 w-6 m-2 p-2 absolute right-1  top-1"
                />
              </TouchableOpacity>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[48px] w-full flex flex-row items-center gap-3">
                <Image
                  source={profile_r}
                  resizeMode="contain"
                  className="h-7 w-7"
                />
                <TextInput
                  value={personalData.full_name}
                  onChangeText={(text) =>
                    setPersonalData((prev) => ({ ...prev, full_name: text }))
                  }
                  placeholder="Full name"
                  placeholderTextColor={"#FFFFFF6E"}
                  className="text-white text-[18px] h-full font-jura w-[90%]"
                />
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[48px] w-full flex flex-row items-center gap-3">
                <Image
                  source={phone}
                  resizeMode="contain"
                  className="h-7 w-7"
                />
                <TextInput
                  value={personalData.phone_number}
                  onChangeText={(text) =>
                    setPersonalData((prev) => ({ ...prev, phone_number: text }))
                  }
                  inputMode="tel"
                  placeholder="Phone number"
                  placeholderTextColor={"#FFFFFF6E"}
                  className="text-white text-[18px] h-full font-jura w-[90%]"
                />
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-3">
                <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl  w-[80px] items-center">
                  <Text className="text-white text-[18px] font-jura-bold">
                    Weight
                  </Text>
                </View>
                <View className="flex flex-row justify-center items-center">
                  <TextInput
                    value={String(personalData.weight)}
                    inputMode="decimal"
                    onChangeText={(text) =>
                      setPersonalData((prev) => ({ ...prev, weight: text }))
                    }
                    placeholder="0"
                    placeholderTextColor={"#FFFFFF6E"}
                    className="text-white text-[18px] h-full font-jura"
                  />
                  <Text className="text-white text-[18px] h-full font-jura-bold">
                    kg
                  </Text>
                </View>
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-3">
                <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl w-[80px] items-center">
                  <Text className="text-white text-[18px] font-jura-bold">
                    Height
                  </Text>
                </View>
                <View className="flex flex-row justify-center items-center">
                  <TextInput
                    value={String(personalData.height)}
                    inputMode="decimal"
                    onChangeText={(text) =>
                      setPersonalData((prev) => ({ ...prev, height: text }))
                    }
                    placeholder="0"
                    placeholderTextColor={"#FFFFFF6E"}
                    className="text-white text-[18px] h-full font-jura"
                  />
                  <Text className="text-white text-[18px] h-full font-jura-bold">
                    cm
                  </Text>
                </View>
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-3">
                <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl  w-[80px] items-center">
                  <Text className="text-white text-[18px] font-jura-bold">
                    Age
                  </Text>
                </View>
                <TextInput
                  inputMode="decimal"
                  value={String(personalData.age)}
                  onChangeText={(text) =>
                    setPersonalData((prev) => ({ ...prev, age: text }))
                  }
                  placeholder="Age"
                  placeholderTextColor={"#FFFFFF6E"}
                  className="text-white text-[18px] h-full font-jura"
                />
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
                <Image source={key} resizeMode="contain" className="h-7 w-7" />
                <TextInput
                  secureTextEntry={isInvisibleOldPassword}
                  value={personalData.oldPassword}
                  onChangeText={(text) =>
                    setPersonalData((prev) => ({ ...prev, oldPassword: text }))
                  }
                  placeholder="Old password"
                  placeholderTextColor={"#FFFFFF6E"}
                  className="text-white text-[18px] font-jura w-[75%]"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    setIsInvisibleOldPassword(!isInvisibleOldPassword)
                  }
                >
                  <Image
                    source={isInvisibleOldPassword ? hide_key : unhide_key}
                    resizeMode="contain"
                    className="h-7 w-7"
                  />
                </TouchableOpacity>
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
                <Image source={key} resizeMode="contain" className="h-7 w-7" />
                <TextInput
                  secureTextEntry={isInvisiblePassword}
                  value={personalData.password}
                  onChangeText={(text) =>
                    setPersonalData((prev) => ({ ...prev, password: text }))
                  }
                  placeholder="New password"
                  placeholderTextColor={"#FFFFFF6E"}
                  className="text-white text-[18px] font-jura w-[75%]"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsInvisiblePassword(!isInvisiblePassword)}
                >
                  <Image
                    source={isInvisiblePassword ? hide_key : unhide_key}
                    resizeMode="contain"
                    className="h-7 w-7"
                  />
                </TouchableOpacity>
              </View>
              <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
                <Image source={key} resizeMode="contain" className="h-7 w-7" />
                <TextInput
                  secureTextEntry={isInvisibleConfirm}
                  value={personalData.confirmPassword}
                  onChangeText={(text) =>
                    setPersonalData((prev) => ({
                      ...prev,
                      confirmPassword: text,
                    }))
                  }
                  placeholder="Confirm password"
                  placeholderTextColor={"#FFFFFF6E"}
                  className="text-white text-[18px] font-jura w-[75%]"
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setIsInvisibleConfirm(!isInvisibleConfirm)}
                >
                  <Image
                    source={isInvisibleConfirm ? hide_key : unhide_key}
                    resizeMode="contain"
                    className="h-7 w-7"
                  />
                </TouchableOpacity>
              </View>
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

export default EditMember;
