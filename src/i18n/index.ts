import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import de from './locales/de';
import en from './locales/en';
import sl from './locales/sl';

export const SUPPORTED_LANGUAGES = [
  { code: 'de', name: 'Deutsch', flag: '🇦🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

const resources = {
  de: { translation: de },
  en: { translation: en },
  sl: { translation: sl },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'de',
    supportedLngs: ['de', 'en', 'sl'],

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Cache user language selection
      caches: ['localStorage'],
      lookupLocalStorage: 'funkpilot_language',
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: false,
    },
  });

// Helper to change language and persist
export const changeLanguage = (lng: SupportedLanguage) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('funkpilot_language', lng);
};

// Get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  const lang = i18n.language?.split('-')[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES.some(l => l.code === lang) ? lang : 'de';
};

export default i18n;
