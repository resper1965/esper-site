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
  posicao: number;
  ctr: number;
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
  citou: number;
  mencionou: number;
  homonimo: number;
}

export interface Snapshot {
  versao: number;
  data: string;
  busca: Medido<LinhaBusca[]>;
  links: Medido<LinhaLink[]>;
  modelos: Medido<ResultadoSonda[]>;
  rastreio: Medido<LinhaRastreio[]>;
}

export const resumirCitacoes = (
  prompt: string,
  modelo: string,
  citacoes: Citacao[],
): ResultadoSonda => ({
  prompt,
  modelo,
  execucoes: citacoes.length,
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
  ['chave OpenAI', /\bsk-[0-9A-Za-z_-]{20,}/],
  ['chave Anthropic', /\bsk-ant-[0-9A-Za-z_-]{20,}/],
  ['refresh token', /"refresh_token"\s*:\s*"[^"]+"/],
  ['client secret', /"client_secret"\s*:\s*"[^"]+"/],
  ['chave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

export function encontrarSegredos(texto: string): string[] {
  return PADROES.filter(([, re]) => re.test(texto)).map(([nome]) => nome);
}
