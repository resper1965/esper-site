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
import type { Medido } from './snapshot';

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

/** Uma linha por fonte tentada: medida, ou declaradamente não medida. */
export type LinhaIdentidade =
  | CoberturaFonte
  | { id: string; url: string; medido: false; motivo: string };

/**
 * Forma do snapshot de identidade.
 *
 * Existe pelo mesmo motivo que `Snapshot`: um arquivo cuja única função é
 * comparação mês a mês precisa de algo afirmando que a forma continua
 * comparável. `identidade` traz uma linha por fonte TENTADA — nunca só as que
 * responderam, ou uma média futura sobre a lista seria média de sobreviventes.
 */
export interface SnapshotIdentidade {
  versao: number;
  data: string;
  fatosVersao: number;
  fontesVersao: number;
  tentadas: number;
  identidade: Medido<LinhaIdentidade[]>;
  falhas: Array<{ id: string; url: string; erro: string }>;
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
    // Comentário sai inteiro, ANTES do descarte de marcação. O descarte
    // genérico para no primeiro `>`, então um `>` literal dentro do comentário
    // deixava o resto dele vazar para o texto medido. Mesma coisa com `>`
    // dentro de valor de atributo entre aspas (variante arbitrária do
    // Tailwind, `class="[&>p]:mt-4"`), e por isso o descarte abaixo entende
    // aspas. Os dois vazam PARA DENTRO do texto: os dois inflam a cobertura.
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>"]*(?:"[^"]*"[^>"]*)*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (ld.length === 0) return corpo;

  // Separador maior que a janela de proximidade (300). Com um espaço só, um
  // termo no fim do corpo e outro no início do JSON-LD caíam na mesma janela
  // sendo partes sem relação do documento — proximidade falsa, e no sentido
  // que infla. O colapso de espaço acontece de cada lado antes da junção,
  // justamente para o separador sobreviver.
  return corpo + ' '.repeat(400) + ld.replace(/\s+/g, ' ').trim();
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
