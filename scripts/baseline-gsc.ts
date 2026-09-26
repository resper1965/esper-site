/**
 * Coleta desempenho de busca no Search Console e grava a metade de busca do
 * snapshot.
 *
 * Roda à mão: `npm run baseline:gsc`. Sem agendamento — automatizar cadência
 * antes de existir a segunda medição é adivinhar.
 *
 * Nenhuma credencial mora aqui. Tudo vem do ambiente.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { validarConsultas, GRUPOS } from '../src/lib/baseline/consultas';
import { naoMedido } from '../src/lib/baseline/snapshot';
import type { LinhaBusca, Medido } from '../src/lib/baseline/snapshot';
import { montarLinhasBusca, type LinhaApi } from '../src/lib/baseline/busca';
import { assinarJwt, normalizarChavePrivada } from '../src/lib/baseline/jwt';

const RAIZ = join(__dirname, '..');
const API = 'https://www.googleapis.com/webmasters/v3/sites';
const TOKEN = 'https://oauth2.googleapis.com/token';
const ESCOPO = 'https://www.googleapis.com/auth/webmasters.readonly';

const exigir = (nome: string): string => {
  const v = process.env[nome];
  if (!v) throw new Error(`variável de ambiente ausente: ${nome}`);
  return v;
};

/**
 * Corpo de erro do endpoint de token: redigido primeiro, truncado depois.
 *
 * A ordem não é arbitrária. Truncar antes decepa o `-----END`, o padrão deixa
 * de casar e o bloco sobrevive pela metade — meia chave privada numa mensagem
 * de erro ainda é uma chave privada vazada. Redigir primeiro remove o bloco
 * inteiro; o corte que vem depois só limita o tamanho do ruído.
 *
 * Existe porque este arquivo agora manuseia chave privada, e um 400 de chave
 * malformada pode ecoar de volta o material submetido. O `corpoDeErro` de
 * `baseline-sonda.ts` é local àquele script e redige forma de chave de API,
 * não bloco PEM — reaproveitá-lo exigiria exportá-lo e ampliá-lo, e o que se
 * redige aqui é outra coisa.
 */
async function corpoDeErro(r: Response): Promise<string> {
  return (await r.text())
    .replace(/-----BEGIN[\s\S]*?-----END[^-]*-----/g, '[chave redigida]')
    .slice(0, 200);
}

/**
 * Troca um JWT assinado pela conta de serviço por um access token.
 *
 * Sem SDK e sem navegador: assina, posta, lê o token. A conta de serviço não
 * precisa de papel nenhum no projeto GCP — o que dá acesso ao dado é o e-mail
 * dela estar adicionado como usuário da propriedade no Search Console.
 */
