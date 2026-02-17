import { Image, Text, TouchableOpacity, View } from "react-native";
import remove from "@/assets/icons/remove.png";
import { useTranslation } from "react-i18next";

const Confirmation = ({ setRemove, title, content, onConfirmed }) => {
  const { t } = useTranslation();

  return (
    <View className="absolute inset-0 z-20 justify-center items-center px-10">
      <View className="bg-gray-800 w-full rounded-2xl justify-between border-2 gap-2 overflow-hidden border-[#0ba50b]">
        <View className="bg-black/20 py-2 items-center">
          <Text className="text-white leading-none text-[25px] font-jura-bold h-8">
            {t(`components.${title}`)}
          </Text>
          <TouchableOpacity
            onPress={() => setRemove(false)}
            className="absolute h-9 w-14 top-2 right-2 justify-center items-center"
          >
            <Image source={remove} resizeMode="contain" className="h-6 w-10" />
          </TouchableOpacity>
        </View>
        <View className="flex flex-col gap-5 p-3">
          <Text className="text-white leading-none text-[20px] font-jura px-3">
            {t(`components.${content}`)}
          </Text>
          <View className="flex flex-row gap-3 justify-end">
            <TouchableOpacity
              onPress={onConfirmed}
              className="border-[#00FF00] border-2 py-1 px-4 rounded-xl"
            >
              <Text className="text-white leading-none tracking-[3px] text-[30px] font-jura-bold]">
                {t("components.Yes")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setRemove(false)}
              className="border-[#00FF00] border-2 py-1 px-4 rounded-xl"
            >
              <Text className="text-white leading-none  tracking-[3px] text-[30px] font-jura-bold]">
                {t("components.No")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Confirmation;
