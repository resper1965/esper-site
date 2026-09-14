/**
 * Lê a exportação CSV mais recente em orm/baseline/links/ e grava a metade de
 * links do snapshot.
 *
 * Se não houver exportação, grava `naoMedido` com o motivo — e não zero. Uma
 * rodada sem exportação não tem zero link: não tem medição de link.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseLinksCsv } from '../src/lib/baseline/links-csv';
import { naoMedido } from '../src/lib/baseline/snapshot';
import type { LinhaLink, Medido } from '../src/lib/baseline/snapshot';

const RAIZ = join(__dirname, '..');
const ORIGEM = join(RAIZ, 'orm/baseline/links');

function main(): void {
  const csvs = readdirSync(ORIGEM)
    .filter((f) => f.endsWith('.csv'))
    .sort();

  const links: Medido<LinhaLink[]> = csvs.length
    ? { medido: true, valor: parseLinksCsv(readFileSync(join(ORIGEM, csvs[csvs.length - 1]), 'utf8')) }
    : naoMedido('nenhuma exportação CSV em orm/baseline/links/ — ver o README de lá');

  const hoje = new Date().toISOString().slice(0, 10);
  const destino = join(RAIZ, 'orm/baseline/snapshots');
  mkdirSync(destino, { recursive: true });
  writeFileSync(
    join(destino, `${hoje}-links.json`),
    JSON.stringify({ versao: 1, data: hoje, origem: csvs[csvs.length - 1] ?? null, links }, null, 2) + '\n',
  );

  console.log(
    links.medido
      ? `gravado ${hoje}-links.json — ${links.valor.length} domínios`
      : `gravado ${hoje}-links.json — não medido: ${links.motivo}`,
  );
}

main();