async function accessToken(): Promise<string> {
  const jwt = assinarJwt(
    {
      email: exigir('GSC_SA_EMAIL'),
      escopo: ESCOPO,
      audiencia: TOKEN,
      agoraSegundos: Math.floor(Date.now() / 1000),
    },
    normalizarChavePrivada(exigir('GSC_SA_PRIVATE_KEY')),
  );

  const r = await fetch(TOKEN, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  // As duas falhas comuns aqui são indistinguíveis pela mensagem e apontam
  // para lados opostos: 400 é quase sempre chave malformada — valor cortado na
  // cópia, ou `\n` não escapado no `.env.baseline`; 403 é quase sempre a conta
  // de serviço não adicionada como usuária da propriedade no Search Console.
  if (!r.ok) {
    throw new Error(`token da conta de serviço falhou: ${r.status} ${await corpoDeErro(r)}`);
  }
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
  const inicioHistorico = new Date(Date.now() - 480 * 864e5).toISOString().slice(0, 10);
  // Duas rodadas com um mês de intervalo compartilham ~450 dos 480 dias: uma
  // duplicação real mexeria poucos por cento na média. A janela curta é a que
  // torna o diff entre snapshots consecutivos legível; a longa fica para o
  // acumulado. As duas, no mesmo arquivo, medindo o mesmo `fim`.
  const inicio28d = new Date(Date.parse(fim) - 27 * 864e5).toISOString().slice(0, 10);

  const destino = join(RAIZ, 'orm/baseline/snapshots');
  const arquivo = join(destino, `${hoje}-busca.json`);

  // Antes do token e das duas consultas, como já faz a sonda: descobrir só na
  // hora de gravar que o arquivo de hoje existe gasta o token e as duas
  // chamadas de API para terminar em EEXIST. A flag 'wx' lá embaixo continua
  // sendo a rede de segurança — esta checagem não substitui, antecipa.
  if (existsSync(arquivo)) {
    throw new Error(`já existe snapshot de hoje em ${arquivo} — renomeie ou mova antes de rodar de novo`);
  }

  const token = await accessToken();

  // 25.000 é o teto por requisição. Nenhuma paginação aqui: o volume de
  // consultas distintas de um site pessoal fica muito abaixo disso. Se
  // algum dia encostar no teto, o aviso abaixo dispara e aí vale paginar.
  const coletar = async (
    rotulo: string,
    startDate: string,
  ): Promise<{ medicao: Medido<LinhaBusca[]>; dentro: number; fora: number }> => {
    const linhas = await consultar(token, {
      startDate,
      endDate: fim,
      dimensions: ['query'],
      rowLimit: 25000,
      type: 'web',
    });

    if (linhas.length >= 25000) {
      console.warn(`AVISO: ${rotulo} no teto de 25.000 linhas — pode estar truncado, avalie paginar com startRow`);
    }

    // Zero linha não é zero impressão: é ausência de medição. Acontece com
    // GSC_SITE_URL errada-mas-válida ou propriedade sem histórico, e gravar
    // `medido: true` aí registraria quatorze consultas em zero como medidas.
    if (linhas.length === 0) {
      return {
        medicao: naoMedido('a API não devolveu nenhuma linha — confira GSC_SITE_URL e se a propriedade tem histórico'),
        dentro: 0,
        fora: 0,
      };
    }

    const { doConjunto, foraDoConjunto } = montarLinhasBusca(linhas, grupoDe);
    return {
      medicao: { medido: true, valor: [...doConjunto, ...foraDoConjunto.slice(0, 50)] },
      dentro: doConjunto.length,
      fora: foraDoConjunto.length,
    };
  };

  const historico = await coletar('histórico', inicioHistorico);
  const curto = await coletar('28 dias', inicio28d);

  mkdirSync(destino, { recursive: true });
  const conteudo =
    JSON.stringify(
      {
        versao: 1,
        data: hoje,
        janelas: {
          buscaHistorico: { inicio: inicioHistorico, fim },
          busca28d: { inicio: inicio28d, fim },
        },
        buscaHistorico: historico.medicao,
        busca28d: curto.medicao,
      },
      null,
      2,
    ) + '\n';

  // 'wx' falha se o arquivo existe: snapshot não se sobrescreve, o histórico
  // é o produto.
  try {
    writeFileSync(arquivo, conteudo, { flag: 'wx' });
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error(`já existe snapshot de hoje em ${arquivo} — renomeie ou mova antes de rodar de novo`);
    }
    throw e;
  }

  // Janela não medida imprime o motivo, não "0 do conjunto, 0 fora": zero
  // medido e ausência de medição são coisas diferentes, e a linha de console é
  // o que se lê ao rodar — dizer zero aqui é afirmar um número que não existe.
  const resumo = (r: { medicao: Medido<LinhaBusca[]>; dentro: number; fora: number }): string =>
    r.medicao.medido ? `${r.dentro} do conjunto, ${r.fora} fora` : `não medido — ${r.medicao.motivo}`;

  console.log(
    `gravado ${hoje}-busca.json — histórico: ${resumo(historico)} | 28d: ${resumo(curto)}`,
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
