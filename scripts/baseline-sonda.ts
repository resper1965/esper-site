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

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { detectarCitacao } from '../src/lib/baseline/citacao';
import { resumirCitacoes } from '../src/lib/baseline/snapshot';
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

  const naoMedidos = MODELOS.filter((m) => !process.env[m.chave]).map((m) => m.nome);
  const hoje = new Date().toISOString().slice(0, 10);
  const destino = join(RAIZ, 'orm/baseline/snapshots');
  mkdirSync(destino, { recursive: true });
  const arquivo = join(destino, `${hoje}-modelos.json`);

  const resultados: ResultadoSonda[] = [];

  const gravar = (): void => {
    const modelos: Medido<ResultadoSonda[]> = { medido: true, valor: resultados };
    writeFileSync(
      arquivo,
      JSON.stringify({ versao: 1, data: hoje, naoMedidos, modelos }, null, 2) + '\n',
    );
  };

  for (const modelo of disponiveis) {
    for (const prompt of cfg.prompts) {
      const citacoes = [];
      let falhas = 0;
      for (let i = 0; i < cfg.execucoes; i++) {
        try {
          const resposta = await modelo.perguntar(prompt);
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
        `${modelo.nome} | ${resumo.citou}/${resumo.execucoes} citou | ${resumo.homonimo} homônimo | ${resumo.falhas} falhas | ${prompt}`,
      );
      gravar();
    }
  }

  console.log(`gravado ${hoje}-modelos.json`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
