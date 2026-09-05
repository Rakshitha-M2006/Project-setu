import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import ta from "./locales/ta/translation.json";
import hi from "./locales/hi/translation.json";
import te from "./locales/te/translation.json";
import kn from "./locales/kn/translation.json";
import ml from "./locales/ml/translation.json";
import mr from "./locales/mr/translation.json";
import bn from "./locales/bn/translation.json";
import gu from "./locales/gu/translation.json";
import pa from "./locales/pa/translation.json";
import or from "./locales/or/translation.json";
import as from "./locales/as/translation.json";

export const resources = {
  en: { translation: en },
  ta: { translation: ta },
  hi: { translation: hi },
  te: { translation: te },
  kn: { translation: kn },
  ml: { translation: ml },
  mr: { translation: mr },
  bn: { translation: bn },
  gu: { translation: gu },
  pa: { translation: pa },
  or: { translation: or },
  as: { translation: as },
} as const;

export const defaultNS = "translation";

const savedLanguage = localStorage.getItem("setu_preferred_language") || "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    defaultNS,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Synchronize document.documentElement.lang on language change
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem("setu_preferred_language", lng);
});

export default i18n;
