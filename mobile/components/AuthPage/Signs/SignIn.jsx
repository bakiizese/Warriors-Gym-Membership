import React, { useEffect, useState } from "react";
import Sign from "./Sign";
import { View } from "react-native";

const SignIn = ({
  setPhoneNumber,
  phoneNumber,
  setPassword,
  password,
  errorMessage,
}) => {
  return (
    <Sign
      signType="signIn"
      setPhoneNumber={setPhoneNumber}
      phoneNumber={phoneNumber}
      setPassword={setPassword}
      password={password}
      errorMessage={errorMessage}
    />
  );
};

export default SignIn;
