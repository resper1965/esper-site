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
  /** Identificador estável. A lista passou a ter duas viagens no mesmo ano,
   *  e o ano deixou de servir como chave. */
  id: string;
  /** Ano de realização. */
  year: number;
  /** Mês, quando conhecido — ordena duas viagens do mesmo ano. */
  month?: number;
  name: { 'pt-BR': string; en: string };
  where: { 'pt-BR': string; en: string };
  /** Uma linha — o que a travessia é, não o que ela significou. */
  note: { 'pt-BR': string; en: string };
  /** Com quem. É o que separa biografia de itinerário. */
  companion?: string;
  /** Post do blog sobre esta viagem, quando existe. */
  relatedPostSlug?: string;
}

export const journeys: Journey[] = [
  {
    id: 'caminho-de-santiago-2003',
    year: 2003,
    name: { 'pt-BR': 'Caminho de Santiago', en: 'Camino de Santiago' },
    where: { 'pt-BR': 'Espanha', en: 'Spain' },
    note: {
      'pt-BR': 'A peregrinação a Santiago de Compostela, a pé.',
      en: 'The pilgrimage to Santiago de Compostela, on foot.',
    },
  },
  {
    id: 'everest-base-camp-2017',
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
  {
    id: 'machu-picchu-2026',
    year: 2026,
    month: 7,
    name: {
      'pt-BR': 'Machu Picchu, a partir de Cusco',
      en: 'Machu Picchu, from Cusco',
    },
    where: { 'pt-BR': 'Peru', en: 'Peru' },
    note: {
      'pt-BR':
        'Sete dias nos Andes peruanos, com base em Cusco — a antiga capital inca, a 3.400 metros.',
      en: 'Seven days in the Peruvian Andes, based in Cusco — the old Inca capital, at 3,400 metres.',
    },
    companion: 'Giovanna',
  },
  {
    id: 'lencois-maranhenses-2026',
    year: 2026,
    month: 9,
    name: {
      'pt-BR': 'Lençóis Maranhenses, por Santo Amaro',
      en: 'Lençóis Maranhenses, via Santo Amaro',
    },
    where: { 'pt-BR': 'Maranhão, Brasil', en: 'Maranhão, Brazil' },
    note: {
      'pt-BR':
        'Quatro circuitos de dunas e lagoas — e um céu sem luz de cidade em raio nenhum.',
      en: 'Four circuits of dunes and lagoons — and a sky with no city light for miles.',
    },
    companion: 'Sabrina',
    relatedPostSlug: 'lencois-maranhenses-santo-amaro',
  },
];

/** Em ordem cronológica. */
export function journeyTimeline(): Journey[] {
  return [...journeys].sort(
    (a, b) => a.year - b.year || (a.month ?? 0) - (b.month ?? 0)
  );
}

/**
 * Resumo em uma frase, para bios e para o `description` do schema Person.
 * Sai daqui para não divergir da contagem em `site.ts`.
 */
export function travelSummary(lang: 'pt-BR' | 'en' = 'pt-BR'): string {
  // Derivado da lista, não escrito à mão. A versão anterior citava Santiago e
  // o Everest em prosa fixa: acrescentar uma viagem deixava o resumo mentindo
  // por omissão, em silêncio, que é como quase todo fato deste site envelheceu
  // errado antes de virar dado.
  const itens = journeyTimeline().map(
    (j) => `${j.name[lang]} (${j.year})`
  );
  const lista =
    itens.length > 1
      ? `${itens.slice(0, -1).join(', ')} ${lang === 'pt-BR' ? 'e' : 'and'} ${itens[itens.length - 1]}`
      : itens[0] ?? '';
  return lang === 'pt-BR'
    ? `Conhece ${COUNTRIES_VISITED} países. Entre as viagens que marcaram: ${lista}.`
    : `Has visited ${COUNTRIES_VISITED} countries. Among the journeys that stayed: ${lista}.`;
}
