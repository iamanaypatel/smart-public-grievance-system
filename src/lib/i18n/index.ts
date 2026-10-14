import { en } from './en';
import { hi } from './hi';

export type Language = 'en' | 'hi';

export const translations = {
  en,
  hi,
};

export function getTranslation(lang: Language, key: keyof typeof en): string {
  return translations[lang]?.[key] || translations.en[key] || String(key);
}
