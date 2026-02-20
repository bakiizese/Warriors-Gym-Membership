import React, { useState } from "react";
import remove from "../assets/icons/remove.png";

const CommonEdit = ({
  children,
  errorMessage,
  checkData,
  setRemove,
  loading,
  title,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex justify-center items-center">
      {loading && (
        <div className="absolute inset-0 bg-black/20 z-20 flex justify-center items-center">
          <div className="loader scale-150">
            <div className="border-4 border-white border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
          </div>
        </div>
      )}

      <div className="relative bg-gray-500 w-[360px] overflow-y-scroll rounded-3xl overflow-hidden">
        <div className="relative max-h-[600px] flex flex-col justify-start items-center">
          <div className="relative bg-black/20 h-14 w-full flex justify-center items-center">
            <button
              onClick={() => setRemove(false)}
              className="absolute top-2 right-2 w-10 h-6"
            >
              <img
                src={remove}
                alt="Close"
                className="w-10 h-6 object-contain"
              />
            </button>
            <p className="text-white text-[30px] font-jura">{title}</p>
          </div>

          <div className="flex-1 w-full my-2">{children}</div>

          {errorMessage && (
            <p className="text-red-700 text-[18px] font-jura leading-none text-center mb-1">
              * {errorMessage}
            </p>
          )}

          <button
            onClick={checkData}
            className="bg-[#56C556]/40 mx-[90px] px-6 h-[45px] rounded-3xl flex justify-center items-center p-2 mb-2"
          >
            <p className="text-white text-[32px] font-jura-bold leading-none">
              Save
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonEdit;
