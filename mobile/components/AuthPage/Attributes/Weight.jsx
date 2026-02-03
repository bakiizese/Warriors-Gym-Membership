import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import WheelPicker from "react-native-wheel-picker-expo";

const Weight = ({ setSelectedWeight }) => {
  const startWeight = 30;
  const endWeight = 150;
  const WEIGHT = Array.from(
    { length: endWeight - startWeight + 1 },
    (_, i) => ({
      label: `${i + startWeight}kg`,
      value: i + startWeight,
    }),
  );
  return (
    <View className="flex-1 justify-center items-center">
      <View className="h-[200px] w-44 rounded-3xl justify-center overflow-hidden">
        <View className="flex-1 items-center justify-center">
          <WheelPicker
            initialSelectedIndex={30}
            items={WEIGHT}
            onChange={({ item }) => setSelectedWeight(item.value)}
            height={400}
            width={150}
            renderItem={(item) => (
              <View className="justify-center items-center h-full">
                <Text className="text-5xl self-center font-jura-bold">
                  {item.label}
                </Text>
              </View>
            )}
          />
        </View>
        <LinearGradient
          colors={["#6292EB", "transparent", "transparent", "#EBA262"]}
          className="absolute inset-0 "
          pointerEvents="none"
          locations={[0, 0.3, 0.7, 1]}
        />
      </View>
    </View>
  );
};

export default Weight;
