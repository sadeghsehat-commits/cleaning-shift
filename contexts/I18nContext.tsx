'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations } from '@/lib/i18n';

// Import translation files
import enTranslations from '@/messages/en';
import arTranslations from '@/messages/ar';
import ukTranslations from '@/messages/uk';
import itTranslations from '@/messages/it';

type TranslationsMap = {
  [key in Language]: Translations;
};

const translations: TranslationsMap = {
  en: enTranslations as Translations,
  ar: arTranslations as Translations,
  uk: ukTranslations as Translations,
  it: itTranslations as Translations,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  changeLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'ar', 'uk', 'it'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      // Set HTML dir attribute for RTL languages
      if (savedLanguage === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
      }
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Set HTML dir attribute for RTL languages
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  };

  const value: I18nContextType = {
    language,
    setLanguage: changeLanguage,
    t: translations[language],
    changeLanguage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

