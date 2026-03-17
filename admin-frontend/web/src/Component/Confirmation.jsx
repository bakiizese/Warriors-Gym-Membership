import React from "react";
import remove from "../assets/icons/remove.png";

const Confirmation = ({ setRemove, title, content, onConfirmed }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center px-10 bg-black/50">
      <div className="bg-gray-800 w-full max-w-md rounded-2xl border-2 border-[#0ba50b] overflow-hidden">
        <div className="bg-black/20 py-2 flex justify-center items-center relative">
          <h2 className="text-white text-[25px] font-jura-bold h-8">{title}</h2>
          <button
            onClick={() => setRemove(false)}
            className="absolute top-2 right-2 flex justify-center items-center h-9 w-14"
          >
            <img src={remove} alt="Close" className="h-6 w-10 object-contain" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-3">
          <p className="text-white text-[20px] font-jura px-3">{content}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onConfirmed}
              className="border-2 border-[#00FF00] py-1 px-4 rounded-xl"
            >
              <span className="text-white text-[30px] font-jura-bold tracking-[3px]">
                Yes
              </span>
            </button>
            <button
              onClick={() => setRemove(false)}
              className="border-2 border-[#00FF00] py-1 px-4 rounded-xl"
            >
              <span className="text-white text-[30px] font-jura-bold tracking-[3px]">
                No
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
