import { useState } from "react";

const SelectLanguage = ({ primary, setPrimary }) => {
  const [secondary, setSecondary] = useState("Tigrigna");
  const [tertiary, setTertiary] = useState("Amharic");
  const [langSelector, setLangSelector] = useState(false);

  return (
    <div className="relative z-30 flex flex-col items-center">
      <button
        onClick={() => setLangSelector(!langSelector)}
        className="text-white text-[24px] font-jura leading-none px-2 py-1 text-center"
      >
        {primary}
      </button>

      {langSelector && (
        <div className="absolute top-full mt-1 w-[110px] flex flex-col bg-[#777676] border border-[#424141] rounded-md gap-1 py-1">
          <button
            onClick={() => {
              setPrimary(secondary);
              setSecondary(primary);
              setLangSelector(false);
            }}
            className="px-2 py-1 rounded-md text-white text-[24px] font-jura text-center"
          >
            {secondary}
          </button>
          <button
            onClick={() => {
              setPrimary(tertiary);
              setTertiary(primary);
              setLangSelector(false);
            }}
            className="px-2 py-1 rounded-md text-white text-[24px] font-jura text-center"
          >
            {tertiary}
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectLanguage;
