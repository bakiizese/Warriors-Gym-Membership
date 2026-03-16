import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const AppGradient = ({ children }) => {
  return (
    <LinearGradient className="flex-1" colors={["#6292EB", "#EBA262"]}>
      <LinearGradient
        className="flex-1"
        colors={["rgba(100, 93, 93, 0.7)", "rgba(115, 110, 110, 0.5)"]}
      >
        {children}
      </LinearGradient>
    </LinearGradient>
  );
};

export default AppGradient;
