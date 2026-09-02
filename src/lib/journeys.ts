import { COUNTRIES_VISITED } from '@/lib/site';

/**
 * Viagens — a parte da biografia que não cabe num currículo.
 *
 * O site declarava "74 países visitados" como número solto, no meio de
 * certificações e empresas fundadas. Sem contexto, um número assim lê como
 * métrica corporativa disfarçada — exatamente o que tiramos quando removemos
 * o "12 países atendidos", que além de inventado tinha moldura de release.
 *
 * Aqui o número ganha o que faltava: duas travessias datadas, que uma pessoa
 * pode confirmar e das quais se lembra. É o que separa biografia de
 * estatística — e, para efeito de entidade, um fato datado e específico vale
 * mais que um agregado redondo.
 */

export interface Journey {
  /** Ano de realização. */
  year: number;
  name: { 'pt-BR': string; en: string };
  where: { 'pt-BR': string; en: string };
  /** Uma linha — o que a travessia é, não o que ela significou. */
  note: { 'pt-BR': string; en: string };
}

export const journeys: Journey[] = [
  {
    year: 2003,
    name: { 'pt-BR': 'Caminho de Santiago', en: 'Camino de Santiago' },
    where: { 'pt-BR': 'Espanha', en: 'Spain' },
    note: {
      'pt-BR': 'A peregrinação a Santiago de Compostela, a pé.',
      en: 'The pilgrimage to Santiago de Compostela, on foot.',
    },
  },
  {
    year: 2017,
    name: {
      'pt-BR': 'Acampamento base do Everest',
      en: 'Everest Base Camp',
    },
    where: { 'pt-BR': 'Nepal', en: 'Nepal' },
    note: {
      'pt-BR': 'Trekking até 5.364 metros, no Himalaia.',
      en: 'Trek to 5,364 metres, in the Himalayas.',
    },
  },
];

/** Em ordem cronológica. */
export function journeyTimeline(): Journey[] {
  return [...journeys].sort((a, b) => a.year - b.year);
}

/**
 * Resumo em uma frase, para bios e para o `description` do schema Person.
 * Sai daqui para não divergir da contagem em `site.ts`.
 */
export function travelSummary(lang: 'pt-BR' | 'en' = 'pt-BR'): string {
  return lang === 'pt-BR'
    ? `Conhece ${COUNTRIES_VISITED} países. Fez o Caminho de Santiago em 2003 e o trekking ao acampamento base do Everest em 2017.`
    : `Has visited ${COUNTRIES_VISITED} countries. Walked the Camino de Santiago in 2003 and trekked to Everest Base Camp in 2017.`;
}
