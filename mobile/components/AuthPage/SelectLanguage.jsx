import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

const SelectLanguage = ({ primary, setPrimary }) => {
  const [secondary, setSecondary] = useState(
    "Tigrigna" === primary
      ? "Amharic"
      : primary === "English"
        ? "Tigrigna"
        : "English",
  );
  const [tertiary, setTertiary] = useState(
    "Amharic" === primary
      ? "Tigrigna"
      : primary === "English"
        ? "Amharic"
        : "English",
  );
  const [langSelector, setLangSelector] = useState(false);
  const { t } = useTranslation();

  return (
    <View className="absolute justify-center items-center z-30">
      <TouchableOpacity
        onPress={() => setLangSelector(!langSelector)}
        activeOpacity={0}
        className="text-xl text-center self-center"
      >
        <Text className="text-white text-[24px] font-jura leading-none">
          {t(`components.${primary}`)}
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
              {t(`components.${secondary}`)}
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
              {t(`components.${tertiary}`)}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default SelectLanguage;
