import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import tg from "./locales/tg.json";
import am from "./locales/am.json";

i18n.use(initReactI18next).init({
  resources: {
    English: { translation: en },
    Tigrigna: { translation: tg },
    Amharic: { translation: am },
  },
  lng: "English",
  fallbackLng: "English",
  interpolation: { escapeValue: false },
});

export default i18n;
