/**
 * Lê a exportação CSV mais recente em orm/baseline/busca/ e grava a metade de
 * busca do snapshot — o caminho padrão, porque não exige cliente OAuth.
 *
 * `scripts/baseline-gsc.ts` continua sendo a alternativa automatizada. Os dois
 * gravam arquivos de nome diferente (`-busca-csv.json` e `-busca.json`) de
 * propósito: se um dia rodarem no mesmo dia, nenhum apaga a medição do outro.
 *
 * Se não houver exportação, grava `naoMedido` com o motivo — e não zero. Uma
 * rodada sem exportação não tem zero impressão: não tem medição de busca.
 *
 * Nenhuma credencial: é leitura de arquivo.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseBuscaCsv } from '../src/lib/baseline/busca-csv';
import { validarConsultas, GRUPOS } from '../src/lib/baseline/consultas';
import { naoMedido } from '../src/lib/baseline/snapshot';
import type { LinhaBusca, Medido } from '../src/lib/baseline/snapshot';
import { montarLinhasBusca, type LinhaApi } from '../src/lib/baseline/busca';

const RAIZ = join(__dirname, '..');
const ORIGEM = join(RAIZ, 'orm/baseline/busca');

function main(): void {
  const hoje = new Date().toISOString().slice(0, 10);
  const destino = join(RAIZ, 'orm/baseline/snapshots');
  const arquivo = join(destino, `${hoje}-busca-csv.json`);

  // Antes de ler e converter qualquer coisa, como já fazem a sonda e o coletor
  // de GSC. A flag 'wx' lá embaixo continua sendo a rede de segurança — esta
  // checagem não substitui, antecipa.
  if (existsSync(arquivo)) {
    throw new Error(`já existe snapshot de hoje em ${arquivo} — renomeie ou mova antes de rodar de novo`);
  }

  const csvs = existsSync(ORIGEM)
    ? readdirSync(ORIGEM)
        .filter((f) => f.endsWith('.csv'))
        .sort()
    : [];
  const origem = csvs[csvs.length - 1] ?? null;

  let busca: Medido<LinhaBusca[]>;
  let idioma: string | null = null;
  let dentro = 0;
  let fora = 0;

  if (!origem) {
    busca = naoMedido('nenhuma exportação CSV em orm/baseline/busca/ — ver o README de lá');
  } else {
    const conjunto = validarConsultas(
      JSON.parse(readFileSync(join(RAIZ, 'orm/baseline/consultas.json'), 'utf8')),
    );
    // Grupo de cada consulta, para o snapshot dizer o que está medindo.
    const grupoDe = new Map<string, string>();
    for (const g of GRUPOS) for (const c of conjunto.grupos[g]) grupoDe.set(c, g);

    const lido = parseBuscaCsv(readFileSync(join(ORIGEM, origem), 'utf8'));
    idioma = lido.idioma;

    // A conversão para o formato da API existe para reaproveitar
    // `montarLinhasBusca` inteira: agrupamento, rótulo `fora_do_conjunto` e
    // posição nula para consulta ausente ficam idênticos aos do caminho de API.
    // O CTR é o único ajuste: a exportação já traz porcentagem ("5,26%" → 5.26)
    // e `montarLinhasBusca` multiplica por 100 porque a API devolve fração.
    // Dividir aqui faz a fração que ela espera.
    const linhas: LinhaApi[] = lido.linhas.map((l) => ({
      keys: [l.consulta],
      clicks: l.cliques,
      impressions: l.impressoes,
      ctr: l.ctr / 100,
      position: l.posicao,
    }));

    const { doConjunto, foraDoConjunto } = montarLinhasBusca(linhas, grupoDe);
    busca = { medido: true, valor: [...doConjunto, ...foraDoConjunto.slice(0, 50)] };
    dentro = doConjunto.length;
    fora = foraDoConjunto.length;
  }

  mkdirSync(destino, { recursive: true });

  // 'wx' falha se o arquivo existe: snapshot não se sobrescreve, o histórico
  // é o produto.
  try {
    writeFileSync(
      arquivo,
      JSON.stringify({ versao: 1, data: hoje, origem, idioma, busca }, null, 2) + '\n',
      { flag: 'wx' },
    );
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error(`já existe snapshot de hoje em ${arquivo} — renomeie ou mova antes de rodar de novo`);
    }
    throw e;
  }

  console.log(
    busca.medido
      ? `gravado ${hoje}-busca-csv.json — ${dentro} do conjunto, ${fora} fora (idioma ${idioma}, origem ${origem})`
      : `gravado ${hoje}-busca-csv.json — não medido: ${busca.motivo}`,
  );
}

try {
  main();
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
