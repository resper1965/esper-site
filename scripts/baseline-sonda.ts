/**
 * Pergunta o mesmo conjunto de perguntas a cada modelo, N vezes, e conta
 * quantas vezes o site foi citado, o nome mencionado e o homônimo confundido.
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
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text()}`);
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
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`openai ${r.status}: ${await r.text()}`);
  const j = (await r.json()) as { choices?: Array<{ message?: { content?: string | null } }> };
  const texto = j.choices?.[0]?.message?.content;
  if (typeof texto !== 'string') throw new Error(`openai: resposta sem texto (${JSON.stringify(j).slice(0, 200)})`);
  return texto;
}

const MODELOS: Modelo[] = [
  { nome: 'claude-sonnet-5', chave: 'ANTHROPIC_API_KEY', perguntar: anthropic },
  { nome: 'gpt-4o', chave: 'OPENAI_API_KEY', perguntar: openai },
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
  /** Evidência crua. Sem ela, um número suspeito nunca mais pode ser conferido. */
  const respostas: Array<{ modelo: string; prompt: string; execucao: number; resposta: string }> = [];

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
        { versao: 1, data: hoje, naoMedidos: [...semChave, ...semMedicao], modelos },
        null,
        2,
      ) + '\n',
    );
    // Respostas de modelo não carregam credencial, então a guarda
    // encontrarSegredos sobre este diretório continua valendo para o arquivo.
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
          console.warn(`  falha: ${modelo.nome} | execução ${i + 1} | ${e instanceof Error ? e.message : e}`);
        }
      }
      const resumo = resumirCitacoes(prompt, modelo.nome, citacoes, falhas);
      resultados.push(resumo);
      console.log(
        `${modelo.nome} | ${resumo.citou}/${resumo.execucoes} citou | ${resumo.mencionou} mencionou | ${resumo.homonimo} homônimo | ${resumo.recusas} recusas | ${resumo.falhas} falhas | ${prompt}`,
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
