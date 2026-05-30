export type Locale = 'en-GB' | 'pt-PT' | 'fr-FR' | 'es-ES';

export interface LocaleConfig {
  code: Locale;
  label: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  taxName: string;
  taxShort: string;
  dateFormat: string;
  numberFormat: string;
}

export const LOCALE_CONFIGS: Record<Locale, LocaleConfig> = {
  'en-GB': {
    code: 'en-GB',
    label: 'English (UK)',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    taxRate: 0.20,
    taxName: 'Value Added Tax',
    taxShort: 'VAT',
    dateFormat: 'en-GB',
    numberFormat: 'en-GB',
  },
  'pt-PT': {
    code: 'pt-PT',
    label: 'Português (Portugal)',
    flag: '🇵🇹',
    currency: 'EUR',
    currencySymbol: '€',
    taxRate: 0.23,
    taxName: 'Imposto sobre o Valor Acrescentado',
    taxShort: 'IVA',
    dateFormat: 'pt-PT',
    numberFormat: 'pt-PT',
  },
  'fr-FR': {
    code: 'fr-FR',
    label: 'Français (France)',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    taxRate: 0.20,
    taxName: 'Taxe sur la Valeur Ajoutée',
    taxShort: 'TVA',
    dateFormat: 'fr-FR',
    numberFormat: 'fr-FR',
  },
  'es-ES': {
    code: 'es-ES',
    label: 'Español (España)',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€',
    taxRate: 0.21,
    taxName: 'Impuesto sobre el Valor Añadido',
    taxShort: 'IVA',
    dateFormat: 'es-ES',
    numberFormat: 'es-ES',
  },
};

export const ALL_LOCALES: Locale[] = ['en-GB', 'pt-PT', 'fr-FR', 'es-ES'];

export function getLocaleConfig(locale: Locale): LocaleConfig {
  return LOCALE_CONFIGS[locale];
}

export function getTaxRate(locale: Locale): number {
  return LOCALE_CONFIGS[locale].taxRate;
}

export function getTaxPercent(locale: Locale): number {
  return Math.round(LOCALE_CONFIGS[locale].taxRate * 100);
}

export function formatCurrencyByLocale(amount: number, locale: Locale): string {
  const config = LOCALE_CONFIGS[locale] ?? LOCALE_CONFIGS['en-GB'];
  try {
    return new Intl.NumberFormat(config.numberFormat, {
      style: 'currency',
      currency: config.currency,
    }).format(amount);
  } catch {
    return `${config.currencySymbol}${amount.toFixed(2)}`;
  }
}

export function formatDateByLocale(date: string | Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const config = LOCALE_CONFIGS[locale] ?? LOCALE_CONFIGS['en-GB'];
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat(config.dateFormat, options || {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

export function formatTimeByLocale(date: string | Date, locale: Locale): string {
  const config = LOCALE_CONFIGS[locale] ?? LOCALE_CONFIGS['en-GB'];
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    return new Intl.DateTimeFormat(config.dateFormat, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return d.toLocaleTimeString();
  }
}
