import edit from "@/assets/icons/edit.png";
import {
  default as hide_key,
  default as unhide_key,
} from "@/assets/icons/hide_key.png";
import key from "@/assets/icons/key.png";
import phone from "@/assets/icons/phone.png";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import profile_r from "../assets/icons/profile-r.png";
import profile from "../assets/icons/profile.png";
import SelectLanguage from "./SelectLanguage";
import CommonEdit from "./CommonEdit";

const MemberCrud = ({
  type,
  setRemove,
  save,
  errorMessage,
  setErrorMessage,
  loading,
}) => {
  const [isInvisiblePassword, setIsInvisiblePassword] = useState(true);
  const [isInvisibleConfirm, setIsInvisibleConfirm] = useState(true);
  const [localImage, setLocalImage] = useState(null);
  const [language, setLanguage] = useState("English");
  const [personalData, setPersonalData] = useState({
    full_name: "",
    phone_number: "",
    weight: "",
    height: "",
    age: "",
    language: language,
    gender: "Male",
    password: "",
    confirmPassword: "",
    image: "",
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

  const checkData = () => {
    for (const key in personalData) {
      if (personalData[key] === "" && key !== "image" && key !== "language") {
        console.log(key, "is missing");
        setErrorMessage(`${key} is missing`);
        return;
      } else if (key === "phone_number" && !Number(personalData[key])) {
        setErrorMessage(`phone number must be an integer`);

        console.log("phone_number", "must be integer");
        return;
      } else if (personalData["password"] && personalData["confirmPassword"]) {
        if (personalData["password"] !== personalData["confirmPassword"]) {
          console.log("password and confirm password must be the same");
          setErrorMessage("password and confirm password must be the same");
          return;
        }
      } else {
        setErrorMessage("");
      }
    }
    setErrorMessage("");
    save(personalData);
  };

  return (
    <CommonEdit
      errorMessage={errorMessage}
      checkData={checkData}
      setRemove={setRemove}
      loading={loading}
      title={type}
    >
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
          <Image source={profile_r} resizeMode="contain" className="h-7 w-7" />
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
          <Image source={phone} resizeMode="contain" className="h-7 w-7" />
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
        {type === "Add Member" && (
          <>
            <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center gap-3">
              <View className="bg-[#4CA24F] py-[2px] px-2 rounded-xl  w-[80px] items-center">
                <Text className="text-white text-[18px] font-jura-bold">
                  Weight
                </Text>
              </View>
              <View className="flex flex-row justify-center items-center">
                <TextInput
                  value={personalData.weight}
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
                  value={personalData.height}
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
                value={personalData.age}
                onChangeText={(text) =>
                  setPersonalData((prev) => ({ ...prev, age: text }))
                }
                placeholder="Age"
                placeholderTextColor={"#FFFFFF6E"}
                className="text-white text-[18px] h-full font-jura"
              />
            </View>
            <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center justify-between">
              <View className="bg-[#4CA24F] py-[2px]  rounded-xl  w-[160px] items-center">
                <Text className="text-white text-[18px] font-jura-bold">
                  Select language
                </Text>
              </View>
              <View className="bg-[#777676] p-1 px-2 rounded-md border-[1px] border-[#424141] relative h-9 w-[120px] items-center">
                <SelectLanguage primary={language} setPrimary={setLanguage} />
              </View>
            </View>
            <View className="justify-center gap-10 items-center h-14 w-full flex flex-row">
              <TouchableOpacity
                className={`${personalData.gender === "Male" ? "bg-[#4CA24F]" : "bg-[#4CA24F]/50"} border-2 border-[#787878] rounded-xl px-4 h-10`}
                onPress={() =>
                  setPersonalData((prev) => ({ ...prev, gender: "Male" }))
                }
              >
                <Text className=" text-white text-[22px] font-jura-bold">
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`${personalData.gender === "Female" ? "bg-[#4CA24F]" : "bg-[#4CA24F]/50"} border-2 border-[#787878] rounded-xl px-2 h-10`}
                onPress={() =>
                  setPersonalData((prev) => ({
                    ...prev,
                    gender: "Female",
                  }))
                }
              >
                <Text className="text-white text-[22px] font-jura-bold">
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    </CommonEdit>
  );
};

export default MemberCrud;
