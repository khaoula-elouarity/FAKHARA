import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import translations from "../data/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("fakhara-language");

    return ["ar", "fr", "en"].includes(savedLanguage)
      ? savedLanguage
      : "ar";
  });

  useEffect(() => {
    const direction = translations[language].direction;

    document.documentElement.lang = language;
    document.documentElement.dir = direction;

    localStorage.setItem("fakhara-language", language);
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        direction: translations[language].direction,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}