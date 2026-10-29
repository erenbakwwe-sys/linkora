'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, Locale, defaultLocale, interpolate } from '@linkora/i18n';

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (p) => p,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('de');

  useEffect(() => {
    const saved = localStorage.getItem('linkora_locale') as Locale;
    if (saved && (saved === 'de' || saved === 'tr' || saved === 'en')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('linkora_locale', l);
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[locale] || dictionaries.de;
    const parts = path.split('.');
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return path;
      }
    }

    if (typeof current === 'string') {
      return params ? interpolate(current, params) : current;
    }

    return path;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
