# Linha de Base de Exposição — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir um snapshot datado, versionado e reexecutável da exposição atual de Ricardo Esper em busca, autoridade e resposta de modelo, para que qualquer ganho posterior seja falsificável.

**Architecture:** Lógica pura (validação, detecção de citação, montagem de snapshot, parse de CSV) mora em `src/lib/baseline/` e é testada pelo Vitest. Toda chamada de rede mora em `scripts/`, executada à mão via `tsx`. Dados e snapshots moram em `orm/baseline/`, fora do build.

**Tech Stack:** TypeScript, Vitest, `tsx`, `fetch` nativo do Node. Nenhuma dependência nova.

**Spec:** `docs/superpowers/specs/2026-09-14-baseline-exposicao-design.md`

## Global Constraints

- **Vitest só enxerga `src/**`** — `include: ['src/**/*.{test,spec}.{ts,tsx}']` em `vitest.config.ts`. Código fora de `src/` não tem teste; por isso a lógica testável fica em `src/lib/baseline/`.
- **Nada de rede em `src/`** — `src/__tests__/sem-terceiros.test.ts` varre todo `.ts`/`.tsx` sob `src/`. Chamada de rede vai para `scripts/`.
- **Nenhuma credencial no repositório** — nem em código, nem em fixture, nem em snapshot. Só variável de ambiente.
- **`orm/` não entra no build** — está fora de `src/` e de `public/`, conforme `orm/README.md`.
- **Commits convencionais, em português** — `commitlint.config.js` usa `@commitlint/config-conventional`. Assunto com até 100 caracteres.
- **Teste antes do código, e o teste falha primeiro.** Prática registrada em `orm/referencia/operacao.md`: rodar contra o código anterior para provar a falha. Teste que passa contra o problema não é teste.
- **Rodar a suíte:** `npm test`. Um arquivo só: `npx vitest run src/__tests__/<arquivo>.test.ts`.
- **Propriedade do site:** `sc-domain:ricardoesper.com.br` (propriedade de domínio, verificada por DNS TXT).

---

### Task 1: Conjunto de consultas

**Files:**
- Create: `orm/baseline/consultas.json`
- Create: `src/lib/baseline/consultas.ts`
- Test: `src/__tests__/baseline-consultas.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `type GrupoConsulta = 'navegacional' | 'categoria_pt' | 'categoria_en'`; `const GRUPOS: GrupoConsulta[]`; `interface ConjuntoConsultas { versao: number; atualizado: string; grupos: Record<GrupoConsulta, string[]> }`; `function validarConsultas(dados: unknown): ConjuntoConsultas` — lança `Error` com mensagem descritiva se inválido.

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/__tests__/baseline-consultas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarConsultas } from '@/lib/baseline/consultas';

const ARQUIVO = join(__dirname, '..', '..', 'orm', 'baseline', 'consultas.json');

const valido = {
  versao: 1,
  atualizado: '2026-09-14',
  grupos: {
    navegacional: ['ricardo esper'],
    categoria_pt: ['auditor líder iso 27001'],
    categoria_en: ['iso 42001 lead auditor'],
  },
};

describe('validarConsultas', () => {
  it('aceita um conjunto bem formado', () => {
    expect(validarConsultas(valido).versao).toBe(1);
  });

  it('rejeita grupo ausente', () => {
    const semEn = { ...valido, grupos: { ...valido.grupos } };
    delete (semEn.grupos as Record<string, unknown>).categoria_en;
    expect(() => validarConsultas(semEn)).toThrow(/categoria_en/);
  });

  it('rejeita grupo vazio', () => {
    const vazio = { ...valido, grupos: { ...valido.grupos, categoria_pt: [] } };
    expect(() => validarConsultas(vazio)).toThrow(/vazio/);
  });

  it('rejeita consulta duplicada, mesmo entre grupos diferentes', () => {
    const dup = {
      ...valido,
      grupos: { ...valido.grupos, categoria_pt: ['ricardo esper'] },
    };
    expect(() => validarConsultas(dup)).toThrow(/duplicada/);
  });

  it('rejeita consulta com espaço sobrando ou maiúscula', () => {
    const sujo = { ...valido, grupos: { ...valido.grupos, categoria_pt: [' LGPD '] } };
    expect(() => validarConsultas(sujo)).toThrow(/normalizada/);
  });

  it('rejeita data fora do formato AAAA-MM-DD', () => {
    expect(() => validarConsultas({ ...valido, atualizado: '14/09/2026' })).toThrow(/atualizado/);
  });
});

describe('o arquivo de dados versionado', () => {
  const conjunto = validarConsultas(JSON.parse(readFileSync(ARQUIVO, 'utf8')));

  it('é válido', () => {
    expect(conjunto.versao).toBeGreaterThan(0);
  });

  it('tem consulta em todos os três grupos', () => {
    expect(conjunto.grupos.navegacional.length).toBeGreaterThan(0);
    expect(conjunto.grupos.categoria_pt.length).toBeGreaterThan(0);
    expect(conjunto.grupos.categoria_en.length).toBeGreaterThan(0);
  });

  it('mantém o inglês restrito — o acervo em /en tem 7 posts', () => {
    expect(conjunto.grupos.categoria_en.length).toBeLessThanOrEqual(5);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/__tests__/baseline-consultas.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/baseline/consultas"`.

