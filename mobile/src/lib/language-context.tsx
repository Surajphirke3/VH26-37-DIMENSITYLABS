import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  translate,
  type TranslationKey,
  type LanguageInfo,
} from './i18n';

const STORAGE_KEY_LANG = '@mendx_user_language';
const STORAGE_KEY_AUTODETECT = '@mendx_user_autodetect_lang';

interface LanguageContextType {
  language: string;
  autoDetect: boolean;
  setLanguage: (lang: string) => Promise<void>;
  setAutoDetect: (val: boolean) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  languages: LanguageInfo[];
  activeLanguageInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>('en');
  const [autoDetect, setAutoDetectState] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Load saved preferences on startup
  useEffect(() => {
    async function loadSavedPreferences() {
      try {
        const [savedLang, savedAutoDetect] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_LANG),
          AsyncStorage.getItem(STORAGE_KEY_AUTODETECT),
        ]);

        if (savedLang && TRANSLATIONS[savedLang]) {
          setLanguageState(savedLang);
        }
        if (savedAutoDetect !== null) {
          setAutoDetectState(savedAutoDetect === 'true');
        }
      } catch (err) {
        console.warn('Failed to load language preferences from storage:', err);
      } finally {
        setIsReady(true);
      }
    }

    loadSavedPreferences();
  }, []);

  const setLanguage = useCallback(async (newLang: string) => {
    if (!TRANSLATIONS[newLang] && newLang !== 'en') return;
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_LANG, newLang);
    } catch (err) {
      console.warn('Failed to save language to storage:', err);
    }
  }, []);

  const setAutoDetect = useCallback(async (val: boolean) => {
    setAutoDetectState(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_AUTODETECT, String(val));
    } catch (err) {
      console.warn('Failed to save autodetect to storage:', err);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return translate(language, key, params);
    },
    [language]
  );

  const activeLanguageInfo = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((item) => item.code === language) ??
      SUPPORTED_LANGUAGES[0]
    );
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      autoDetect,
      setLanguage,
      setAutoDetect,
      t,
      languages: SUPPORTED_LANGUAGES,
      activeLanguageInfo,
    }),
    [language, autoDetect, setLanguage, setAutoDetect, t, activeLanguageInfo]
  );

  // If loading, still render children so layout doesn't flash
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
