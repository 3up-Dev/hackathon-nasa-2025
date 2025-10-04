import { create } from 'zustand';
import { translations, Language, TranslationKey } from '@/i18n/translations';

interface LanguageStore {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

export const useLanguage = create<LanguageStore>((set, get) => ({
  lang: 'pt',
  toggleLanguage: () =>
    set((state) => ({
      lang: state.lang === 'pt' ? 'en' : 'pt',
    })),
  t: (key: TranslationKey, params?: Record<string, string>) => {
    const { lang } = get();
    let text = translations[lang][key] || translations.pt[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  },
}));
