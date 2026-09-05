"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  type SupportedLanguage,
  type LanguageMeta,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
} from "./translations";

interface LanguageContextValue {
  language: SupportedLanguage;
  currentMeta: LanguageMeta;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageMeta[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "mendx_platform_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
      if (saved && TRANSLATIONS[saved]) {
        setLanguageState(saved);
      } else {
        // Check browser language
        const navLang = navigator.language.split("-")[0] as SupportedLanguage;
        if (TRANSLATIONS[navLang]) {
          setLanguageState(navLang);
        }
      }
    } catch {
      // Fallback silently if localStorage blocked
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (TRANSLATIONS[newLang]) {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
        // Also sync with mendx_settings defaultLanguage if present
        const settingsRaw = localStorage.getItem("mendx_settings");
        if (settingsRaw) {
          const parsed = JSON.parse(settingsRaw);
          parsed.defaultLanguage = newLang;
          localStorage.setItem("mendx_settings", JSON.stringify(parsed));
        }
      } catch {}
      // Update HTML lang & dir
      const meta = SUPPORTED_LANGUAGES.find((l) => l.code === newLang);
      if (meta && typeof document !== "undefined") {
        document.documentElement.lang = newLang;
        document.documentElement.dir = meta.direction;
      }
    }
  }, []);

  const currentMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = TRANSLATIONS[language];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      // Fallback to English
      const enDict = TRANSLATIONS["en"];
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        currentMeta,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback safe dummy object if accessed outside of provider
    return {
      language: "en",
      currentMeta: SUPPORTED_LANGUAGES[0],
      setLanguage: () => {},
      t: (key: string, fallback?: string) => fallback || key,
      languages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
}
