import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// All locales we support. English is the source of truth; the other 21 fall back
// to English when a key is missing. Phase 5.6 will fill in priority languages
// (es/fr/de/hi/zh-cn) with human-quality translations; the rest can be machine-
// seeded later via /studio.
export const SUPPORTED_LOCALES = [
  'en', 'es', 'pt', 'fr', 'de', 'it', 'nl', 'pl', 'sv', 'da', 'no',
  'fi', 'el', 'zh-cn', 'zh-tw', 'ja', 'ko', 'hi', 'ar', 'tr', 'vi', 'id',
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

// Right-to-left languages need <html dir="rtl"> + reversed layout helpers.
export const RTL_LOCALES: Locale[] = ['ar'];

void i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LOCALES],
    ns: ['common'],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lang',
      lookupCookie: 'huewhimsy_locale',
      lookupLocalStorage: 'huewhimsy_locale',
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.includes(locale as Locale);
}

export function applyLocaleToDocument(locale: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr';
}

i18n.on('languageChanged', (lng) => {
  applyLocaleToDocument(lng);
});

if (typeof document !== 'undefined') {
  applyLocaleToDocument(i18n.language ?? 'en');
}

export default i18n;
