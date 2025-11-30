import 'server-only';

const dictionaries = {
  'pt-BR': () => import('./dictionaries/pt-BR.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: 'pt-BR' | 'en') => dictionaries[locale]();
