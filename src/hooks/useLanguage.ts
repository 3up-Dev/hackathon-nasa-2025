/**
 * Este arquivo foi desenvolvido com assistência de Inteligência Artificial.
 * Toda a lógica, estrutura e implementação foram revisadas e validadas pela equipe humana.
 * 
 * This file was developed with Artificial Intelligence assistance.
 * All logic, structure, and implementation were reviewed and validated by the human team.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, Language, TranslationKey } from '@/i18n/translations';

interface LanguageStore {
  lang: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'language-storage', // nome da chave no localStorage
    }
  )
);
