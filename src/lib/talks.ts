/**
 * Palestras e aulas — fonte única.
 *
 * Isto existe por um motivo específico: quase tudo que o site afirma sobre o
 * Ricardo é autodeclaração. Certificações, anos de experiência, empresas
 * fundadas — tudo verdade, tudo dito por ele mesmo. Um convite de terceiro
 * é de outra natureza: uma instituição colocou o nome dele num programa, com
 * data e assunto. Isso um buscador e um modelo tratam como sinal, não como
 * afirmação.
 *
 * Regra de entrada: só o que existe. Um evento anunciado publicamente pela
 * organização, com data. Nada de "já palestrei em vários lugares" — isso é
 * autodeclaração outra vez, com aparência de prova.
 */

export interface Talk {
  /** Identificador estável, usado no `@id` do schema Event. */
  id: string;
  title: { 'pt-BR': string; en: string };
  /** Programa, curso ou trilha em que a aula se insere, quando houver. */
  program?: { 'pt-BR': string; en: string };
  /** Quem convidou — a parte que dá o valor de terceiro. */
  host: { name: string; url?: string };
  /** ISO 8601 com fuso. O schema.org quer offset explícito. */
  startDate: string;
  /** Online, ou o lugar. */
  mode: 'online' | 'presencial';
  location?: string;
  /** Onde se inscrever, quando público. */
  url?: string;
  /** O que a aula cobre — vira `description` no schema. */
  summary: { 'pt-BR': string; en: string };
  /** Post do blog que desenvolve o tema, quando existir. */
  relatedPostSlug?: string;
}

export const talks: Talk[] = [
  {
    id: 'ibdee-cco-2026',
    title: {
      'pt-BR': 'Novas tecnologias aplicadas à prevenção, detecção de fraudes e investigações',
      en: 'New technologies applied to fraud prevention, detection and investigations',
    },
    program: {
      'pt-BR': 'Curso de Formação de CCO',
      en: 'Chief Compliance Officer certification course',
    },
    host: {
      name: 'Instituto Brasileiro de Direito e Ética Empresarial (IBDEE)',
      url: 'https://ibdee.org.br',
    },
    startDate: '2026-09-10T19:00:00-03:00',
    mode: 'online',
    url: 'https://ibdee.org.br',
    summary: {
      'pt-BR':
        'O que já se usa hoje para apurar fraude, o que a inteligência artificial entrega — e o que ela quebra — e as primeiras 48 horas de uma investigação interna.',
      en: 'What is already used to investigate fraud, what artificial intelligence delivers — and what it breaks — and the first 48 hours of an internal investigation.',
    },
    relatedPostSlug: 'ninguem-escreve-propina',
  },
];

/** Mais recente primeiro. */
export function talksByDate(): Talk[] {
  return [...talks].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/** Ainda por acontecer, na ordem em que acontecem. */
export function upcomingTalks(now: Date = new Date()): Talk[] {
  return talks
    .filter((t) => new Date(t.startDate) >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** Já aconteceram, mais recente primeiro. */
export function pastTalks(now: Date = new Date()): Talk[] {
  return talks
    .filter((t) => new Date(t.startDate) < now)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}
