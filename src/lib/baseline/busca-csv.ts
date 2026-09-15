/**
 * Lê a exportação CSV do relatório de Desempenho do Search Console, aba de
 * consultas.
 *
 * Existe porque exportar à mão não exige cliente OAuth. `scripts/baseline-gsc.ts`
 * continua sendo o caminho automatizado, para quem tiver credencial.
 *
 * AVISO: as grafias de cabeçalho abaixo são SUPOSIÇÃO — não foram conferidas
 * contra uma exportação real. É por isso que a falta de coluna lança um erro
 * que imprime os cabeçalhos encontrados ao lado dos procurados: na primeira
 * exportação de verdade, o erro entrega o texto exato para colar aqui, e a
 * correção é uma linha.
 */

import { campos } from './csv';
import { parseNumero, parseContagem, type Idioma } from './numero';

export interface BuscaCsv {
  idioma: Idioma;
  linhas: Array<{ consulta: string; cliques: number; impressoes: number; ctr: number; posicao: number }>;
}

type Coluna = 'consulta' | 'cliques' | 'impressoes' | 'ctr' | 'posicao';

/**
 * Grafia conhecida de cada coluna e o idioma que ela denuncia. `null` em
 * `idioma` é grafia neutra: "CTR" é igual nos dois e não informa nada.
 */
const CABECALHOS: Record<Coluna, Array<{ texto: string; idioma: Idioma | null }>> = {
  consulta: [
    { texto: 'Consultas principais', idioma: 'pt' },
    { texto: 'Consulta', idioma: 'pt' },
    { texto: 'Top queries', idioma: 'en' },
    { texto: 'Query', idioma: 'en' },
  ],
  cliques: [
    { texto: 'Cliques', idioma: 'pt' },
    { texto: 'Clicks', idioma: 'en' },
  ],
  impressoes: [
    { texto: 'Impressões', idioma: 'pt' },
    { texto: 'Impressoes', idioma: 'pt' },
    { texto: 'Impressions', idioma: 'en' },
  ],
  ctr: [{ texto: 'CTR', idioma: null }],
  posicao: [
    { texto: 'Posição', idioma: 'pt' },
    { texto: 'Posicao', idioma: 'pt' },
    { texto: 'Position', idioma: 'en' },
  ],
};

const ORDEM: Coluna[] = ['consulta', 'cliques', 'impressoes', 'ctr', 'posicao'];

/** BOM fora, espaço fora, caixa irrelevante. */
const normalizar = (s: string): string => s.replace(/^﻿/, '').trim().toLowerCase();

export function parseBuscaCsv(csv: string): BuscaCsv {
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length === 0) throw new Error('arquivo vazio');

  const cabecalho = campos(linhas[0]);
  const normalizados = cabecalho.map(normalizar);

  const achado = {} as Record<Coluna, { indice: number; idioma: Idioma | null }>;
  const faltando: Coluna[] = [];
  for (const coluna of ORDEM) {
    const grafia = CABECALHOS[coluna].find((g) => normalizados.includes(normalizar(g.texto)));
    if (!grafia) {
      faltando.push(coluna);
      continue;
    }
    achado[coluna] = { indice: normalizados.indexOf(normalizar(grafia.texto)), idioma: grafia.idioma };
  }

  if (faltando.length) {
    // Este texto é o conserto: quem rodar contra uma exportação real vê o
    // cabeçalho verdadeiro e o copia para CABECALHOS.
    const procurado = faltando
      .map((c) => `${c}: ${CABECALHOS[c].map((g) => `"${g.texto}"`).join(', ')}`)
      .join('; ');
    throw new Error(
      `coluna não encontrada no cabeçalho da exportação: ${faltando.join(', ')}. ` +
        `Cabeçalhos presentes no arquivo: ${cabecalho.map((h) => `"${h.trim()}"`).join(', ')}. ` +
        `Grafias procuradas — ${procurado}. ` +
        'As grafias são suposição: acrescente a que aparece acima em src/lib/baseline/busca-csv.ts.',
    );
  }

  // O idioma sai do cabeçalho, nunca da forma dos números — é a diferença
  // entre ler "1.234" como mil duzentos e trinta e quatro ou como um vírgula
  // duzentos e trinta e quatro. Empate cai em pt, que é o idioma da conta.
  const votos = (['consulta', 'cliques', 'impressoes'] as const)
    .map((c) => achado[c].idioma)
    .filter((i): i is Idioma => i !== null);
  const idioma: Idioma = votos.filter((v) => v === 'en').length > votos.filter((v) => v === 'pt').length ? 'en' : 'pt';

  const linhasLidas = linhas.slice(1).map((linha) => {
    const partes = campos(linha);
    if (partes.length !== cabecalho.length) {
      throw new Error(`linha com ${partes.length} campos, esperado ${cabecalho.length}: "${linha}"`);
    }
    const consulta = partes[achado.consulta.indice];
    const numero = <T>(coluna: Coluna, ler: (bruto: string) => T): T => {
      try {
        return ler(partes[achado[coluna].indice]);
      } catch (e) {
        throw new Error(`coluna "${coluna}" da consulta "${consulta}": ${e instanceof Error ? e.message : e}`);
      }
    };
    return {
      consulta,
      cliques: numero('cliques', (b) => parseContagem(b, idioma)),
      impressoes: numero('impressoes', (b) => parseContagem(b, idioma)),
      // CTR já vem em porcentagem na exportação ("5,26%"), não na fração que a
      // API devolve. Fica em porcentagem aqui.
      ctr: numero('ctr', (b) => parseNumero(b, idioma)),
      posicao: numero('posicao', (b) => parseNumero(b, idioma)),
    };
  });

  return { idioma, linhas: linhasLidas };
}
