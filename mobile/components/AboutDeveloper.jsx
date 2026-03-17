import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";

export default function AboutDeveloper() {
  const openLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.log("Failed to open URL:", err),
    );
  };

  return (
    <View className="flex-1 p-5 pb-0 justify-end">
      <Text className="text-2xl font-bold text-center tracking-[3px]">
        Developer Info
      </Text>

      <Text className="text-xl font-semibold">Bereket Zeselassie</Text>
      <Text className="text-gray-500 leading-none">
        Full-Stack Software Engineer
      </Text>

      <Text className="text-lg font-bold">Contact</Text>
      <View className="w-full flex-row justify-between">
        <TouchableOpacity
          onPress={() => openLink("mailto:bereketzeselassie@gmail.com")}
        >
          <Text className="text-blue-500 decoration: underline font-medium leading-none">
            bereketzeselassie@gmail.com
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            openLink("https://www.linkedin.com/in/bereket-zeselassie-embaye")
          }
        >
          <Text className="text-blue-500 decoration: underline font-medium leading-none">
            LinkedIn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openLink("https://wa.me/251941353944")}
        >
          <Text className="text-blue-500 decoration: underline font-medium leading-none">
            WhatsApp
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => openLink("https://t.me/bereket_zeselassie")}
        >
          <Text className="text-blue-500 decoration: underline font-medium leading-none">
            Telegram
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="self-center"
        onPress={() => openLink("https://github.com/bakiizese")}
      >
        <Text className="text-blue-500 decoration: underline font-medium leading-none">
          GitHub
        </Text>
      </TouchableOpacity>
      <Text className="text-gray-600 text-sm text-center">
        © 2026 Bereket Zeselassie. All rights reserved.
      </Text>
    </View>
  );
}
