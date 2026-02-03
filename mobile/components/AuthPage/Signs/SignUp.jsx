import React from "react";
import Sign from "./Sign";

const SignUp = ({
  setFullName,
  fullName,
  setPhoneNumber,
  phoneNumber,
  setPassword,
  password,
  errorMessage,
}) => {
  return (
    <Sign
      signType="signUp"
      setFullName={setFullName}
      fullName={fullName}
      setPhoneNumber={setPhoneNumber}
      phoneNumber={phoneNumber}
      setPassword={setPassword}
      password={password}
      errorMessage={errorMessage}
    />
  );
};

export default SignUp;
