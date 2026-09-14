/**
 * Forma do snapshot e a trava que impede credencial de vazar para arquivo
 * commitado.
 *
 * `Medido<T>` existe para uma distinção que inverte a leitura do diff se for
 * perdida: "não medido" e "zero" são coisas diferentes. Uma rodada sem a
 * exportação de links não tem zero link — ela não tem medição de link.
 */

import type { Citacao } from './citacao';

export type Medido<T> = { medido: true; valor: T } | { medido: false; motivo: string };

export const naoMedido = (motivo: string): Medido<never> => ({ medido: false, motivo });

export interface LinhaBusca {
  consulta: string;
  grupo: string;
  impressoes: number;
  cliques: number;
  /** null quando a consulta não teve linha na API: sem impressão não há rank. */
  posicao: number | null;
  /** null quando a consulta não teve linha na API: 0/0 é indefinido, não zero. */
  ctr: number | null;
}

export interface LinhaLink {
  dominio: string;
  links: number;
}

export interface LinhaRastreio {
  robo: string;
  requisicoes: number;
}

export interface ResultadoSonda {
  prompt: string;
  modelo: string;
  execucoes: number;
  /** Chamadas que falharam ou voltaram em branco. Não são medição. */
  falhas: number;
  /** Recusas: o modelo citou o nome para dizer que não o conhece. */
  recusas: number;
  /** URLs do site efetivamente citadas, para conferência posterior. */
  urls: string[];
  citou: number;
  mencionou: number;
  homonimo: number;
}

export interface Snapshot {
  versao: number;
  data: string;
  /** Acumulado longo: bom para volume total, cego para o diff mês a mês. */
  buscaHistorico: Medido<LinhaBusca[]>;
  /** Janela fixa de 28 dias terminando no mesmo `fim`: é onde o diff aparece. */
  busca28d: Medido<LinhaBusca[]>;
  links: Medido<LinhaLink[]>;
  modelos: Medido<ResultadoSonda[]>;
  rastreio: Medido<LinhaRastreio[]>;
}

export const resumirCitacoes = (
  prompt: string,
  modelo: string,
  citacoes: Citacao[],
  falhas = 0,
): ResultadoSonda => ({
  prompt,
  modelo,
  execucoes: citacoes.length,
  falhas,
  recusas: citacoes.filter((c) => c.recusou).length,
  urls: [...new Set(citacoes.flatMap((c) => c.urls))],
  citou: citacoes.filter((c) => c.citouSite).length,
  mencionou: citacoes.filter((c) => c.mencionouNome).length,
  homonimo: citacoes.filter((c) => c.confundiuHomonimo).length,
});

/**
 * Padrões de segredo. Cada um casa com a forma da chave, não com a palavra
 * que a nomeia — "token" no meio de uma frase não é vazamento.
 */
const PADROES: Array<[string, RegExp]> = [
  ['chave Google', /\bAIza[0-9A-Za-z_-]{30,}/],
  ['token OAuth Google', /\bya29\.[0-9A-Za-z_-]{20,}/],
  ['token GitHub', /\bgh[pousr]_[0-9A-Za-z]{30,}/],
  ['token GitHub fine-grained', /\bgithub_pat_[0-9A-Za-z_]{20,}/],
  ['chave OpenAI', /\bsk-[0-9A-Za-z_-]{20,}/],
  ['chave Anthropic', /\bsk-ant-[0-9A-Za-z_-]{20,}/],
  // Estes dois casam apenas sintaxe JSON ("nome": "valor"); texto .env sem
  // aspas (NOME=valor) passa sem ser detectado por eles.
  ['refresh token', /"refresh_token"\s*:\s*"[^"]+"/],
  ['client secret', /"client_secret"\s*:\s*"[^"]+"/],
  ['chave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

export function encontrarSegredos(texto: string): string[] {
  return PADROES.filter(([, re]) => re.test(texto)).map(([nome]) => nome);
}
