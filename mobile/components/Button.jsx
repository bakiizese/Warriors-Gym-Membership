import React from "react";
import { TouchableOpacity } from "react-native";
import { View, Text } from "react-native";

const Button = ({ text, color, onClick }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className={`${color} h-[50px] mx-7 rounded-full justify-center items-center`}
      onPress={onClick}
    >
      <Text className="text-white text-[28px] font-jura-bold">{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;
