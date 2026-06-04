'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Locale, type LocaleConfig, LOCALE_CONFIGS, ALL_LOCALES } from '@/lib/i18n/locales';
import { TRANSLATIONS, type Translations } from '@/lib/i18n/translations';

interface LocaleState {
  locale: Locale;
  config: LocaleConfig;
  translations: Translations;
  customTaxRate: number | null;
  setLocale: (locale: Locale) => void;
  setCustomTaxRate: (rate: number | null) => void;
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
      customTaxRate: null,

      setLocale: (locale: Locale) => {
        const customTax = get().customTaxRate;
        const baseConfig = LOCALE_CONFIGS[locale];
        const config = typeof customTax === 'number' ? { ...baseConfig, taxRate: customTax } : baseConfig;
        const translations = TRANSLATIONS[locale];
        set({ locale, config, translations, t: translations });
      },

      setCustomTaxRate: (rate: number | null) => {
        const locale = get().locale;
        const baseConfig = LOCALE_CONFIGS[locale];
        const config = typeof rate === 'number' ? { ...baseConfig, taxRate: rate } : baseConfig;
        set({ customTaxRate: rate, config });
      }
    }),
    {
      name: 'restaurant-locale',
      partialize: (state) => ({ locale: state.locale, customTaxRate: state.customTaxRate }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const locale = state.locale;
          const customTax = state.customTaxRate;
          const baseConfig = LOCALE_CONFIGS[locale];
          state.config = typeof customTax === 'number' ? { ...baseConfig, taxRate: customTax } : baseConfig;
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

export function useCustomTaxRate() {
  return useLocaleStore((s) => s.customTaxRate);
}

export function useSetCustomTaxRate() {
  return useLocaleStore((s) => s.setCustomTaxRate);
}

export { ALL_LOCALES };
