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
import { montarLinhasBusca, type LinhaApi } from '../src/lib/baseline/busca';

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
  // A janela do Search Console atrasa cerca de três dias; 16 meses é o máximo.
  const fim = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
  const inicio = new Date(Date.now() - 480 * 864e5).toISOString().slice(0, 10);

  const token = await accessToken();

  // 25.000 é o teto por requisição. Nenhuma paginação aqui: o volume de
  // consultas distintas de um site pessoal fica muito abaixo disso. Se
  // algum dia encostar no teto, o aviso abaixo dispara e aí vale paginar.
  const porConsulta = await consultar(token, {
    startDate: inicio,
    endDate: fim,
    dimensions: ['query'],
    rowLimit: 25000,
    type: 'web',
  });

  if (porConsulta.length >= 25000) {
    console.warn('AVISO: resultado no teto de 25.000 linhas — pode estar truncado, avalie paginar com startRow');
  }

  const { doConjunto, foraDoConjunto } = montarLinhasBusca(porConsulta, grupoDe);

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
