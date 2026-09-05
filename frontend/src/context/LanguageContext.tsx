import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "../i18n";

export type LanguageCode =
  | "en"
  | "ta"
  | "hi"
  | "te"
  | "kn"
  | "ml"
  | "mr"
  | "bn"
  | "gu"
  | "pa"
  | "or"
  | "as";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", script: "Latin" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", script: "Tamil" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", script: "Devanagari" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", script: "Telugu" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", script: "Kannada" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", script: "Malayalam" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", script: "Devanagari" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", script: "Bengali" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", script: "Gujarati" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", script: "Gurmukhi" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", script: "Odia" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", script: "Bengali-Assamese" },
];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  supportedLanguages: LanguageOption[];
  isLanguageModalOpen: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "setu_preferred_language";
const FIRST_VISIT_KEY = "setu_language_chosen";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved as LanguageCode;
    }
    return "en";
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem(FIRST_VISIT_KEY);
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    localStorage.setItem(FIRST_VISIT_KEY, "true");
    document.documentElement.lang = lang;
  };

  const openLanguageModal = () => setIsLanguageModalOpen(true);
  const closeLanguageModal = () => {
    localStorage.setItem(FIRST_VISIT_KEY, "true");
    setIsLanguageModalOpen(false);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  /**
   * Synchronous Dot-notation translator referencing the active language state
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = i18n.t(key, { ...params, lng: language });
    if (translation && translation !== key) {
      return translation;
    }

    if (key.startsWith("nav.")) {
      const navKey = key.replace("nav.", "navigation.");
      const navTranslation = i18n.t(navKey, { ...params, lng: language });
      if (navTranslation && navTranslation !== navKey) {
        return navTranslation;
      }
    }

    return key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isLanguageModalOpen,
        openLanguageModal,
        closeLanguageModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
