import React from "react";

const AppGradient = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#6292EB] to-[#EBA262]">
      <div className="min-h-screen bg-gradient-to-b from-[rgba(100,93,93,0.7)] to-[rgba(115,110,110,0.5)]">
        {children}
      </div>
    </div>
  );
};

export default AppGradient;
