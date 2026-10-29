import de from './de.json';
import tr from './tr.json';
import en from './en.json';

export const dictionaries = { de, tr, en } as const;
export type Locale = keyof typeof dictionaries;
export const defaultLocale: Locale = 'de';

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale] || dictionaries.de;
}

export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}
