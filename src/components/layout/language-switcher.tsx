'use client';

import { Globe } from 'lucide-react';
import { useLocaleStore, ALL_LOCALES } from '@/stores/locale-store';
import { LOCALE_CONFIGS, type Locale } from '@/lib/i18n/locales';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'full' | 'compact' | 'flag-only';
  className?: string;
}

export function LanguageSwitcher({ variant = 'full', className }: LanguageSwitcherProps) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const handleChange = (value: string) => {
    setLocale(value as Locale);
  };

  if (variant === 'flag-only') {
    return (
      <Select value={locale} onValueChange={handleChange}>
        <SelectTrigger className={cn(
          'w-auto h-8 border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 gap-1.5 px-2',
          className
        )}>
          <span className="text-sm">{LOCALE_CONFIGS[locale as Locale]?.flag}</span>
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          {ALL_LOCALES.map((loc) => (
            <SelectItem key={loc} value={loc} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
              <span className="mr-2">{LOCALE_CONFIGS[loc].flag}</span>
              {LOCALE_CONFIGS[loc].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (variant === 'compact') {
    return (
      <Select value={locale} onValueChange={handleChange}>
        <SelectTrigger className={cn(
          'w-auto h-8 border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600 gap-1.5 px-2',
          className
        )}>
          <Globe className="size-3.5 text-zinc-400" />
          <span className="text-xs">{LOCALE_CONFIGS[locale as Locale]?.flag}</span>
          <span className="text-[11px]">{LOCALE_CONFIGS[locale as Locale]?.taxShort} {Math.round(LOCALE_CONFIGS[locale as Locale]?.taxRate * 100)}%</span>
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          {ALL_LOCALES.map((loc) => {
            const config = LOCALE_CONFIGS[loc];
            return (
              <SelectItem key={loc} value={loc} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                <div className="flex items-center gap-2">
                  <span>{config.flag}</span>
                  <span>{config.label}</span>
                  <span className="text-zinc-500 text-[10px] ml-1">({config.taxShort} {Math.round(config.taxRate * 100)}%)</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
        <Globe className="size-3" />
        Language / Tax
      </label>
      <Select value={locale} onValueChange={handleChange}>
        <SelectTrigger className="w-full bg-zinc-800 border-zinc-700 text-zinc-200 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-700">
          {ALL_LOCALES.map((loc) => {
            const config = LOCALE_CONFIGS[loc];
            return (
              <SelectItem key={loc} value={loc} className="text-zinc-200 focus:bg-zinc-800 focus:text-zinc-100">
                <div className="flex items-center gap-2">
                  <span className="text-base">{config.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-xs">{config.label}</span>
                    <span className="text-[10px] text-zinc-500">
                      {config.currency} · {config.taxShort} {Math.round(config.taxRate * 100)}%
                    </span>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
