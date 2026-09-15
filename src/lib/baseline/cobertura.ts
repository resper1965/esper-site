/**
 * Quanto de uma fonte já carrega os fatos que ela deveria carregar.
 *
 * A marcação é removida antes da busca. Sem isso, um termo casaria dentro de
 * href, class ou comentário — e a fonte apareceria como tendo um fato que
 * nenhum leitor, humano ou robô, encontraria no texto.
 */

import { fatosPresentes } from './fatos';
import type { ConjuntoFatos } from './fatos';
import type { Alcance, Fonte } from './fontes';

export interface CoberturaFonte {
  id: string;
  url: string;
  alcance: Alcance;
  controle: string;
  esperados: string[];
  presentes: string[];
  ausentes: string[];
  cobertura: number;
}

/** Tira script, style e tags, deixando o texto que alguém de fato lê. */
export const textoVisivel = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ');

export function calcularCobertura(
  fonte: Fonte,
  html: string,
  fatos: ConjuntoFatos,
): CoberturaFonte {
  if (fonte.esperados.length === 0) {
    throw new Error(`fonte ${fonte.id}: esperados vazio, não há como calcular cobertura`);
  }

  const noTexto = new Set(fatosPresentes(textoVisivel(html), fatos));

  const presentes = fonte.esperados.filter((id) => noTexto.has(id));
  const ausentes = fonte.esperados.filter((id) => !noTexto.has(id));

  return {
    id: fonte.id,
    url: fonte.url,
    alcance: fonte.alcance,
    controle: fonte.controle,
    esperados: fonte.esperados,
    presentes,
    ausentes,
    cobertura: presentes.length / fonte.esperados.length,
  };
}
