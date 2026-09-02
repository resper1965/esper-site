/**
 * Obras publicadas em que ele colaborou.
 *
 * Terceira categoria, e a de natureza mais durável das três:
 *
 *   talks.ts        → ele foi convidado a falar
 *   appearances.ts  → alguém resolveu falar com ele
 *   works.ts        → o nome dele está impresso numa obra de terceiro
 *
 * Um prefácio é escolha do autor: ele decidiu que aquele nome dá lastro ao
 * livro dele. Diferente de um evento, que passa, um livro tem ISBN, entra em
 * catálogo de biblioteca e continua sendo citável dez anos depois. Para
 * notabilidade, obra publicada é a moeda mais forte que existe aqui.
 *
 * O papel importa e é declarado: prefaciar não é escrever. Confundir os dois
 * seria atribuir a ele a autoria de um livro que não é dele.
 */

export interface Work {
  id: string;
  /** Título como impresso. */
  title: string;
  /** Autor da obra — não é ele, salvo quando `role` disser o contrário. */
  author: string;
  /** O que ele fez: prefácio, capítulo, revisão técnica. */
  role: { 'pt-BR': string; en: string };
  publisher?: string;
  /** Ano de publicação. Ausente quando não confirmado. */
  year?: number;
  isbn?: string;
  /** Página da obra na editora ou em livraria, quando conhecida. */
  url?: string;
  /** Em que condição ele assina — a organização citada na obra. */
  attributedTo?: string;
  note?: { 'pt-BR': string; en: string };
}

export const works: Work[] = [
  {
    id: 'contrainteligencia-4-0',
    title: 'CONTRA&INTELIGÊNCIA 4.0',
    author: 'Luis Fernando Baptistella',
    role: { 'pt-BR': 'Prefácio', en: 'Foreword' },
    publisher: 'Literare Books International',
    // Sem ano, ISBN nem URL: o registro vem do post público do autor
    // agradecendo o prefácio, que não traz esses dados. Confirmá-los é
    // trabalho de um minuto para quem tem o livro na mão — e inventá-los
    // seria pior que deixá-los de fora.
    attributedTo: 'Infinity Safe',
    note: {
      'pt-BR':
        'Livro sobre contrainteligência aplicada a geopolítica, relações internacionais e segurança corporativa.',
      en: 'A book on counterintelligence applied to geopolitics, international relations and corporate security.',
    },
  },
];

/** Mais recentes primeiro; as sem ano vão para o fim. */
export function worksByYear(): Work[] {
  const comAno = works.filter((w) => w.year !== undefined);
  const semAno = works.filter((w) => w.year === undefined);
  comAno.sort((a, b) => b.year! - a.year!);
  return [...comAno, ...semAno];
}
