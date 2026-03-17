import React, { useState } from "react";
import CommonEdit from "./CommonEdit";
import SelectLanguage from "./SelectLanguage";
import edit from "../assets/icons/edit.png";
import hide_key from "../assets/icons/hide_key.png";
import unhide_key from "../assets/icons/hide_key.png";
import key from "../assets/icons/key.png";
import phone from "../assets/icons/phone.png";
import profile_r from "../assets/icons/profile-r.png";
import profile from "../assets/icons/profile.png";

const MemberCrud = ({
  type,
  setRemove,
  save,
  errorMessage,
  setErrorMessage,
  loading,
}) => {
  const [isInvisiblePassword, setIsInvisiblePassword] = useState(true);
  const [isInvisibleConfirm, setIsInvisibleConfirm] = useState(true);
  const [localImage, setLocalImage] = useState(null);
  const [language, setLanguage] = useState("English");
  const [personalData, setPersonalData] = useState({
    full_name: "",
    phone_number: "",
    weight: "",
    height: "",
    age: "",
    language: language,
    gender: "Male",
    password: "",
    confirmPassword: "",
    image: "",
  });

  const pickImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      console.log(imageUrl);
      setLocalImage(imageUrl);
      setPersonalData((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  const checkData = () => {
    for (const key in personalData) {
      if (personalData[key] === "" && key !== "image" && key !== "language") {
        setErrorMessage(`${key} is missing`);
        return;
      } else if (key === "phone_number" && isNaN(Number(personalData[key]))) {
        setErrorMessage(`phone number must be an integer`);
        return;
      } else if (key === "phone_number" && personalData[key].length !== 10) {
        setErrorMessage(`please enter an actual phone number`);
        return;
      } else if (personalData.password && personalData.confirmPassword) {
        if (personalData.password !== personalData.confirmPassword) {
          setErrorMessage("password and confirm password must be the same");
          return;
        }
      } else {
        setErrorMessage("");
      }
    }
    setErrorMessage("");
    save(personalData);
  };

  return (
    <CommonEdit
      errorMessage={errorMessage}
      checkData={checkData}
      setRemove={setRemove}
      loading={loading}
      title={type}
    >
      <div className="flex flex-col gap-2 px-4 my-2 w-full">
        <div className="relative flex justify-center items-center">
          <label>
            <img
              src={localImage || profile}
              alt="profile"
              className="h-[110px] w-[110px] rounded-full border-[1px] border-[#00FF00] cursor-pointer"
            />
            <input
              type="file"
              accept="image/*"
              onChange={pickImage}
              className="hidden"
            />
            <img
              src={edit}
              alt="edit"
              className="h-6 w-6 absolute top-0 right-0"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 bg-[#2A2A2C]/90 rounded-2xl px-5 h-[48px] w-full">
          <img src={profile_r} alt="profile icon" className="h-7 w-7" />
          <input
            type="text"
            value={personalData.full_name}
            onChange={(e) =>
              setPersonalData((prev) => ({
                ...prev,
                full_name: e.target.value,
              }))
            }
            placeholder="Full name"
            className="text-white text-[18px] h-full w-[90%] bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-3 bg-[#2A2A2C]/90 rounded-2xl px-5 h-[48px] w-full">
          <img src={phone} alt="phone" className="h-7 w-7" />
          <input
            type="tel"
            value={personalData.phone_number}
            onChange={(e) =>
              setPersonalData((prev) => ({
                ...prev,
                phone_number: e.target.value.replace(/\s/g, ""),
              }))
            }
            placeholder="Phone number"
            className="text-white text-[18px] h-full w-[90%] bg-transparent outline-none"
          />
        </div>

        {type === "Add Member" && (
          <>
            <div className="flex gap-3 flex-col">
              {["weight", "height", "age"].map((attr) => (
                <div
                  key={attr}
                  className="flex items-center gap-3 bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full"
                >
                  <div className="bg-[#4CA24F] w-[80px] flex items-center justify-center rounded-xl">
                    <p className="text-white text-[18px] font-jura-bold">
                      {attr.charAt(0).toUpperCase() + attr.slice(1)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={personalData[attr]}
                      onChange={(e) =>
                        setPersonalData((prev) => ({
                          ...prev,
                          [attr]: e.target.value,
                        }))
                      }
                      placeholder="0"
                      className="text-white text-[18px] h-full w-[20%] bg-transparent outline-none"
                    />
                    {(attr === "weight" && (
                      <span className="text-white">kg</span>
                    )) ||
                      (attr === "height" && (
                        <span className="text-white">cm</span>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center gap-3 bg-[#2A2A2C]/90 rounded-2xl px-2 h-[48px] w-full">
              <div className="bg-[#4CA24F] w-[160px] flex items-center justify-center rounded-xl">
                <p className="text-white text-[18px] font-jura-bold">
                  Select language
                </p>
              </div>
              <div className="bg-[#777676] p-1 px-2 rounded-md border-[1px] border-[#424141] relative h-9 w-[120px]">
                <SelectLanguage primary={language} setPrimary={setLanguage} />
              </div>
            </div>

            <div className="flex justify-center items-center gap-10">
              {["Male", "Female"].map((g) => (
                <button
                  key={g}
                  className={`border-2 border-[#787878] rounded-xl px-4 h-10 ${
                    personalData.gender === g
                      ? "bg-[#4CA24F]"
                      : "bg-[#4CA24F]/50"
                  } text-white text-[22px] font-jura-bold`}
                  onClick={() =>
                    setPersonalData((prev) => ({ ...prev, gender: g }))
                  }
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        )}

        {["password", "confirmPassword"].map((field) => (
          <div
            key={field}
            className="flex items-center gap-3 bg-[#2A2A2C]/90 rounded-2xl px-5 h-[45px] w-full"
          >
            <img src={key} alt="key" className="h-7 w-7" />
            <input
              type={
                field === "password"
                  ? isInvisiblePassword
                    ? "password"
                    : "text"
                  : isInvisibleConfirm
                    ? "password"
                    : "text"
              }
              value={personalData[field]}
              onChange={(e) =>
                setPersonalData((prev) => ({
                  ...prev,
                  [field]: e.target.value,
                }))
              }
              placeholder={
                field === "password" ? "New password" : "Confirm password"
              }
              className="text-white text-[18px] w-[75%] bg-transparent outline-none"
            />
            <button
              onClick={() =>
                field === "password"
                  ? setIsInvisiblePassword(!isInvisiblePassword)
                  : setIsInvisibleConfirm(!isInvisibleConfirm)
              }
            >
              <img
                src={
                  field === "password"
                    ? isInvisiblePassword
                      ? hide_key
                      : unhide_key
                    : isInvisibleConfirm
                      ? hide_key
                      : unhide_key
                }
                alt="toggle"
                className="h-7 w-7"
              />
            </button>
          </div>
        ))}
      </div>
    </CommonEdit>
  );
};

export default MemberCrud;
