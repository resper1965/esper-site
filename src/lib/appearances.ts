/**
 * Aparições — quando outra pessoa resolve falar com ele.
 *
 * Separado de `talks.ts` de propósito, e a distinção não é cosmética:
 *
 *   palestra  → ele ensina. Foi convidado a entregar conteúdo.
 *   aparição  → ele é o assunto. Alguém achou que valia a pena ouvi-lo.
 *
 * No schema.org isso também muda de lugar: numa palestra ele é `performer`
 * de um `Event`; numa entrevista ele é `about` de um `VideoObject`. Para
 * efeito de notabilidade — o critério que o Wikidata usa — a segunda pesa
 * mais, porque a iniciativa foi de terceiro.
 *
 * Regra de entrada, igual à de `talks.ts`: só o que existe e está público.
 * E aqui vale registrar de quem é o veículo, porque é isso que dá o valor:
 * uma aparição num canal próprio é autopublicação com outro nome.
 */

export interface Appearance {
  id: string;
  title: { 'pt-BR': string; en: string };
  /** Veículo. `independent: false` significa canal do próprio Ricardo. */
  outlet: { name: string; url?: string; independent: boolean };
  /** Programa ou série, quando faz parte de uma. */
  series?: string;
  /** URL pública do episódio. */
  url: string;
  /** ISO 8601. Ausente quando não foi possível confirmar — nunca chutada. */
  publishedDate?: string;
  format: 'podcast' | 'video' | 'artigo' | 'entrevista';
  summary: { 'pt-BR': string; en: string };
}

export const appearances: Appearance[] = [
  {
    id: 'cdmv-s02e20-viagens',
    title: {
      'pt-BR': 'Viagens Extraordinárias com Ricardo Esper',
      en: 'Extraordinary Journeys with Ricardo Esper',
    },
    outlet: {
      name: 'Como Dizia Minha Vó',
      url: 'https://www.youtube.com/@ComoDiziaMinhaVo',
      independent: true,
    },
    series: 'Como Dizia Minha Vó — S02E20',
    url: 'https://www.youtube.com/watch?v=_lxzla9ZS6I',
    publishedDate: '2021-11-23',
    format: 'podcast',
    summary: {
      'pt-BR':
        'Conversa ao vivo sobre as viagens — os países, as travessias e o que se aprende fora do escritório.',
      en: 'A live conversation about travelling — the countries, the long walks, and what you learn away from the office.',
    },
  },
  {
    id: 'cdmv-s02e18',
    title: {
      'pt-BR': 'Ricardo Esper no Como Dizia Minha Vó',
      en: 'Ricardo Esper on Como Dizia Minha Vó',
    },
    outlet: {
      name: 'Como Dizia Minha Vó',
      url: 'https://www.youtube.com/@ComoDiziaMinhaVo',
      independent: true,
    },
    series: 'Como Dizia Minha Vó — S02E18',
    url: 'https://www.youtube.com/watch?v=QS84NI-NNRQ',
    // Sem data: não consegui confirmar a de publicação, e uma data
    // inventada num schema é pior que um campo ausente.
    format: 'podcast',
    summary: {
      'pt-BR': 'Episódio do podcast Como Dizia Minha Vó com Ricardo Esper.',
      en: 'An episode of the Como Dizia Minha Vó podcast with Ricardo Esper.',
    },
  },
];

/** Mais recentes primeiro; as sem data vão para o fim. */
export function appearancesByDate(): Appearance[] {
  const comData = appearances.filter((a) => a.publishedDate);
  const semData = appearances.filter((a) => !a.publishedDate);
  comData.sort((a, b) => b.publishedDate!.localeCompare(a.publishedDate!));
  return [...comData, ...semData];
}

/** Só as de veículo independente — as que valem como fonte de terceiro. */
export function independentAppearances(): Appearance[] {
  return appearances.filter((a) => a.outlet.independent);
}