- [ ] **Step 3: Criar o arquivo de dados**

Crie `orm/baseline/consultas.json`:

```json
{
  "versao": 1,
  "atualizado": "2026-09-14",
  "grupos": {
    "navegacional": [
      "ricardo esper",
      "ricardo esper ciso",
      "ricardo esper ness",
      "ricardo esper segurança da informação"
    ],
    "categoria_pt": [
      "auditor líder iso 27001",
      "auditor líder iso 27701",
      "iso 42001 governança de ia",
      "contraespionagem corporativa",
      "varredura eletrônica tscm",
      "consultor lgpd",
      "prompt injection indireta"
    ],
    "categoria_en": [
      "iso 42001 lead auditor",
      "tscm counter-espionage brazil",
      "indirect prompt injection case"
    ]
  }
}
```

- [ ] **Step 4: Escrever a implementação mínima**

Crie `src/lib/baseline/consultas.ts`:

```ts
/**
 * O conjunto de consultas é arquivo de dados, não código: é a parte que mais
 * muda, e embutir num script garantiria que ninguém edite. Este módulo só
 * valida a forma — quem lê o arquivo é o coletor, em `scripts/`.
 */

export type GrupoConsulta = 'navegacional' | 'categoria_pt' | 'categoria_en';

export const GRUPOS: GrupoConsulta[] = ['navegacional', 'categoria_pt', 'categoria_en'];

export interface ConjuntoConsultas {
  versao: number;
  atualizado: string;
  grupos: Record<GrupoConsulta, string[]>;
}

/** Consulta normalizada: sem espaço nas pontas, sem maiúscula, sem espaço duplo. */
const normalizada = (s: string): boolean => s === s.trim().toLowerCase().replace(/\s+/g, ' ');

export function validarConsultas(dados: unknown): ConjuntoConsultas {
  const d = dados as ConjuntoConsultas;

  if (!d || typeof d !== 'object') throw new Error('conjunto de consultas não é objeto');
  if (!Number.isInteger(d.versao) || d.versao < 1) throw new Error('versao deve ser inteiro positivo');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.atualizado ?? '')) {
    throw new Error('atualizado deve estar em AAAA-MM-DD');
  }
  if (!d.grupos || typeof d.grupos !== 'object') throw new Error('grupos ausente');

  const vistas = new Set<string>();

  for (const grupo of GRUPOS) {
    const lista = d.grupos[grupo];
    if (!Array.isArray(lista)) throw new Error(`grupo ${grupo} ausente ou não é lista`);
    if (lista.length === 0) throw new Error(`grupo ${grupo} está vazio`);

    for (const consulta of lista) {
      if (typeof consulta !== 'string' || consulta.length === 0) {
        throw new Error(`consulta inválida em ${grupo}`);
      }
      if (!normalizada(consulta)) {
        throw new Error(`consulta não normalizada em ${grupo}: "${consulta}"`);
      }
      if (vistas.has(consulta)) throw new Error(`consulta duplicada: "${consulta}"`);
      vistas.add(consulta);
    }
  }

  return d;
}

```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run src/__tests__/baseline-consultas.test.ts`
Expected: PASS — 9 testes.

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS. Confirma que o arquivo novo em `src/lib/` não quebrou `sem-terceiros.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add orm/baseline/consultas.json src/lib/baseline/consultas.ts src/__tests__/baseline-consultas.test.ts
git commit -m "feat(baseline): conjunto de consultas versionado e validado"
```

---

### Task 2: Detector de citação

O componente com a lógica mais fácil de errar, e o único onde um erro infla a métrica em vez de quebrá-la. Tem tarefa própria por isso.

**Files:**
- Create: `src/lib/baseline/citacao.ts`
- Test: `src/__tests__/baseline-citacao.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `interface Citacao { citouSite: boolean; urls: string[]; mencionouNome: boolean; confundiuHomonimo: boolean }`; `function detectarCitacao(resposta: string): Citacao`.

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/__tests__/baseline-citacao.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { detectarCitacao } from '@/lib/baseline/citacao';

