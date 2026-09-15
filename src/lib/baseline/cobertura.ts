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
  caracteres: number;
}

/**
 * Texto que alguém — pessoa ou rastreador — de fato lê.
 *
 * `<script>` sai, com uma exceção deliberada: JSON-LD fica. Dado estruturado é
 * afirmação sobre a entidade em forma legível por máquina, e é o que buscador e
 * modelo consomem. Descartá-lo fez a primeira medição real reportar como
 * ausente o emissor e o número do certificado, que estavam na página o tempo
 * todo.
 */
export const textoVisivel = (html: string): string => {
  const ld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1])
    .join(' ');

  const corpo = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ');

  return `${corpo} ${ld}`.replace(/\s+/g, ' ');
};

export function calcularCobertura(
  fonte: Fonte,
  html: string,
  fatos: ConjuntoFatos,
): CoberturaFonte {
  if (fonte.esperados.length === 0) {
    throw new Error(`fonte ${fonte.id}: esperados vazio, não há como calcular cobertura`);
  }

  // Quantidade de texto que sustentou a medição. Uma página que renderiza do
  // lado do cliente pode chegar com 1,1 MB de HTML e reduzir a pouco mais de
  // 200 caracteres visíveis (foi o caso do YouTube na primeira medição real) —
  // sem esse número, uma cobertura baixa parece falta de conteúdo quando na
  // verdade é falta de HTML estático para medir.
  const texto = textoVisivel(html);
  const noTexto = new Set(fatosPresentes(texto, fatos));

  const presentes = fonte.esperados.filter((id) => noTexto.has(id));
  const ausentes = fonte.esperados.filter((id) => !noTexto.has(id));

  return {
    id: fonte.id,
    url: fonte.url,
    alcance: fonte.alcance,
    controle: fonte.controle,
    esperados: fonte.esperados,
    caracteres: texto.length,
    presentes,
    ausentes,
    cobertura: presentes.length / fonte.esperados.length,
  };
}
