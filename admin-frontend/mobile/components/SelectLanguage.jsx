import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const SelectLanguage = ({ primary, setPrimary }) => {
  const [secondary, setSecondary] = useState("Tigrigna");
  const [tertiary, setTertiary] = useState("Amharic");
  const [langSelector, setLangSelector] = useState(false);

  return (
    <View className="absolute justify-center items-center z-30">
      <TouchableOpacity
        onPress={() => setLangSelector(!langSelector)}
        className="text-xl text-center self-center "
      >
        <Text className="text-white text-[24px] font-jura leading-none">
          {primary}
        </Text>
      </TouchableOpacity>
      {langSelector && (
        <View className="flex-1 justify-center items-center bg-[#777676] my-[6px] py-1 border-x-[1px] w-[110px] gap-1 border-b-[1px] border-[#424141] rounded-md">
          <TouchableOpacity
            onPress={() => {
              (setPrimary(secondary), setSecondary(primary));
              setLangSelector(false);
            }}
            className={`px-1 rounded-md ${TouchableOpacity}`}
          >
            <Text className="text-white text-[24px] font-jura leading-none">
              {secondary}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              (setPrimary(tertiary), setTertiary(primary));
              setLangSelector(false);
            }}
            className={`px-1 rounded-md ${TouchableOpacity} `}
          >
            <Text className="text-white text-[24px] font-jura leading-none">
              {tertiary}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SelectLanguage;
