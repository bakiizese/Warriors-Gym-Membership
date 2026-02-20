import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppGradient from "../Component/AppGradient";
import logo from "../../src/assets/logo.png";
import arrow from "../../src/assets/icons/arrow.png";
import phone from "../../src/assets/icons/phone.png";
import key from "../../src/assets/icons/key.png";
import hide_key from "../../src/assets/icons/hide_key.png";
import unhide_key from "../../src/assets/icons/hide_key.png";
import ApiClient from "../utils/ApiClient";

export default function AuthPage() {
  const navigate = useNavigate();

  const [isInvisible, setIsInvisible] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingStat, setLoadingStat] = useState(false);

  const fetchLogin = () => {
    if (!phoneNumber) return setErrorMessage("Phone number is empty");
    if (!password) return setErrorMessage("Password is empty");

    if (isNaN(Number(phoneNumber)))
      return setErrorMessage("Phone number must not include alphabets");

    setErrorMessage("");
    setLoadingStat(true);

    requestLogin();
  };

  const requestLogin = async () => {
    try {
      const res = await ApiClient.post("auth/sign-in/admin", {
        phone_number: phoneNumber,
        password: password,
      });

      const { token } = res.data;
      localStorage.setItem("adminToken", token);
      navigate("/dashboard");

      setLoadingStat(false);
      setErrorMessage("");
    } catch (error) {
      setLoadingStat(false);

      if (error.response) {
        setErrorMessage(error.response.data?.error || "Backend error");
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <AppGradient>
      <div className="min-h-screen flex flex-col relative items-center justify-center ">
        <img
          src={logo}
          alt="logo"
          className="absolute top-1/2 left-1/2 w-[60%] h-[100%] -translate-x-1/2 -translate-y-1/2 opacity-50 object-cover"
        />

        <div className="bg-white/30 rounded-3xl justify-center items-center z-30">
          <div className="flex flex-col gap-4 mb-12 text-center">
            <h1 className="text-black text-[48px] font-jura font-bold tracking-[5px]">
              Warriors
            </h1>
            <h2 className="text-black text-[43px] font-jura font-bold">
              Login
            </h2>
            <p className="text-black text-[22px] font-jura font-bold">
              Please enter your phone number and password
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3 bg-[#2A2A2C] rounded-2xl px-5 h-[50px]">
              <img src={phone} alt="phone" className="w-7 h-7" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
                className="bg-transparent text-white placeholder-white/60 w-full outline-none text-lg font-jura"
              />
            </div>

            <div className="flex items-center gap-3 bg-[#2A2A2C] rounded-2xl px-5 h-[50px]">
              <img src={key} alt="key" className="w-7 h-7" />
              <input
                type={isInvisible ? "password" : "text"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="bg-transparent text-white placeholder-white/60 w-full outline-none text-lg font-jura"
              />
              <button onClick={() => setIsInvisible(!isInvisible)}>
                <img
                  src={isInvisible ? hide_key : unhide_key}
                  alt="toggle password"
                  className="w-7 h-7"
                />
              </button>
            </div>

            {errorMessage && (
              <p className="text-red-600/80 text-center text-sm">
                {errorMessage}
              </p>
            )}

            <button
              className="flex items-center justify-center gap-2 bg-[#56C556] rounded-full h-[50px] w-full text-white text-xl font-jura-bold"
              onClick={fetchLogin}
              disabled={loadingStat}
            >
              {loadingStat ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Login
                  <img src={arrow} alt="arrow" className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppGradient>
  );
}
