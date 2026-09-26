/**
 * Mede quais fatos canônicos cada fonte externa carrega hoje.
 *
 * Existe para transformar a Fase A de checklist em medição. "Preenchi o
 * LinkedIn" é afirmação; "a fonte carrega 5 dos 5 fatos esperados" é medida, e
 * a diferença entre duas rodadas mostra o que de fato mudou.
 *
 * Nenhuma credencial: tudo é página pública.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validarFatos } from '../src/lib/baseline/fatos';
import { validarFontes } from '../src/lib/baseline/fontes';
import { calcularCobertura } from '../src/lib/baseline/cobertura';
import { naoMedido } from '../src/lib/baseline/snapshot';
import type {
  CoberturaFonte,
  LinhaIdentidade,
  SnapshotIdentidade,
} from '../src/lib/baseline/cobertura';
import type { Medido } from '../src/lib/baseline/snapshot';

const RAIZ = join(__dirname, '..');
const DESTINO = join(RAIZ, 'orm/identidade/snapshots');

// Navegador comum: várias fontes servem conteúdo diferente, ou nada, a um
// agente que se identifica como robô.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

// A medição é sensível ao idioma: os termos do fato `eixos` são em português,
// e `ionic.health` e `forense.io` negociam locale. Sem pedir pt-BR, uma troca
// de CDN ou de geografia vira o fato sem ninguém ter editado a fonte, e duas
// máquinas discordam sobre o mesmo dia. O idioma é parte do instrumento, não
// da máquina que roda.
const CABECALHOS = { 'user-agent': UA, 'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8' };

const hoje = new Date().toISOString().slice(0, 10);
const arquivo = join(DESTINO, `${hoje}-identidade.json`);

interface FalhaFonte {
  id: string;
  url: string;
  erro: string;
}

async function main(): Promise<void> {
  if (existsSync(arquivo)) {
    console.error(`já existe ${hoje}-identidade.json — snapshot não se sobrescreve`);
    process.exit(1);
  }

  const fatos = validarFatos(
    JSON.parse(readFileSync(join(RAIZ, 'orm/identidade/fatos.json'), 'utf8')),
  );
  const registro = validarFontes(
    JSON.parse(readFileSync(join(RAIZ, 'orm/identidade/fontes.json'), 'utf8')),
    fatos,
  );

  // `linhas` tem uma entrada por fonte TENTADA; `coberturas` só as medidas, e
  // serve à média. Encolher `linhas` para as sobreviventes deixaria qualquer
  // consumidor futuro tirar média de sete sobre um `tentadas: 8` sem perceber.
  const linhas: LinhaIdentidade[] = [];
  const coberturas: CoberturaFonte[] = [];
  const falhas: FalhaFonte[] = [];
  let n = 0;

  for (const fonte of registro.fontes) {
    n++;
    try {
      const r = await fetch(fonte.url, { headers: CABECALHOS, redirect: 'follow' });
      if (!r.ok) throw new Error(`http ${r.status}`);
      const c = calcularCobertura(fonte, await r.text(), fatos);
      coberturas.push(c);
      linhas.push(c);
      const pct = Math.round(c.cobertura * 100);
      const marca = c.alcance === 'parcial' ? ' (alcance parcial)' : '';
      console.log(
        `[${n}/${registro.fontes.length}] ${fonte.id.padEnd(10)} ${String(pct).padStart(3)}%  ` +
          `faltam: ${c.ausentes.join(', ') || '—'}${marca}`,
      );
    } catch (e) {
      const erro = e instanceof Error ? e.message : String(e);
      falhas.push({ id: fonte.id, url: fonte.url, erro });
      linhas.push({ id: fonte.id, url: fonte.url, medido: false, motivo: erro });
      console.warn(`[${n}/${registro.fontes.length}] ${fonte.id.padEnd(10)} falhou: ${erro}`);
    }
  }

  const identidade: Medido<LinhaIdentidade[]> =
    coberturas.length > 0
      ? { medido: true, valor: linhas }
      : naoMedido('nenhuma fonte respondeu — verifique a rede');

  const snapshot: SnapshotIdentidade = {
    versao: 1,
    data: hoje,
    fatosVersao: fatos.versao,
    fontesVersao: registro.versao,
    identidade,
    falhas,
    tentadas: registro.fontes.length,
  };

  mkdirSync(DESTINO, { recursive: true });
  writeFileSync(arquivo, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });

  // A média só é reportada sem qualificação quando todas as fontes
  // responderam. Dividir pelas sobreviventes e chamar isso de "cobertura
  // média" sem dizer quantas responderam deixaria uma rodada com sete
  // falhas de oito escrever um snapshot que parece 100% de cobertura.
  if (coberturas.length === 0) {
    console.log(`\ngravado ${hoje}-identidade.json — nenhuma fonte respondeu, ${falhas.length} falha(s)`);
  } else {
    const media = Math.round(
      (coberturas.reduce((s, c) => s + c.cobertura, 0) / coberturas.length) * 100,
    );
    if (falhas.length === 0) {
      console.log(`\ngravado ${hoje}-identidade.json — cobertura média ${media}%, 0 falha(s)`);
    } else {
      console.log(
        `\ngravado ${hoje}-identidade.json — cobertura média das ${coberturas.length} que responderam: ${media}%, ${falhas.length} falha(s)`,
      );
    }
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
