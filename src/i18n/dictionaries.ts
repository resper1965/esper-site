import 'server-only';
import { yearsOfExperience, yearsInSecurity } from '@/lib/site';

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
 * Os marcadores são resolvidos aqui, no único ponto por onde todo dicionário
 * passa.
 *
 * {{years}} é o tempo em segurança da informação (desde a ness, em 1991),
 * porque é isso que essas frases afirmam — "dedicados à segurança da
 * informação", "na linha de frente da segurança digital". Usar o número de
 * tecnologia aqui faria o site contradizer o material que o próprio Ricardo
 * distribui. Para o recorte mais amplo existe {{techYears}}.
 */
function resolvePlaceholders<T>(value: T): T {
  const years = String(yearsInSecurity());
  const techYears = String(yearsOfExperience());

  if (typeof value === 'string') {
    return value
      .replaceAll('{{years}}', years)
      .replaceAll('{{techYears}}', techYears) as T;
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
