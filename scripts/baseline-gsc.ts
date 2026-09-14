/**
 * Coleta desempenho de busca no Search Console e grava a metade de busca do
 * snapshot.
 *
 * Roda à mão: `npm run baseline:gsc`. Sem agendamento — automatizar cadência
 * antes de existir a segunda medição é adivinhar.
 *
 * Nenhuma credencial mora aqui. Tudo vem do ambiente.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { validarConsultas, GRUPOS } from '../src/lib/baseline/consultas';
import type { LinhaBusca, Medido } from '../src/lib/baseline/snapshot';

const RAIZ = join(__dirname, '..');
const API = 'https://www.googleapis.com/webmasters/v3/sites';

const exigir = (nome: string): string => {
  const v = process.env[nome];
  if (!v) throw new Error(`variável de ambiente ausente: ${nome}`);
  return v;
};

/** Troca o refresh token por um access token. Sem SDK: é um POST. */
async function accessToken(): Promise<string> {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: exigir('GSC_CLIENT_ID'),
      client_secret: exigir('GSC_CLIENT_SECRET'),
      refresh_token: exigir('GSC_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  });
  if (!r.ok) throw new Error(`oauth falhou: ${r.status} ${await r.text()}`);
  return ((await r.json()) as { access_token: string }).access_token;
}

interface LinhaApi {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function consultar(token: string, corpo: Record<string, unknown>): Promise<LinhaApi[]> {
  const site = encodeURIComponent(exigir('GSC_SITE_URL'));
  const r = await fetch(`${API}/${site}/searchAnalytics/query`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(corpo),
  });
  if (!r.ok) throw new Error(`searchAnalytics falhou: ${r.status} ${await r.text()}`);
  return ((await r.json()) as { rows?: LinhaApi[] }).rows ?? [];
}

async function main(): Promise<void> {
  const conjunto = validarConsultas(
    JSON.parse(readFileSync(join(RAIZ, 'orm/baseline/consultas.json'), 'utf8')),
  );

  // Grupo de cada consulta, para o snapshot dizer o que está medindo.
  const grupoDe = new Map<string, string>();
  for (const g of GRUPOS) for (const c of conjunto.grupos[g]) grupoDe.set(c, g);

  const hoje = new Date().toISOString().slice(0, 10);
  // A janela do Search Console atrasa cerca de dois dias; 16 meses é o máximo.
  const fim = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
  const inicio = new Date(Date.now() - 480 * 864e5).toISOString().slice(0, 10);

  const token = await accessToken();

  // 25.000 é o teto por requisição. O site tem 62 URLs; uma página basta.
  const porConsulta = await consultar(token, {
    startDate: inicio,
    endDate: fim,
    dimensions: ['query'],
    rowLimit: 25000,
    type: 'web',
  });

  const doConjunto: LinhaBusca[] = [];
  const foraDoConjunto: LinhaBusca[] = [];

  for (const linha of porConsulta) {
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

  // As consultas do conjunto que não apareceram: impressão zero é resultado,
  // e o mais informativo da primeira medição.
  for (const [consulta, grupo] of grupoDe) {
    if (!doConjunto.some((l) => l.consulta === consulta)) {
      doConjunto.push({ consulta, grupo, impressoes: 0, cliques: 0, posicao: 0, ctr: 0 });
    }
  }

  foraDoConjunto.sort((a, b) => b.impressoes - a.impressoes);

  const busca: Medido<LinhaBusca[]> = {
    medido: true,
    valor: [...doConjunto, ...foraDoConjunto.slice(0, 50)],
  };

  const destino = join(RAIZ, 'orm/baseline/snapshots');
  mkdirSync(destino, { recursive: true });
  writeFileSync(
    join(destino, `${hoje}-busca.json`),
    JSON.stringify({ versao: 1, data: hoje, janela: { inicio, fim }, busca }, null, 2) + '\n',
  );

  console.log(`gravado ${hoje}-busca.json — ${doConjunto.length} do conjunto, ${foraDoConjunto.length} fora`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
