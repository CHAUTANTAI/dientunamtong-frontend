export const locales = ['en', 'vi'] as const;
export const defaultLocale = 'en' as const;
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export type Locale = (typeof locales)[number];
