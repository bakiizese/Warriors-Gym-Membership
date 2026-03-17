import edit from "@/assets/icons/edit.png";
import {
  default as hide_key,
  default as unhide_key,
} from "@/assets/icons/hide_key.png";
import key from "@/assets/icons/key.png";
import phone from "@/assets/icons/phone.png";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import profile_r from "../assets/icons/profile-r.png";
import profile from "../assets/icons/profile.png";
import SelectLanguage from "./SelectLanguage";
import CommonEdit from "./CommonEdit";
import { useTranslation } from "react-i18next";

const UpdateProfile = ({
  type,
  setRemove,
  save,
  errorMessage,
  setErrorMessage,
  loading,
  adminData,
}) => {
  const [isInvisiblePassword, setIsInvisiblePassword] = useState(true);
  const [isInvisibleConfirm, setIsInvisibleConfirm] = useState(true);
  const [localImage, setLocalImage] = useState(null);
  const { t } = useTranslation();
  const [language, setLanguage] = useState(adminData.language || "English");

  const [personalData, setPersonalData] = useState({
    full_name: adminData.full_name || "",
    phone_number: adminData.phone_number || "",
    language: language,
    oldPassword: "",
    password: "",
    confirmPassword: "",
    image: adminData.image || "",
  });
  const ADDRESS = process.env.EXPO_PUBLIC_ADDRESS;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const imageReturn = {
        uri: file.uri || "http//:",
        name: file.fileName || "name",
        type: file.mimeType || "image/jpeg",
      };
      setPersonalData((prev) => ({ ...prev, image: imageReturn }));
      setLocalImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    setPersonalData((prev) => ({ ...prev, language: language }));
  }, [language]);

  const checkData = () => {
    for (const key in personalData) {
      if (
        personalData[key] === "" &&
        !["password", "confirmPassword", "oldPassword", "image"].includes(key)
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
    <CommonEdit
      errorMessage={errorMessage}
      checkData={checkData}
      setRemove={setRemove}
      loading={loading}
      title={type}
    >
      <View className="flex-1 px-4 my-2 gap-1 w-full justify-start items-center relative">
        <TouchableOpacity
          activeOpacity={0.9}
          className="flex relative"
          onPress={() => pickImage()}
        >
          <Image
            source={
              localImage
                ? { uri: localImage }
                : personalData?.image
                  ? {
                      uri: personalData.image.includes("file://")
                        ? personalData.image
                        : `${ADDRESS}/${personalData.image}`,
                    }
                  : profile
            }
            resizeMode="contain"
            className="h-[110px] w-[110px] m-2 rounded-full p-2 border-[1px] border-[#00FF00]"
          />
          <Image
            source={edit}
            resizeMode="contain"
            className="h-6 w-6 m-2 p-2 absolute right-1  top-1"
          />
        </TouchableOpacity>
        <View className="bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full flex flex-row items-center justify-between">
          <View className="bg-[#4CA24F] py-[2px]  rounded-xl  w-[160px] items-center">
            <Text className="text-white text-[18px] font-jura-bold">
              {t("components.Select Language")}
            </Text>
          </View>
          <View className="bg-[#777676] p-1 px-2 rounded-md border-[1px] border-[#424141] relative h-9 w-[120px] items-center">
            <SelectLanguage primary={language} setPrimary={setLanguage} />
          </View>
        </View>
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
        <View className="bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full flex flex-row items-center gap-3">
          <Image source={key} resizeMode="contain" className="h-7 w-7" />
          <TextInput
            secureTextEntry={isInvisiblePassword}
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

export default UpdateProfile;
