import 'server-only';
import { yearsOfExperience } from '@/lib/site';

const dictionaries = {
  'pt-BR': () => import('./dictionaries/pt-BR.json').then((module) => module.default),
  en: () => import('./dictionaries/en.json').then((module) => module.default),
};

/**
 * Os dicionários são JSON e não interpolam função, mas afirmam o tempo de
 * experiência em meia dúzia de frases. Escrever o número neles significaria
 * mantê-lo em dois lugares — e foi assim que o site passou a declarar "34
 * anos" numa página e "três décadas" na outra.
 *
 * O marcador {{years}} é resolvido aqui, no único ponto por onde todo
 * dicionário passa.
 */
function resolvePlaceholders<T>(value: T): T {
  const years = String(yearsOfExperience());

  if (typeof value === 'string') {
    return value.replaceAll('{{years}}', years) as T;
  }
  if (Array.isArray(value)) {
    return value.map(resolvePlaceholders) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, resolvePlaceholders(v)])
    ) as T;
  }
  return value;
}

export const getDictionary = async (locale: 'pt-BR' | 'en') =>
  resolvePlaceholders(await dictionaries[locale]());
