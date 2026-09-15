/**
 * Pergunta o mesmo conjunto de perguntas a cada modelo, N vezes, e conta
 * quantas vezes o site foi citado e o nome mencionado.
 *
 * Todos os modelos são alcançados pelo AI Gateway da Cloudflare, com uma
 * credencial só. Confusão com homônimo e recusa NÃO são contadas aqui: exigem
 * julgamento sobre de quem o texto fala, que palavra-chave não decide. São
 * classificadas por `npm run baseline:classificar`, a partir do arquivo de
 * respostas cruas que esta sonda grava.
 *
 * RESSALVA, e ela precisa sobreviver a quem ler isto daqui a seis meses: a API
 * de um modelo NÃO é a mesma superfície que o produto de consumo. O ChatGPT
 * com navegação ativa responde diferente da API crua. Esta sonda mede
 * conhecimento paramétrico mais a recuperação que a API expõe — que não é o
 * que o leitor vê. Por isso a primeira rodada é conferida à mão nas interfaces
 * de consumo, uma única vez, como sanidade.
 *
 * O resultado é distribuição, não booleano: modelo é não-determinístico, e é
 * por isso que existem N execuções por prompt.
 *
 * CUSTO: esta sonda gasta crédito da Cloudflare. O plano é impresso e conferido
 * contra MAX_CHAMADAS_PAGAS antes de qualquer chamada, `--plano` imprime e sai
 * sem gastar, e cada chamada aparece numerada na saída.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { detectarCitacao } from '../src/lib/baseline/citacao';
import { resumirCitacoes, naoMedido } from '../src/lib/baseline/snapshot';
import type { ResultadoSonda, Medido } from '../src/lib/baseline/snapshot';
import { respostaUtilizavel } from '../src/lib/baseline/sonda';

const RAIZ = join(__dirname, '..');
const HOJE = new Date().toISOString().slice(0, 10);

/**
 * Pausa entre chamadas pagas. O faturamento unificado do Gateway tem limite de
 * taxa, e a primeira execução real o estourou com chamadas sequenciais sem
 * intervalo. Um segundo por chamada acrescenta menos de um minuto a uma rodada
 * de 50 e evita perder metade delas.
 */
const PAUSA_MS = 1000;
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Teto duro de chamadas pagas por rodada. Um erro de edição em prompts.json
 * que multiplique as execuções tem que falhar alto e de graça, não faturar em
 * silêncio. Se o conjunto de prompts crescer de propósito, suba isto de
 * propósito — no mesmo commit.
 */
const MAX_CHAMADAS_PAGAS = 60;

/** Folga para uma citação inteira, teto para uma resposta patológica. */
const MAX_TOKENS = 1024;

const BASE = (): string =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}`;

interface Modelo {
  nome: string;
  perguntar: (prompt: string) => Promise<string>;
}

/**
 * Cabeçalhos de toda chamada ao Gateway.
 *
 * `cf-aig-skip-cache` é questão de correção, não de custo. O cache do gateway
 * está desligado hoje; se alguém ligar amanhã, as N execuções repetidas de um
 * mesmo prompt voltariam todas da mesma resposta em cache, e a distribuição —
 * que é a única razão de repetir — viraria ficção, sem erro nenhum para
 * alguém notar. O snapshot pareceria certo e estaria errado.
 *
 * `cf-aig-metadata` marca estas chamadas no log do gateway, para que a
 * auditoria de custo consiga separar o que foi do baseline do que não foi.
 */
function cabecalhosGateway(): Record<string, string> {
  return {
    authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN ?? ''}`,
    'content-type': 'application/json',
    'cf-aig-skip-cache': 'true',
    'cf-aig-metadata': JSON.stringify({ projeto: 'baseline-orm', rodada: HOJE }),
  };
}

/**
 * Corpo de erro do provedor: redigido primeiro, truncado depois, antes de
 * virar mensagem de exceção.
 *
 * O corpo do 401 da OpenAI devolve a chave submetida em forma mascarada
 * (`sk-proj-abcd****…`), e esse texto acaba no arquivo de evidência, que é
 * commitado. `encontrarSegredos` não pega essa forma: o padrão dele exige 20+
 * caracteres de classe depois de `sk-`, e antes dos asteriscos há só nove.
 *
 * A ordem importa. Truncar sozinho não resolveria: num 401 real a chave
 * mascarada começa por volta do índice 49, bem dentro dos 200 caracteres que
 * sobrevivem ao corte. Por isso a redação vem primeiro — o corte existe para
 * limitar o tamanho do ruído, não para conter segredo, e um corte que só
 * "às vezes" decepa a chave é pior que nenhum, porque parece proteção.
 *
 * Redigir aqui, e não acrescentar o padrão mascarado a `PADROES`, é
 * deliberado: a guarda só detectaria o vazamento depois de ele já estar em
 * disco. Nunca embuta `await r.text()` cru em erro nenhum.
 */
async function corpoDeErro(r: Response): Promise<string> {
  return (await r.text()).replace(/sk-[A-Za-z0-9_*-]+/gi, 'sk-[redigido]').slice(0, 200);
}

