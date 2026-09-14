/**
 * Converte as linhas da API do Search Console em LinhaBusca, e completa o
 * conjunto com as consultas que não voltaram.
 *
 * Mora aqui, e não em `scripts/`, porque é lógica pura: `scripts/` está fora
 * do `include` do Vitest e nada ali é testado. A ausência de rank de uma
 * consulta sem impressão é justamente o ponto que precisa de teste.
 */

import type { LinhaBusca } from './snapshot';

export interface LinhaApi {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export function montarLinhasBusca(
  linhas: LinhaApi[],
  grupoDe: Map<string, string>,
): { doConjunto: LinhaBusca[]; foraDoConjunto: LinhaBusca[] } {
  const doConjunto: LinhaBusca[] = [];
  const foraDoConjunto: LinhaBusca[] = [];

  for (const linha of linhas) {
    const consulta = linha.keys[0];
    const grupo = grupoDe.get(consulta);
    const registro: LinhaBusca = {
      consulta,
      grupo: grupo ?? 'fora_do_conjunto',
      impressoes: linha.impressions,
      cliques: linha.clicks,
      posicao: Number(linha.position.toFixed(2)),
      ctr: Number((linha.ctr * 100).toFixed(2)),
    };
    (grupo ? doConjunto : foraDoConjunto).push(registro);
  }

  // Consulta do conjunto que não voltou: impressão e clique são zero de
  // verdade, mas posição e CTR não existem. Zero em `posicao` seria rank 0,
  // melhor que o primeiro lugar — número inventado que contamina média.
  for (const [consulta, grupo] of grupoDe) {
    if (!doConjunto.some((l) => l.consulta === consulta)) {
      doConjunto.push({ consulta, grupo, impressoes: 0, cliques: 0, posicao: null, ctr: null });
    }
  }

  foraDoConjunto.sort((a, b) => b.impressoes - a.impressoes);
  return { doConjunto, foraDoConjunto };
}
