'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Locale, type LocaleConfig, LOCALE_CONFIGS, ALL_LOCALES } from '@/lib/i18n/locales';
import { TRANSLATIONS, type Translations } from '@/lib/i18n/translations';

interface LocaleState {
  locale: Locale;
  config: LocaleConfig;
  translations: Translations;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const DEFAULT_LOCALE: Locale = 'en-GB';

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: DEFAULT_LOCALE,
      config: LOCALE_CONFIGS[DEFAULT_LOCALE],
      translations: TRANSLATIONS[DEFAULT_LOCALE],
      t: TRANSLATIONS[DEFAULT_LOCALE],

      setLocale: (locale: Locale) => {
        const config = LOCALE_CONFIGS[locale];
        const translations = TRANSLATIONS[locale];
        set({ locale, config, translations, t: translations });
      },
    }),
    {
      name: 'restaurant-locale',
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const locale = state.locale;
          state.config = LOCALE_CONFIGS[locale];
          state.translations = TRANSLATIONS[locale];
          state.t = TRANSLATIONS[locale];
        }
      },
    }
  )
);

/* ─── Convenience hooks ─── */

export function useT(): Translations {
  return useLocaleStore((s) => s.t);
}

export function useLocaleConfig(): LocaleConfig {
  return useLocaleStore((s) => s.config);
}

export function useLocale(): Locale {
  return useLocaleStore((s) => s.locale);
}

export function useSetLocale() {
  return useLocaleStore((s) => s.setLocale);
}

export { ALL_LOCALES };
