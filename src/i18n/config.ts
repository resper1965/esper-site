export const i18n = {
  defaultLocale: 'pt-BR',
  locales: ['pt-BR', 'en'],
} as const;

export type Locale = (typeof i18n)['locales'][number];