describe('detectarCitacao', () => {
  it('reconhece citação com URL do site', () => {
    const r = detectarCitacao('Veja https://www.ricardoesper.com.br/pt-BR/sobre para detalhes.');
    expect(r.citouSite).toBe(true);
    expect(r.urls).toContain('https://www.ricardoesper.com.br/pt-BR/sobre');
  });

  it('reconhece o domínio sem esquema e sem www', () => {
    expect(detectarCitacao('fonte: ricardoesper.com.br/llms.txt').citouSite).toBe(true);
  });

  it('separa menção ao nome de citação do site', () => {
    const r = detectarCitacao('Ricardo Esper é CISO da IONIC Health.');
    expect(r.mencionouNome).toBe(true);
    expect(r.citouSite).toBe(false);
  });

  it('não conta ausência como menção', () => {
    const r = detectarCitacao('Não tenho informação sobre essa pessoa.');
    expect(r.mencionouNome).toBe(false);
    expect(r.citouSite).toBe(false);
  });

  it('aceita o nome com acento e em caixa variada', () => {
    expect(detectarCitacao('RICARDO ESPER').mencionouNome).toBe(true);
    expect(detectarCitacao('ricardo  esper').mencionouNome).toBe(true);
  });

  it('marca confusão com homônimo', () => {
    const r = detectarCitacao('Ricardo Esper é um jogador de futebol aposentado.');
    expect(r.confundiuHomonimo).toBe(true);
  });

  it('não marca homônimo quando o contexto é o correto', () => {
    const r = detectarCitacao('Ricardo Esper é auditor líder ISO 27001 e CISO.');
    expect(r.confundiuHomonimo).toBe(false);
  });

  // Os três abaixo existem porque a asserção acima NÃO basta: a frase dela tem
  // `auditor` e `ciso`, que casam sozinhos e mascaram um defeito no número da
  // norma. Cada um destes deixa o número como único marcador da frase.
  it('reconhece 27001 como contexto certo sem outra palavra-marcador', () => {
    expect(detectarCitacao('Ricardo Esper tem ISO 27001.').confundiuHomonimo).toBe(false);
  });

  it('reconhece 27701 como contexto certo sem outra palavra-marcador', () => {
    expect(detectarCitacao('Ricardo Esper tem ISO 27701.').confundiuHomonimo).toBe(false);
  });

  it('reconhece 42001 como contexto certo sem outra palavra-marcador', () => {
    expect(detectarCitacao('Ricardo Esper tem ISO 42001.').confundiuHomonimo).toBe(false);
  });

  it('não confunde outro domínio que contém o nome', () => {
    expect(detectarCitacao('veja ricardoesper.com.br.fake.example').citouSite).toBe(false);
  });

  // A armadilha registrada em orm/referencia/operacao.md: um teste casou com a
  // palavra dentro do próprio comentário. O detector recebe só a string de
  // resposta e nunca lê arquivo — então o texto deste comentário, que contém
  // ricardoesper.com.br de propósito, não pode influenciar resultado nenhum.
  it('opera apenas sobre o argumento recebido', () => {
    expect(detectarCitacao('').citouSite).toBe(false);
    expect(detectarCitacao('').urls).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/__tests__/baseline-citacao.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/baseline/citacao"`.

- [ ] **Step 3: Escrever a implementação mínima**

Crie `src/lib/baseline/citacao.ts`:

```ts
/**
 * Lê a resposta de um modelo e diz o que aconteceu com a entidade.
 *
 * Três resultados distintos, de propósito. Citar o site, mencionar o nome sem
 * link e confundir com homônimo são coisas diferentes: tratá-las como uma só
 * infla a métrica e faz o diff subir sem nada ter melhorado.
 */

export interface Citacao {
  citouSite: boolean;
  urls: string[];
  mencionouNome: boolean;
  confundiuHomonimo: boolean;
}

/** Fecha no fim do host para que `ricardoesper.com.br.fake.example` não case. */
const DOMINIO = /(?:https?:\/\/)?(?:www\.)?ricardoesper\.com\.br(?![a-z0-9.-])(?:\/[^\s)\]}>,"']*)?/gi;

const NOME = /ricardo\s+esper/i;

/**
 * Marcadores do domínio correto. A ausência de todos, junto com a presença do
 * nome, é o sinal de que o modelo respondeu sobre outra pessoa.
 */
const CONTEXTO_CERTO = /\b(ciso|cibersegurança|cybersecurity|iso\s*(?:27001|27701|42001)|lgpd|gdpr|forense|ness|ionic|auditor|contraespionagem|tscm|segurança da informação)\b/i;

export function detectarCitacao(resposta: string): Citacao {
  const urls = [...resposta.matchAll(DOMINIO)].map((m) => m[0]);
  const mencionouNome = NOME.test(resposta);

  return {
    citouSite: urls.length > 0,
    urls,
    mencionouNome,
    confundiuHomonimo: mencionouNome && !CONTEXTO_CERTO.test(resposta),
  };
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/__tests__/baseline-citacao.test.ts`
Expected: PASS — 12 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/baseline/citacao.ts src/__tests__/baseline-citacao.test.ts
git commit -m "feat(baseline): detector de citação, menção e homônimo"
```

---

### Task 3: Snapshot e a trava de credencial

**Files:**
- Create: `src/lib/baseline/snapshot.ts`
- Create: `orm/baseline/snapshots/.gitkeep`
- Test: `src/__tests__/baseline-snapshot.test.ts`

**Interfaces:**
- Consumes: `Citacao` da Task 2.
- Produces: `type Medido<T> = { medido: true; valor: T } | { medido: false; motivo: string }`; `interface Snapshot { versao: number; data: string; busca: Medido<LinhaBusca[]>; links: Medido<LinhaLink[]>; modelos: Medido<ResultadoSonda[]>; rastreio: Medido<LinhaRastreio[]> }`; `interface LinhaBusca { consulta: string; grupo: string; impressoes: number; cliques: number; posicao: number; ctr: number }`; `interface LinhaLink { dominio: string; links: number }`; `interface LinhaRastreio { robo: string; requisicoes: number }`; `interface ResultadoSonda { prompt: string; modelo: string; execucoes: number; citou: number; mencionou: number; homonimo: number }`; `function naoMedido(motivo: string): Medido<never>`; `function encontrarSegredos(texto: string): string[]`; `function resumirCitacoes(prompt: string, modelo: string, citacoes: Citacao[]): ResultadoSonda`.

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/__tests__/baseline-snapshot.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { encontrarSegredos, naoMedido } from '@/lib/baseline/snapshot';

const SNAPSHOTS = join(__dirname, '..', '..', 'orm', 'baseline', 'snapshots');

describe('encontrarSegredos', () => {
  it('acha chave do Google', () => {
    expect(encontrarSegredos('AIzaSyD-1234567890abcdefghijklmnopqrstu')).not.toHaveLength(0);
  });

  it('acha token do GitHub', () => {
    expect(encontrarSegredos('ghp_1234567890abcdefghijklmnopqrstuvwxyz')).not.toHaveLength(0);
  });

  it('acha chave da OpenAI', () => {
    expect(encontrarSegredos('sk-proj-abcdefghijklmnopqrstuvwxyz1234567890')).not.toHaveLength(0);
  });

  it('acha refresh token nomeado', () => {
    expect(encontrarSegredos('"refresh_token": "1//0abcdefgh"')).not.toHaveLength(0);
  });

  it('acha bloco de chave privada', () => {
    expect(encontrarSegredos('-----BEGIN PRIVATE KEY-----')).not.toHaveLength(0);
  });

  it('não acusa texto comum', () => {
    expect(encontrarSegredos('impressões: 120, posição média: 8.4')).toHaveLength(0);
  });

  it('não acusa a palavra token solta', () => {
    expect(encontrarSegredos('o modelo gastou 300 tokens')).toHaveLength(0);
  });
});

describe('naoMedido', () => {
  it('distingue ausência de medição de valor zero', () => {
    const m = naoMedido('exportação de links não foi feita nesta rodada');
    expect(m.medido).toBe(false);
    if (!m.medido) expect(m.motivo).toMatch(/links/);
  });
});

describe('nenhum snapshot commitado contém credencial', () => {
  const arquivos = readdirSync(SNAPSHOTS).filter((f) => f.endsWith('.json'));

  it('a pasta de snapshots existe e é legível', () => {
    expect(Array.isArray(arquivos)).toBe(true);
  });

  for (const arquivo of arquivos) {
    it(`${arquivo} está limpo`, () => {
      const achados = encontrarSegredos(readFileSync(join(SNAPSHOTS, arquivo), 'utf8'));
      expect(achados, `segredo em ${arquivo}: ${achados.join(', ')}`).toHaveLength(0);
    });
  }
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/__tests__/baseline-snapshot.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/baseline/snapshot"`.

- [ ] **Step 3: Criar a pasta de snapshots**

```bash
mkdir -p orm/baseline/snapshots && touch orm/baseline/snapshots/.gitkeep
```

- [ ] **Step 4: Escrever a implementação mínima**

Crie `src/lib/baseline/snapshot.ts`:

```ts
/**
 * Forma do snapshot e a trava que impede credencial de vazar para arquivo
 * commitado.
 *
 * `Medido<T>` existe para uma distinção que inverte a leitura do diff se for
 * perdida: "não medido" e "zero" são coisas diferentes. Uma rodada sem a
 * exportação de links não tem zero link — ela não tem medição de link.
 */

import type { Citacao } from './citacao';

export type Medido<T> = { medido: true; valor: T } | { medido: false; motivo: string };

export const naoMedido = (motivo: string): Medido<never> => ({ medido: false, motivo });

export interface LinhaBusca {
  consulta: string;
  grupo: string;
  impressoes: number;
  cliques: number;
  posicao: number;
  ctr: number;
}

export interface LinhaLink {
  dominio: string;
  links: number;
}

export interface LinhaRastreio {
  robo: string;
  requisicoes: number;
}

export interface ResultadoSonda {
  prompt: string;
  modelo: string;
  execucoes: number;
  citou: number;
  mencionou: number;
  homonimo: number;
}

export interface Snapshot {
  versao: number;
  data: string;
  busca: Medido<LinhaBusca[]>;
  links: Medido<LinhaLink[]>;
  modelos: Medido<ResultadoSonda[]>;
  rastreio: Medido<LinhaRastreio[]>;
}

export const resumirCitacoes = (
  prompt: string,
  modelo: string,
  citacoes: Citacao[],
): ResultadoSonda => ({
  prompt,
  modelo,
  execucoes: citacoes.length,
  citou: citacoes.filter((c) => c.citouSite).length,
  mencionou: citacoes.filter((c) => c.mencionouNome).length,
  homonimo: citacoes.filter((c) => c.confundiuHomonimo).length,
});

/**
 * Padrões de segredo. Cada um casa com a forma da chave, não com a palavra
 * que a nomeia — "token" no meio de uma frase não é vazamento.
 */
const PADROES: Array<[string, RegExp]> = [
  ['chave Google', /\bAIza[0-9A-Za-z_-]{30,}/],
  ['token OAuth Google', /\bya29\.[0-9A-Za-z_-]{20,}/],
  ['token GitHub', /\bgh[pousr]_[0-9A-Za-z]{30,}/],
  ['chave OpenAI', /\bsk-[0-9A-Za-z_-]{20,}/],
  ['chave Anthropic', /\bsk-ant-[0-9A-Za-z_-]{20,}/],
  ['refresh token', /"refresh_token"\s*:\s*"[^"]+"/],
  ['client secret', /"client_secret"\s*:\s*"[^"]+"/],
  ['chave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

export function encontrarSegredos(texto: string): string[] {
  return PADROES.filter(([, re]) => re.test(texto)).map(([nome]) => nome);
}
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run src/__tests__/baseline-snapshot.test.ts`
Expected: PASS — 9 testes (a pasta de snapshots ainda está vazia, então o laço final não gera caso).

- [ ] **Step 6: Commit**

```bash
git add src/lib/baseline/snapshot.ts src/__tests__/baseline-snapshot.test.ts orm/baseline/snapshots/.gitkeep
git commit -m "feat(baseline): forma do snapshot e trava contra credencial"
```

---

### Task 4: Parser do CSV de links

O relatório de Links não tem API — conferido na documentação da Search Console API, que expõe apenas Search Analytics, Sitemaps, Sites e URL Inspection. A exportação é manual; o parse é código.

**Files:**
- Create: `src/lib/baseline/links-csv.ts`
- Create: `scripts/baseline-links.ts`
- Create: `orm/baseline/links/README.md`
- Modify: `package.json` — adicionar script `baseline:links`
- Test: `src/__tests__/baseline-links-csv.test.ts`

**Interfaces:**
- Consumes: `LinhaLink`, `Medido`, `naoMedido` da Task 3.
- Produces: `function parseLinksCsv(csv: string): LinhaLink[]`; arquivo `orm/baseline/snapshots/AAAA-MM-DD-links.json`.

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/__tests__/baseline-links-csv.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseLinksCsv } from '@/lib/baseline/links-csv';

const CSV = `Site,Links de entrada
exemplo.com.br,42
"outro, com vírgula.com",7
terceiro.org,1
`;

describe('parseLinksCsv', () => {
  it('lê domínio e contagem', () => {
    const linhas = parseLinksCsv(CSV);
    expect(linhas).toHaveLength(3);
    expect(linhas[0]).toEqual({ dominio: 'exemplo.com.br', links: 42 });
  });

  it('respeita campo entre aspas com vírgula dentro', () => {
    expect(parseLinksCsv(CSV)[1]).toEqual({ dominio: 'outro, com vírgula.com', links: 7 });
  });

  it('descarta o cabeçalho', () => {
    expect(parseLinksCsv(CSV).some((l) => l.dominio === 'Site')).toBe(false);
  });

  it('ignora linha em branco no fim', () => {
    expect(parseLinksCsv(CSV + '\n\n')).toHaveLength(3);
  });

  it('devolve lista vazia para CSV só com cabeçalho', () => {
    expect(parseLinksCsv('Site,Links de entrada\n')).toEqual([]);
  });

  it('rejeita contagem não numérica em vez de virar NaN', () => {
    expect(() => parseLinksCsv('Site,Links\nexemplo.com,muitos\n')).toThrow(/numérica/);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/__tests__/baseline-links-csv.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/baseline/links-csv"`.

- [ ] **Step 3: Escrever a implementação mínima**

Crie `src/lib/baseline/links-csv.ts`:

```ts
/**
 * Lê a exportação CSV do relatório de Links do Search Console.
 *
 * O relatório não tem endpoint de API — a Search Console API expõe apenas
 * Search Analytics, Sitemaps, Sites e URL Inspection. A exportação é feita à
 * mão no painel, uma vez por rodada. A alternativa seria raspar a interface:
 * não suportado, e quebra sem aviso.
 */

import type { LinhaLink } from './snapshot';

/** CSV mínimo: campo entre aspas pode conter vírgula; aspas duplas escapam. */
const campos = (linha: string): string[] => {
  const out: string[] = [];
  let atual = '';
  let dentro = false;

  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      if (dentro && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else {
        dentro = !dentro;
      }
    } else if (c === ',' && !dentro) {
      out.push(atual);
      atual = '';
    } else {
      atual += c;
    }
  }
  out.push(atual);
  return out;
};

export function parseLinksCsv(csv: string): LinhaLink[] {
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length <= 1) return [];

  return linhas.slice(1).map((linha) => {
    const [dominio, bruto] = campos(linha);
    const links = Number(bruto);
    if (!Number.isFinite(links)) {
      throw new Error(`contagem não numérica para "${dominio}": "${bruto}"`);
    }
    return { dominio, links };
  });
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/__tests__/baseline-links-csv.test.ts`
Expected: PASS — 6 testes.

- [ ] **Step 5: Documentar o passo manual**

Crie `orm/baseline/links/README.md`:

```markdown
# Exportação de links

O relatório de Links do Search Console não tem API. A Search Console API
expõe apenas Search Analytics, Sitemaps, Sites e URL Inspection.

Uma vez por rodada de medição:

1. Abrir o Search Console na propriedade `sc-domain:ricardoesper.com.br`.
2. Links, e exportar "Sites com mais links" em CSV.
3. Salvar aqui como `AAAA-MM-DD-links.csv`, com a data da exportação.

Se a exportação não for feita, o snapshot registra a dimensão como não medida,
com o motivo. Isso é diferente de registrar zero link — e confundir os dois
inverteria a leitura do diff entre duas rodadas.
```

- [ ] **Step 6: Escrever o executor**

Sem isto o parser seria código morto: o CSV seria exportado e nunca lido.

Crie `scripts/baseline-links.ts`:

```ts
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
```

- [ ] **Step 7: Registrar o script**

Em `package.json`, junto dos outros de baseline:

```json
    "baseline:links": "tsx scripts/baseline-links.ts",
```

Sem `--env-file`: este não usa credencial nenhuma.

- [ ] **Step 8: Executar contra a pasta vazia**

Run: `npm run baseline:links`
Expected: `gravado AAAA-MM-DD-links.json — não medido: nenhuma exportação CSV...`

Este é o caminho que prova que ausência de medição é registrada como ausência, e não como zero. Apague o arquivo gerado antes de commitar — ele será regerado com dado real na Task 7:

```bash
rm orm/baseline/snapshots/*-links.json
```

- [ ] **Step 9: Commit**

```bash
git add src/lib/baseline/links-csv.ts src/__tests__/baseline-links-csv.test.ts scripts/baseline-links.ts orm/baseline/links/README.md package.json
git commit -m "feat(baseline): parser e executor da exportação de links"
```

---

### Task 5: Coletor do Search Console

Primeira tarefa com rede. Mora em `scripts/`, fora do alcance do Vitest e da varredura de terceiros.

**Files:**
- Create: `scripts/baseline-gsc.ts`
- Modify: `package.json` — adicionar script `baseline:gsc`
- Create: `.env.baseline.example`
- Modify: `.gitignore` — garantir que `.env.baseline` está ignorado

**Interfaces:**
- Consumes: `validarConsultas`, `GRUPOS` (Task 1); `LinhaBusca`, `Medido` (Task 3).
- Produces: arquivo `orm/baseline/snapshots/AAAA-MM-DD-busca.json` com `{ versao, data, busca }` no formato `Medido<LinhaBusca[]>`.

- [ ] **Step 1: Conferir que o segredo não pode ser commitado**

```bash
grep -n "^\.env" .gitignore
```

Expected: já existe entrada cobrindo `.env*`. Se não existir, adicione `.env.baseline` ao `.gitignore` antes de seguir. Nenhum passo posterior pode rodar sem isso.

- [ ] **Step 2: Escrever o exemplo de ambiente**

Crie `.env.baseline.example` — só nomes, nunca valores:

```bash
# Credenciais OAuth do Google, escopo https://www.googleapis.com/auth/webmasters.readonly
# Obtidas no Google Cloud Console. Copie para .env.baseline, que é ignorado pelo git.
GSC_CLIENT_ID=
GSC_CLIENT_SECRET=
GSC_REFRESH_TOKEN=
GSC_SITE_URL=sc-domain:ricardoesper.com.br
```

- [ ] **Step 3: Escrever o coletor**

Crie `scripts/baseline-gsc.ts`:

```ts
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
```

- [ ] **Step 4: Registrar o script**

Em `package.json`, dentro de `"scripts"`, logo depois de `"setup-gemini-vercel"`:

```json
    "baseline:gsc": "tsx --env-file=.env.baseline scripts/baseline-gsc.ts",
```

- [ ] **Step 5: Conferir que a suíte continua passando**

Run: `npm test`
Expected: PASS. O arquivo novo está em `scripts/`, fora de `src/`, então nem o Vitest nem o `sem-terceiros.test.ts` o alcançam — este passo confirma exatamente isso.

- [ ] **Step 6: Commit**

```bash
git add scripts/baseline-gsc.ts package.json .env.baseline.example
git commit -m "feat(baseline): coletor de desempenho de busca do search console"
```

---

### Task 6: Sonda de modelo

**Files:**
- Create: `orm/baseline/prompts.json`
- Create: `scripts/baseline-sonda.ts`
- Modify: `package.json` — adicionar script `baseline:sonda`
- Modify: `.env.baseline.example` — adicionar as chaves dos provedores

**Interfaces:**
- Consumes: `detectarCitacao` (Task 2); `resumirCitacoes`, `ResultadoSonda`, `Medido` (Task 3).
- Produces: arquivo `orm/baseline/snapshots/AAAA-MM-DD-modelos.json`.

- [ ] **Step 1: Criar o conjunto de prompts**

Crie `orm/baseline/prompts.json`. São perguntas que uma pessoa faria, não consultas de busca:

```json
{
  "versao": 1,
  "execucoes": 5,
  "prompts": [
    "Quem é Ricardo Esper?",
    "Quem são especialistas brasileiros em contraespionagem corporativa?",
    "Quem pode auditar ISO 42001 no Brasil?",
    "Que profissionais brasileiros escrevem sobre governança de IA e segurança?",
    "Who are notable CISOs working in Brazilian healthtech?"
  ]
}
```

- [ ] **Step 2: Estender o exemplo de ambiente**

Acrescente ao fim de `.env.baseline.example`:

```bash
# Sonda de modelo. Só os provedores que você quiser medir precisam estar preenchidos.
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

- [ ] **Step 3: Escrever a sonda**

Crie `scripts/baseline-sonda.ts`:

```ts
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
  const j = (await r.json()) as { choices: Array<{ message: { content: string } }> };
  return j.choices[0].message.content;
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

  const resultados: ResultadoSonda[] = [];

  for (const modelo of disponiveis) {
    for (const prompt of cfg.prompts) {
      const citacoes = [];
      for (let i = 0; i < cfg.execucoes; i++) {
        const resposta = await modelo.perguntar(prompt);
        citacoes.push(detectarCitacao(resposta));
      }
      const resumo = resumirCitacoes(prompt, modelo.nome, citacoes);
      resultados.push(resumo);
      console.log(
        `${modelo.nome} | ${resumo.citou}/${resumo.execucoes} citou | ${resumo.homonimo} homônimo | ${prompt}`,
      );
    }
  }

  const naoMedidos = MODELOS.filter((m) => !process.env[m.chave]).map((m) => m.nome);
  const hoje = new Date().toISOString().slice(0, 10);
  const modelos: Medido<ResultadoSonda[]> = { medido: true, valor: resultados };

  const destino = join(RAIZ, 'orm/baseline/snapshots');
  mkdirSync(destino, { recursive: true });
  writeFileSync(
    join(destino, `${hoje}-modelos.json`),
    JSON.stringify({ versao: 1, data: hoje, naoMedidos, modelos }, null, 2) + '\n',
  );

  console.log(`gravado ${hoje}-modelos.json`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
```

- [ ] **Step 4: Registrar o script**

Em `package.json`, logo abaixo de `"baseline:gsc"`:

```json
    "baseline:sonda": "tsx --env-file=.env.baseline scripts/baseline-sonda.ts",
```

- [ ] **Step 5: Rodar a suíte**

Run: `npm test`
Expected: PASS — inclusive `baseline-snapshot.test.ts`, que agora varre a pasta de snapshots e não deve achar credencial.

- [ ] **Step 6: Commit**

```bash
git add orm/baseline/prompts.json scripts/baseline-sonda.ts package.json .env.baseline.example
git commit -m "feat(baseline): sonda de citação em modelo de linguagem"
```

---

### Task 7: Primeira execução e conferência de sanidade

Fecha o subprojeto. É a única tarefa que produz dado real, e a única que exige as credenciais configuradas.

**Files:**
- Create: `orm/baseline/snapshots/AAAA-MM-DD-busca.json` (gerado pelo coletor)
- Create: `orm/baseline/snapshots/AAAA-MM-DD-links.json` (gerado pelo executor)
- Create: `orm/baseline/snapshots/AAAA-MM-DD-modelos.json` (gerado pela sonda)
- Create: `orm/baseline/snapshots/AAAA-MM-DD-rastreio.json` (escrito à mão)
- Create: `orm/baseline/snapshots/AAAA-MM-DD-sanidade.md` (escrito à mão)
- Create: `orm/baseline/links/AAAA-MM-DD-links.csv` (exportado à mão)
- Modify: `orm/README.md` — apontar a pasta `baseline/`

**Interfaces:**
- Consumes: tudo das Tasks 1 a 6.
- Produces: o primeiro snapshot. Nada depende dele dentro deste plano; o #2 depende.

- [ ] **Step 1: Configurar as credenciais**

```bash
cp .env.baseline.example .env.baseline
```

Preencha `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET` e `GSC_REFRESH_TOKEN` com credenciais OAuth criadas no Google Cloud Console, escopo `https://www.googleapis.com/auth/webmasters.readonly`. Preencha ao menos uma chave de provedor de modelo.

Confirme que o arquivo não será commitado:

```bash
git check-ignore -v .env.baseline
```

Expected: imprime a regra do `.gitignore` que o cobre. **Se não imprimir nada, pare** — o arquivo não está ignorado e nenhum passo seguinte pode rodar.

- [ ] **Step 2: Coletar busca**

Run: `npm run baseline:gsc`
Expected: imprime `gravado AAAA-MM-DD-busca.json — N do conjunto, M fora` e cria o arquivo.

- [ ] **Step 3: Exportar os links à mão**

Siga `orm/baseline/links/README.md`: Search Console, propriedade `sc-domain:ricardoesper.com.br`, Links, exportar "Sites com mais links" em CSV, salvar como `orm/baseline/links/AAAA-MM-DD-links.csv`.

- [ ] **Step 4: Consolidar os links**

Run: `npm run baseline:links`
Expected: `gravado AAAA-MM-DD-links.json — N domínios`. Se disser "não medido", o CSV não foi salvo no lugar certo — volte ao passo anterior.

- [ ] **Step 5: Rodar a sonda**

Run: `npm run baseline:sonda`
Expected: uma linha por prompt por modelo, e o arquivo `AAAA-MM-DD-modelos.json`.

- [ ] **Step 6: Registrar o rastreio de robô de IA**

No painel do Cloudflare, na zona `ricardoesper.com.br`, abra a visão de robôs de IA e anote, para os últimos 30 dias, quantas requisições vieram de GPTBot, OAI-SearchBot, ClaudeBot, Claude-SearchBot, PerplexityBot e Google-Extended.

Crie `orm/baseline/snapshots/AAAA-MM-DD-rastreio.json` à mão:

```json
{
  "versao": 1,
  "data": "AAAA-MM-DD",
  "janela": "30 dias",
  "origem": "painel Cloudflare, leitura manual",
  "rastreio": {
    "medido": true,
    "valor": [
      { "robo": "GPTBot", "requisicoes": 0 },
      { "robo": "OAI-SearchBot", "requisicoes": 0 },
      { "robo": "ClaudeBot", "requisicoes": 0 },
      { "robo": "Claude-SearchBot", "requisicoes": 0 },
      { "robo": "PerplexityBot", "requisicoes": 0 },
      { "robo": "Google-Extended", "requisicoes": 0 }
    ]
  }
}
```

Substitua cada zero pelo número lido. Se a visão não existir no plano da zona, troque o bloco `rastreio` por:

```json
  "rastreio": { "medido": false, "motivo": "visão de robôs de IA indisponível no painel" }
```

Leitura manual de propósito: escrever coletor contra uma API do Cloudflare que ninguém conferiu é exatamente o erro que o spec deste subprojeto já precisou corrigir uma vez, com o relatório de Links. Quando alguém confirmar qual superfície expõe o dado, automatizar vira tarefa de uma linha — e o formato do arquivo já estará certo.

- [ ] **Step 7: Conferência manual de sanidade**

Execute **uma vez**, à mão, nas interfaces de consumo — ChatGPT, Claude, Perplexity e Gemini — os cinco prompts de `orm/baseline/prompts.json`. Registre em `orm/baseline/snapshots/AAAA-MM-DD-sanidade.md`:

```markdown
# Conferência de sanidade — AAAA-MM-DD

Feita uma vez, à mão, nas interfaces de consumo. Não vira rotina: não é
reprodutível e ninguém a mantém além do segundo mês. Existe para responder uma
pergunta só — a sonda por API mede a mesma coisa que o leitor vê?

| Prompt | Interface | Citou o site? | Confundiu homônimo? |
|---|---|---|---|
| Quem é Ricardo Esper? | ChatGPT | | |
| Quem é Ricardo Esper? | Claude | | |
| Quem é Ricardo Esper? | Perplexity | | |
| Quem é Ricardo Esper? | Gemini | | |

## Divergência com a sonda por API

(Registre aqui onde o resultado manual diferiu do automático, e em que direção.
Se divergir muito, a métrica da sonda precisa de ressalva no #2 — não de
correção: as duas medem coisas diferentes, de propósito.)
```

Preencha a tabela com o que observar.

- [ ] **Step 8: Rodar a suíte com dado real**

Run: `npm test`
Expected: PASS. Agora `baseline-snapshot.test.ts` tem arquivos de verdade para varrer — é a primeira vez que a trava de credencial é exercida contra saída real, e é o ponto do plano onde ela importa.

- [ ] **Step 9: Apontar a pasta no README do ORM**

Em `orm/README.md`, na seção `## Estrutura`, acrescente a linha à lista:

```
    baseline/     medição de exposição: consultas, prompts e snapshots datados
```

- [ ] **Step 10: Commit**

```bash
git add orm/baseline/snapshots orm/baseline/links orm/README.md
git commit -m "feat(baseline): primeira medição de exposição"
```

---

## Notas de execução

**O que este plano deliberadamente não faz**, e não é esquecimento:

- **Sem painel.** O produto é o diff entre dois arquivos. Painel é onde este tipo de projeto morre.
- **Sem agendamento.** Rodar à mão basta até existir a segunda medição. Automatizar cadência antes disso é adivinhar.
- **Sem prospecção.** Exige ferramenta paga e pertence ao subprojeto #4.
- **Rastreio de robô sem coletor automático.** A dimensão é medida — à mão, no painel do Cloudflare, na Task 7 — mas não tem script. Automatizá-la exige confirmar qual superfície do Cloudflare expõe o dado por API, o que não foi verificado. Escrever coletor contra API não conferida foi exatamente o erro que o spec deste subprojeto precisou corrigir uma vez, com o relatório de Links. O formato do arquivo já está no lugar certo: quando a superfície for confirmada, automatizar é tarefa pequena.

**Dois passos manuais, ambos deliberados:** a exportação de links e a leitura de rastreio. Somados, custam poucos minutos por rodada mensal. A alternativa seria raspar duas interfaces não suportadas, e a manutenção disso custaria mais que o subprojeto inteiro.