/**
 * Rota nativa da Anthropic no Gateway. Ela existe porque
 * `/ai/v1/chat/completions` devolve 400 `Required value missing: max_tokens`
 * para modelo Anthropic — a forma OpenAI não carrega o campo do jeito que a
 * Anthropic exige. Não unifique as duas numa chamada só sem reconfirmar isso.
 */
async function anthropic(prompt: string): Promise<string> {
  const r = await fetch(`${BASE()}/ai/v1/messages`, {
    method: 'POST',
    headers: cabecalhosGateway(),
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-5',
      max_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${await corpoDeErro(r)}`);
  const j = (await r.json()) as { content?: Array<{ text?: string }> };
  const texto = (j.content ?? []).map((c) => c.text ?? '').join('');
  if (texto === '')
    throw new Error(`anthropic: resposta sem texto (${JSON.stringify(j).slice(0, 200)})`);
  return texto;
}

async function openai(prompt: string): Promise<string> {
  const r = await fetch(`${BASE()}/ai/v1/chat/completions`, {
    method: 'POST',
    headers: cabecalhosGateway(),
    body: JSON.stringify({
      model: 'openai/gpt-5.5',
      // `max_completion_tokens`, não `max_tokens`: o gpt-5.5 recusa o segundo com
      // 400. A rota da Anthropic, em /ai/v1/messages, continua usando max_tokens,
      // que é o nome dela lá — os dois nomes coexistem de propósito.
      max_completion_tokens: MAX_TOKENS,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`openai ${r.status}: ${await corpoDeErro(r)}`);
  const j = (await r.json()) as { choices?: Array<{ message?: { content?: string | null } }> };
  const texto = j.choices?.[0]?.message?.content;
  if (typeof texto !== 'string')
    throw new Error(`openai: resposta sem texto (${JSON.stringify(j).slice(0, 200)})`);
  return texto;
}

// O id de modelo abaixo é parâmetro de medição, não detalhe: comparar dois
// snapshots tirados com modelos diferentes compara duas coisas diferentes,
// não a mesma coisa em dois momentos. Por isso `nome` é o identificador exato
// que o Gateway recebe, e é ele que vai para o snapshot. Quando um id
// envelhecer, o correto é registrar a troca no snapshot, não trocar em
// silêncio.
const MODELOS: Modelo[] = [
  { nome: 'anthropic/claude-sonnet-5', perguntar: anthropic },
  { nome: 'openai/gpt-5.5', perguntar: openai },
];

/** Modelo que o Gateway alcançaria e que não foi medido, com o motivo. */
const FORA_DA_MEDICAO = [
  {
    modelo: 'google-ai-studio/gemini-2.5-flash',
    motivo: 'identificador não confirmado — 404 Model not found em 15/09/2026',
  },
];

async function main(): Promise<void> {
  const cfg = JSON.parse(readFileSync(join(RAIZ, 'orm/baseline/prompts.json'), 'utf8')) as {
    execucoes: number;
    prompts: string[];
  };

  const chamadas = cfg.prompts.length * cfg.execucoes * MODELOS.length;

  console.log('plano da rodada:');
  console.log(
    `  ${cfg.prompts.length} prompts × ${cfg.execucoes} execuções × ${MODELOS.length} modelos = ${chamadas} chamadas pagas de sonda`,
  );
  console.log(
    `  + até ${chamadas} chamadas de classificação depois, em npm run baseline:classificar`,
  );
  console.log(`  teto configurado: MAX_CHAMADAS_PAGAS = ${MAX_CHAMADAS_PAGAS}`);
  console.log(`  max_tokens por resposta: ${MAX_TOKENS}`);

  // A conferência vem antes de qualquer chamada: plano estourado tem que
  // custar zero.
  if (chamadas > MAX_CHAMADAS_PAGAS) {
    throw new Error(
      `plano de ${chamadas} chamadas excede MAX_CHAMADAS_PAGAS = ${MAX_CHAMADAS_PAGAS} — ` +
        `${cfg.prompts.length} prompts × ${cfg.execucoes} execuções × ${MODELOS.length} modelos. ` +
        'Reduza prompts.json ou suba o teto de propósito, no mesmo commit.',
    );
  }

  if (process.argv.includes('--plano')) {
    console.log('--plano: nada foi chamado, nada foi gasto.');
    return;
  }

  // Uma credencial só para todos os modelos: ou o Gateway está configurado e
  // todos estão disponíveis, ou nenhum está.
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error(
      'sem CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID no ambiente — nada a medir; ver orm/baseline/chave-api.md',
    );
  }

  const destino = join(RAIZ, 'orm/baseline/snapshots');
  mkdirSync(destino, { recursive: true });
  const arquivo = join(destino, `${HOJE}-modelos.json`);
  const arquivoRespostas = join(destino, `${HOJE}-modelos-respostas.json`);

  // A sonda reescreve o próprio arquivo a cada prompt, então não dá para usar
  // flag 'wx' como os outros coletores: a checagem é aqui, antes do laço. Um
  // snapshot nunca é sobrescrito — o histórico é o produto, e uma segunda
  // rodada no mesmo dia destruiria cinquenta chamadas pagas.
  for (const existente of [arquivo, arquivoRespostas]) {
    if (existsSync(existente)) {
      throw new Error(
        `já existe snapshot de hoje em ${existente} — renomeie ou mova antes de rodar de novo; snapshot não se sobrescreve`,
      );
    }
  }

  const resultados: ResultadoSonda[] = [];
  /**
   * Evidência crua. Sem ela, um número suspeito nunca mais pode ser conferido.
   *
   * Toda execução entra aqui exatamente uma vez, inclusive a que falhou — com
   * `erro` no lugar de `resposta`. Registrando só o sucesso, o arquivo
   * reconciliava com as respostas em branco mas não com as falhas de rede: as
   * `falhas` do resumo não tinham contrapartida nenhuma na evidência.
   */
  const respostas: Array<
    { modelo: string; prompt: string; execucao: number } & ({ resposta: string } | { erro: string })
  > = [];
  /** Último erro observado por modelo, para o motivo em `naoMedidos` — ver Step 3. */
  const ultimoErro: Record<string, string> = {};

  const gravar = (): void => {
    // Modelo que terminou sem nenhuma execução utilizável não foi medido —
    // é o que um id de modelo aposentado produz, e ficaria invisível se
    // aparecesse na lista de medidos com tudo zero.
    const semMedicao = MODELOS.filter((m) => {
      const seus = resultados.filter((r) => r.modelo === m.nome);
      return seus.length > 0 && seus.every((r) => r.execucoes === 0);
    }).map((m) => ({
      modelo: m.nome,
      motivo: `todas as chamadas falharam — último erro: ${ultimoErro[m.nome] ?? 'desconhecido'}`,
    }));

    const uteis = resultados.filter((r) => r.execucoes > 0);
    const modelos: Medido<ResultadoSonda[]> =
      uteis.length > 0
        ? { medido: true, valor: resultados }
        : naoMedido('todas as chamadas falharam — nada foi medido');

    writeFileSync(
      arquivo,
      JSON.stringify(
        {
          versao: 1,
          data: HOJE,
          via: 'cloudflare-ai-gateway',
          naoMedidos: [...FORA_DA_MEDICAO, ...semMedicao],
          modelos,
          classificacao: naoMedido(
            `de quem o texto fala, e se houve recusa, são classificados em passo separado: rode npm run baseline:classificar sobre ${HOJE}-modelos-respostas.json.`,
          ),
        },
        null,
        2,
      ) + '\n',
    );
    // A resposta do modelo em si não carrega credencial, mas a entrada de erro
    // carrega o corpo devolvido pelo provedor — e o 401 da OpenAI ecoa a chave
    // submetida mascarada, que encontrarSegredos não casa. Por isso o corpo é
    // redigido e truncado em corpoDeErro antes de chegar aqui: a guarda sobre este
    // diretório não é suficiente sozinha.
    writeFileSync(
      arquivoRespostas,
      JSON.stringify({ versao: 1, data: HOJE, respostas }, null, 2) + '\n',
    );
  };

  let n = 0;
  for (const modelo of MODELOS) {
    for (const prompt of cfg.prompts) {
      const citacoes = [];
      let falhas = 0;
      for (let i = 0; i < cfg.execucoes; i++) {
        // O contador sai antes da chamada: uma disparada tem que ficar visível
        // enquanto acontece, não no total ao final.
        n++;
        console.log(`[${n}/${chamadas}] ${modelo.nome} | execução ${i + 1} | ${prompt}`);
        try {
          const resposta = await modelo.perguntar(prompt);
          respostas.push({ modelo: modelo.nome, prompt, execucao: i + 1, resposta });
          if (!respostaUtilizavel(resposta)) {
            falhas++;
            console.warn(`  resposta em branco: ${modelo.nome} | execução ${i + 1}`);
            await dormir(PAUSA_MS);
            continue;
          }
          citacoes.push(detectarCitacao(resposta));
        } catch (e) {
          falhas++;
          const erro = e instanceof Error ? e.message : String(e);
          ultimoErro[modelo.nome] = erro;
          respostas.push({ modelo: modelo.nome, prompt, execucao: i + 1, erro });
          console.warn(`  falha: ${modelo.nome} | execução ${i + 1} | ${erro}`);
        }
        await dormir(PAUSA_MS);
      }
      const resumo = resumirCitacoes(prompt, modelo.nome, citacoes, falhas);
      resultados.push(resumo);
      console.log(
        `${modelo.nome} | ${resumo.citou}/${resumo.execucoes} citou | ${resumo.mencionou} mencionou | ${resumo.falhas} falhas | ${prompt}`,
      );
      gravar();
    }
  }

  console.log(`gravado ${HOJE}-modelos.json e ${HOJE}-modelos-respostas.json — ${n} chamadas pagas`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
