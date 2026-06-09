'use client';

import { useEffect } from 'react';
import { useBranding, BrandColor } from '@/stores/branding-store';

const PALETTES: Record<BrandColor, Record<string, string>> = {
  emerald: {
    '50': 'oklch(0.97 0.03 155)',
    '100': 'oklch(0.93 0.05 155)',
    '200': 'oklch(0.86 0.10 155)',
    '300': 'oklch(0.77 0.18 155)',
    '400': 'oklch(0.66 0.22 155)',
    '500': 'oklch(0.55 0.24 155)',
    '600': 'oklch(0.44 0.22 155)',
    '700': 'oklch(0.35 0.18 155)',
    '800': 'oklch(0.28 0.13 155)',
    '900': 'oklch(0.22 0.09 155)',
    '950': 'oklch(0.13 0.06 155)',
  },
  amber: {
    '50': 'oklch(0.98 0.03 80)',
    '100': 'oklch(0.95 0.06 80)',
    '200': 'oklch(0.89 0.12 80)',
    '300': 'oklch(0.81 0.20 80)',
    '400': 'oklch(0.72 0.23 80)',
    '500': 'oklch(0.64 0.22 80)',
    '600': 'oklch(0.53 0.20 80)',
    '700': 'oklch(0.42 0.17 80)',
    '800': 'oklch(0.33 0.13 80)',
    '900': 'oklch(0.25 0.09 80)',
    '950': 'oklch(0.14 0.06 80)',
  },
  rose: {
    '50': 'oklch(0.97 0.03 15)',
    '100': 'oklch(0.93 0.06 15)',
    '200': 'oklch(0.85 0.13 15)',
    '300': 'oklch(0.75 0.23 15)',
    '400': 'oklch(0.65 0.27 15)',
    '500': 'oklch(0.56 0.28 15)',
    '600': 'oklch(0.46 0.24 15)',
    '700': 'oklch(0.37 0.19 15)',
    '800': 'oklch(0.29 0.13 15)',
    '900': 'oklch(0.22 0.09 15)',
    '950': 'oklch(0.13 0.06 15)',
  },
  blue: {
    '50': 'oklch(0.97 0.03 250)',
    '100': 'oklch(0.92 0.06 250)',
    '200': 'oklch(0.84 0.12 250)',
    '300': 'oklch(0.74 0.20 250)',
    '400': 'oklch(0.63 0.25 250)',
    '500': 'oklch(0.52 0.27 250)',
    '600': 'oklch(0.41 0.24 250)',
    '700': 'oklch(0.33 0.19 250)',
    '800': 'oklch(0.26 0.13 250)',
    '900': 'oklch(0.20 0.09 250)',
    '950': 'oklch(0.12 0.06 250)',
  },
  purple: {
    '50': 'oklch(0.97 0.03 300)',
    '100': 'oklch(0.93 0.06 300)',
    '200': 'oklch(0.85 0.12 300)',
    '300': 'oklch(0.76 0.20 300)',
    '400': 'oklch(0.65 0.25 300)',
    '500': 'oklch(0.54 0.27 300)',
    '600': 'oklch(0.43 0.24 300)',
    '700': 'oklch(0.34 0.19 300)',
    '800': 'oklch(0.27 0.13 300)',
    '900': 'oklch(0.21 0.09 300)',
    '950': 'oklch(0.12 0.06 300)',
  },
  zinc: {
    '50': 'oklch(0.98 0 0)',
    '100': 'oklch(0.95 0 0)',
    '200': 'oklch(0.89 0 0)',
    '300': 'oklch(0.81 0 0)',
    '400': 'oklch(0.72 0 0)',
    '500': 'oklch(0.62 0 0)',
    '600': 'oklch(0.51 0 0)',
    '700': 'oklch(0.40 0 0)',
    '800': 'oklch(0.30 0 0)',
    '900': 'oklch(0.20 0 0)',
    '950': 'oklch(0.10 0 0)',
  },
};

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { themeMode, brandColor } = useBranding();

  useEffect(() => {
    // Apply theme class to HTML element
    const html = document.documentElement;
    if (themeMode === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    const palette = PALETTES[brandColor];
    if (!palette) return;

    let css = ':root, .dark {\n';
    Object.entries(palette).forEach(([shade, value]) => {
      let finalValue = value;
      if (themeMode === 'light') {
        // Shift light shades to dark shades to ensure beautiful contrast on light backgrounds
        if (shade === '400') finalValue = palette['600'];
        if (shade === '300') finalValue = palette['500'];
        if (shade === '500') finalValue = palette['700'];
      }
      css += `  --color-emerald-${shade}: ${finalValue} !important;\n`;
    });
    
    // Also override standard Tailwind v4 primary classes
    const primaryValue = themeMode === 'dark' ? palette['500'] : palette['600'];
    const primaryForegroundValue = (brandColor === 'zinc' && themeMode === 'dark')
      ? 'oklch(0.205 0 0)'
      : 'oklch(0.985 0 0)';
    css += `  --primary: ${primaryValue} !important;\n`;
    css += `  --primary-foreground: ${primaryForegroundValue} !important;\n`;
    css += '}\n';

    let styleEl = document.getElementById('branding-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'branding-style';
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = css;
  }, [brandColor, themeMode]);

  return <>{children}</>;
}
