import React from "react";
import { LinearGradient } from "expo-linear-gradient";

const AppGradient = ({ children }) => {
  return (
    <LinearGradient className="flex-1" colors={["#6292EB", "#EBA262"]}>
      <LinearGradient
        className="flex-1"
        colors={["rgba(100, 93, 93, 0.5)", "rgba(115, 110, 110, 0.4)"]}
      >
        {children}
      </LinearGradient>
    </LinearGradient>
  );
};

export default AppGradient;
