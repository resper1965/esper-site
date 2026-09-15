/**
 * Pergunta o mesmo conjunto de perguntas a cada modelo, N vezes, e conta
 * quantas vezes o site foi citado e o nome mencionado.
 *
 * Confusão com homônimo e recusa NÃO são contadas aqui: exigem julgamento
 * sobre de quem o texto fala, que palavra-chave não decide. São classificadas
 * à mão a partir do arquivo de respostas cruas, na conferência de sanidade —
 * o cabeçalho de `src/lib/baseline/citacao.ts` registra por quê.
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
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { detectarCitacao } from '../src/lib/baseline/citacao';
import { resumirCitacoes, naoMedido } from '../src/lib/baseline/snapshot';
import type { ResultadoSonda, Medido } from '../src/lib/baseline/snapshot';
import { respostaUtilizavel } from '../src/lib/baseline/sonda';

const RAIZ = join(__dirname, '..');

interface Modelo {
  nome: string;
  chave: string;
  perguntar: (prompt: string) => Promise<string>;
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

async function anthropic(prompt: string): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${await corpoDeErro(r)}`);
  const j = (await r.json()) as { content: Array<{ text?: string }> };
  return j.content.map((c) => c.text ?? '').join('');
}

async function openai(prompt: string): Promise<string> {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5.6-terra',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`openai ${r.status}: ${await corpoDeErro(r)}`);
  const j = (await r.json()) as { choices?: Array<{ message?: { content?: string | null } }> };
  const texto = j.choices?.[0]?.message?.content;
  if (typeof texto !== 'string') throw new Error(`openai: resposta sem texto (${JSON.stringify(j).slice(0, 200)})`);
  return texto;
}

// O id de modelo abaixo é parâmetro de medição, não detalhe: comparar dois
// snapshots tirados com modelos diferentes compara duas coisas diferentes,
// não a mesma coisa em dois momentos. `gpt-4o` foi trocado por
// `gpt-5.6-terra` porque foi aposentado do ChatGPT em fevereiro de 2026,
// embora continuasse respondendo na API — medir um modelo que nenhum
// consumidor alcança mais derrota o propósito da sonda. Quando um id
// envelhecer de novo, o correto é registrar a troca no snapshot, não trocar
// em silêncio.
const MODELOS: Modelo[] = [
  { nome: 'claude-sonnet-5', chave: 'ANTHROPIC_API_KEY', perguntar: anthropic },
  { nome: 'gpt-5.6-terra', chave: 'OPENAI_API_KEY', perguntar: openai },
];

async function main(): Promise<void> {
  const cfg = JSON.parse(
    readFileSync(join(RAIZ, 'orm/baseline/prompts.json'), 'utf8'),
  ) as { execucoes: number; prompts: string[] };

  const disponiveis = MODELOS.filter((m) => process.env[m.chave]);
  if (disponiveis.length === 0) {
    throw new Error('nenhuma chave de provedor no ambiente — nada a medir');
  }

  const semChave = MODELOS.filter((m) => !process.env[m.chave]).map((m) => ({
    modelo: m.nome,
    motivo: `sem ${m.chave} no ambiente`,
  }));

  const hoje = new Date().toISOString().slice(0, 10);
  const destino = join(RAIZ, 'orm/baseline/snapshots');
  mkdirSync(destino, { recursive: true });
  const arquivo = join(destino, `${hoje}-modelos.json`);
  const arquivoRespostas = join(destino, `${hoje}-modelos-respostas.json`);

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

  const gravar = (): void => {
    // Modelo que terminou sem nenhuma execução utilizável não foi medido —
    // é o que um id de modelo aposentado produz, e ficaria invisível se
    // aparecesse na lista de medidos com tudo zero.
    const semMedicao = disponiveis
      .filter((m) => {
        const seus = resultados.filter((r) => r.modelo === m.nome);
        return seus.length > 0 && seus.every((r) => r.execucoes === 0);
      })
      .map((m) => ({ modelo: m.nome, motivo: 'todas as chamadas falharam — id de modelo aposentado?' }));

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
          data: hoje,
          naoMedidos: [...semChave, ...semMedicao],
          modelos,
          classificacaoManual: naoMedido(
            `confusão com homônimo e recusa não são medidas automaticamente: exigem julgamento sobre de quem o texto fala. Classificar à mão a partir de ${hoje}-modelos-respostas.json, na conferência de sanidade.`,
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
      JSON.stringify({ versao: 1, data: hoje, respostas }, null, 2) + '\n',
    );
  };

  for (const modelo of disponiveis) {
    for (const prompt of cfg.prompts) {
      const citacoes = [];
      let falhas = 0;
      for (let i = 0; i < cfg.execucoes; i++) {
        try {
          const resposta = await modelo.perguntar(prompt);
          respostas.push({ modelo: modelo.nome, prompt, execucao: i + 1, resposta });
          if (!respostaUtilizavel(resposta)) {
            falhas++;
            console.warn(`  resposta em branco: ${modelo.nome} | execução ${i + 1}`);
            continue;
          }
          citacoes.push(detectarCitacao(resposta));
        } catch (e) {
          falhas++;
          const erro = e instanceof Error ? e.message : String(e);
          respostas.push({ modelo: modelo.nome, prompt, execucao: i + 1, erro });
          console.warn(`  falha: ${modelo.nome} | execução ${i + 1} | ${erro}`);
        }
      }
      const resumo = resumirCitacoes(prompt, modelo.nome, citacoes, falhas);
      resultados.push(resumo);
      console.log(
        `${modelo.nome} | ${resumo.citou}/${resumo.execucoes} citou | ${resumo.mencionou} mencionou | ${resumo.falhas} falhas | ${prompt}`,
      );
      gravar();
    }
  }

  console.log(`gravado ${hoje}-modelos.json e ${hoje}-modelos-respostas.json`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
