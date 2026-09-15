# Adequação de Identidade — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a Fase A de checklist em medição — um coletor que responde quais fatos canônicos cada fonte externa carrega hoje — e corrigir os dois defeitos que impediram a sonda de medir o modelo da OpenAI.

**Architecture:** Fatos canônicos e registro de fontes são arquivos de dados versionados. A detecção de fato em texto é lógica pura em `src/lib/baseline/`, testada. A busca das fontes é rede e mora em `scripts/`. Mesma fronteira do resto do baseline.

**Tech Stack:** TypeScript, Vitest, `tsx`, `fetch` nativo do Node. Nenhuma dependência nova.

**Spec:** `orm/identidade/textos-canonicos.md` — carrega o diagnóstico medido, a regra da repetição literal e o inventário das fontes.

## Global Constraints

- **Vitest só enxerga `src/**`** — `include: ['src/**/*.{test,spec}.{ts,tsx}']`. Lógica testável em `src/lib/baseline/`.
- **Nada de rede em `src/`** — `src/__tests__/sem-terceiros.test.ts` varre todo `.ts`/`.tsx` sob `src/` procurando domínio de terceiro e quebra o build. Busca HTTP vai para `scripts/`.
- **Nenhuma credencial no repositório.** Este plano não usa credencial alguma: todas as fontes são páginas públicas.
- **`orm/` não entra no build.**
- **Commits convencionais, em português**, assunto até 100 caracteres. O `subject-case` do commitlint **recusa assunto que comece com palavra em caixa alta** — comece em minúscula.
- **`git commit` dentro da mesma invocação de `nvm use 20`**, senão o hook `commit-msg` do husky quebra sob o Node 18 do sistema.
- **Rodar a suíte:** `npm test`. Um arquivo: `npx vitest run src/__tests__/<arquivo>.test.ts`.
- **Estado inicial:** 300 testes, 33 arquivos, verdes; `npx tsc --noEmit` e `npm run typecheck:scripts` limpos.

## O que este plano NÃO faz

Preencher LinkedIn, about.me, YouTube, Crunchbase, `ness.com.br`, `forense.io` e `ionic.health`. Isso é ação manual em plataforma de terceiro, e os textos prontos estão no spec. O plano constrói o **instrumento que mede se foi feito**, não faz.

---

### Task 1: Fatos canônicos

**Files:**
- Create: `orm/identidade/fatos.json`
- Create: `src/lib/baseline/fatos.ts`
- Test: `src/__tests__/baseline-fatos.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `interface Fato { id: string; rotulo: string; termos: string[] }`; `interface ConjuntoFatos { versao: number; atualizado: string; nome: string; fatos: Fato[] }`; `function validarFatos(dados: unknown): ConjuntoFatos`; `function fatosPresentes(texto: string, conjunto: ConjuntoFatos): string[]`.

**Por que detecção literal aqui é legítima, e não foi na sonda:** perguntar "este texto contém a string ISO 27001" é questão de continência, que regex decide. Perguntar "sobre quem este texto fala" é julgamento de referência, que regex não decide — e foi por isso que aquela medição saiu da automação. Não confunda os dois casos ao ler este plano.

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/__tests__/baseline-fatos.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarFatos, fatosPresentes } from '@/lib/baseline/fatos';

const ARQUIVO = join(__dirname, '..', '..', 'orm', 'identidade', 'fatos.json');

const valido = {
  versao: 1,
  atualizado: '2026-09-15',
  nome: 'Ricardo Esper',
  fatos: [
    { id: 'cargo', rotulo: 'CISO da IONIC Health', termos: ['ciso', 'ionic'] },
    { id: 'ness_1991', rotulo: 'fundador da NESS em 1991', termos: ['ness', '1991'] },
  ],
};

describe('validarFatos', () => {
  it('aceita um conjunto bem formado', () => {
    expect(validarFatos(valido).fatos).toHaveLength(2);
  });

  it('rejeita fato sem termo', () => {
    const vazio = { ...valido, fatos: [{ id: 'x', rotulo: 'x', termos: [] }] };
    expect(() => validarFatos(vazio)).toThrow(/termos/);
  });

  it('rejeita id duplicado', () => {
    const dup = { ...valido, fatos: [valido.fatos[0], valido.fatos[0]] };
    expect(() => validarFatos(dup)).toThrow(/duplicado/);
  });

  it('rejeita lista de fatos vazia', () => {
    expect(() => validarFatos({ ...valido, fatos: [] })).toThrow(/vazia/);
  });

  it('rejeita data fora do formato AAAA-MM-DD', () => {
    expect(() => validarFatos({ ...valido, atualizado: '15/09/2026' })).toThrow(/atualizado/);
  });
});

describe('fatosPresentes', () => {
  const c = validarFatos(valido);

  it('exige TODOS os termos do fato, não qualquer um', () => {
    expect(fatosPresentes('Ricardo é CISO em outra empresa', c)).toEqual([]);
    expect(fatosPresentes('CISO da IONIC Health', c)).toEqual(['cargo']);
  });

  it('ignora caixa e acento', () => {
    expect(fatosPresentes('Ciso da Iônic Health', c)).toEqual(['cargo']);
  });

  it('acha mais de um fato no mesmo texto', () => {
    const t = 'CISO da IONIC Health, fundador da NESS em 1991';
    expect(fatosPresentes(t, c).sort()).toEqual(['cargo', 'ness_1991']);
  });

  it('texto vazio não carrega fato nenhum', () => {
    expect(fatosPresentes('', c)).toEqual([]);
  });
});

describe('o arquivo de dados versionado', () => {
  const c = validarFatos(JSON.parse(readFileSync(ARQUIVO, 'utf8')));

  it('é válido e tem o nome certo', () => {
    expect(c.nome).toBe('Ricardo Esper');
    expect(c.fatos.length).toBeGreaterThanOrEqual(5);
  });

  it('não declara a ISO 42001 como obtida', () => {
    const ids = c.fatos.map((f) => f.id).join(' ');
    expect(ids).not.toMatch(/42001/);
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/__tests__/baseline-fatos.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/baseline/fatos"`.

- [ ] **Step 3: Criar o arquivo de dados**

Crie `orm/identidade/fatos.json`. Os termos saem da afirmação canônica do spec:

```json
{
  "versao": 1,
  "atualizado": "2026-09-15",
  "nome": "Ricardo Esper",
  "fatos": [
    { "id": "nome", "rotulo": "o nome aparece", "termos": ["ricardo esper"] },
    { "id": "cargo", "rotulo": "CISO da IONIC Health", "termos": ["ciso", "ionic"] },
    { "id": "ness_1991", "rotulo": "fundador da NESS em 1991", "termos": ["ness", "1991"] },
    { "id": "iso27001", "rotulo": "Auditor Líder ISO/IEC 27001", "termos": ["27001"] },
    { "id": "iso27701", "rotulo": "Auditor Líder ISO/IEC 27701", "termos": ["27701"] },
    { "id": "emissor", "rotulo": "emissor e número da certificação", "termos": ["global pcs", "pc01e090056"] },
    { "id": "cciso", "rotulo": "CCISO", "termos": ["cciso"] },
    { "id": "eixos", "rotulo": "os três eixos editoriais", "termos": ["ciberseguranca", "privacidade", "contraespionagem"] },
    { "id": "site", "rotulo": "aponta para o site", "termos": ["ricardoesper.com.br"] }
  ]
}
```

Note que `eixos` está sem acento: a normalização do passo 4 remove acentos dos dois lados antes de comparar, então o termo é escrito já normalizado.

- [ ] **Step 4: Escrever a implementação mínima**

Crie `src/lib/baseline/fatos.ts`:

```ts
/**
 * Fatos canônicos e sua detecção em texto.
 *
 * Resolução de entidade se constrói por repetição literal entre fontes
 * independentes. Este módulo responde uma pergunta de continência — "este
 * texto contém estes termos?" —, que regex decide bem.
 *
 * Não confunda com a classificação da sonda, que responde "sobre quem este
 * texto fala". Aquilo é julgamento de referência, regex não decide, e saiu da
 * automação depois de três tentativas. A diferença entre as duas perguntas é a
 * razão de uma estar aqui e a outra não.
 */

export interface Fato {
  id: string;
  rotulo: string;
  termos: string[];
}

export interface ConjuntoFatos {
  versao: number;
  atualizado: string;
  nome: string;
  fatos: Fato[];
}

/** Minúscula, sem acento, espaço colapsado. Aplicada aos dois lados. */
export const normalizar = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export function validarFatos(dados: unknown): ConjuntoFatos {
  const d = dados as ConjuntoFatos;

  if (!d || typeof d !== 'object') throw new Error('conjunto de fatos não é objeto');
  if (!Number.isInteger(d.versao) || d.versao < 1) throw new Error('versao deve ser inteiro positivo');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.atualizado ?? '')) {
    throw new Error('atualizado deve estar em AAAA-MM-DD');
  }
  if (typeof d.nome !== 'string' || d.nome.length === 0) throw new Error('nome ausente');
  if (!Array.isArray(d.fatos)) throw new Error('fatos não é lista');
  if (d.fatos.length === 0) throw new Error('lista de fatos vazia');

  const vistos = new Set<string>();
  for (const f of d.fatos) {
    if (!f || typeof f.id !== 'string' || f.id.length === 0) throw new Error('fato sem id');
    if (typeof f.rotulo !== 'string' || f.rotulo.length === 0) throw new Error(`fato ${f.id} sem rotulo`);
    if (!Array.isArray(f.termos) || f.termos.length === 0) throw new Error(`fato ${f.id} sem termos`);
    if (vistos.has(f.id)) throw new Error(`id duplicado: ${f.id}`);
    vistos.add(f.id);
  }

  return d;
}

/**
 * Os ids dos fatos que o texto carrega. Um fato só conta se TODOS os seus
 * termos estiverem presentes: "CISO" sozinho não prova "CISO da IONIC Health",
 * e contar assim inflaria a cobertura de toda fonte que mencione o cargo
 * genérico.
 */
export function fatosPresentes(texto: string, conjunto: ConjuntoFatos): string[] {
  const alvo = normalizar(texto);
  return conjunto.fatos
    .filter((f) => f.termos.every((t) => alvo.includes(normalizar(t))))
    .map((f) => f.id);
}
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run src/__tests__/baseline-fatos.test.ts`
Expected: PASS — 11 testes.

- [ ] **Step 6: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS, 311 testes em 34 arquivos. Confirma que o arquivo novo em `src/lib/` não acionou o `sem-terceiros.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add orm/identidade/fatos.json src/lib/baseline/fatos.ts src/__tests__/baseline-fatos.test.ts
git commit -m "feat(identidade): fatos canônicos e detecção literal em texto"
```

---

### Task 2: Registro de fontes

**Files:**
- Create: `orm/identidade/fontes.json`
- Create: `src/lib/baseline/fontes.ts`
- Test: `src/__tests__/baseline-fontes.test.ts`

**Interfaces:**
- Consumes: `ConjuntoFatos` da Task 1.
- Produces: `type Alcance = 'total' | 'parcial'`; `interface Fonte { id: string; url: string; alcance: Alcance; esperados: string[]; controle: string }`; `interface RegistroFontes { versao: number; atualizado: string; fontes: Fonte[] }`; `function validarFontes(dados: unknown, fatos: ConjuntoFatos): RegistroFontes`.

**O campo `alcance` existe por honestidade do instrumento.** O LinkedIn serve muro de login a robô: uma busca sem sessão vê o título e a meta descrição, não o "Sobre" nem as certificações. Marcar essa fonte como `total` faria o coletor reportar ausência de fatos que estão lá, e o instrumento passaria a mentir na direção pessimista. `parcial` significa: o que não foi encontrado não é ausência, é fora de alcance.

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/__tests__/baseline-fontes.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarFontes } from '@/lib/baseline/fontes';
import { validarFatos } from '@/lib/baseline/fatos';

const RAIZ = join(__dirname, '..', '..', 'orm', 'identidade');
const fatos = validarFatos(JSON.parse(readFileSync(join(RAIZ, 'fatos.json'), 'utf8')));

const valido = {
  versao: 1,
  atualizado: '2026-09-15',
  fontes: [
    {
      id: 'github',
      url: 'https://github.com/resper1965',
      alcance: 'total',
      esperados: ['nome', 'cargo', 'site'],
      controle: 'você',
    },
  ],
};

describe('validarFontes', () => {
  it('aceita um registro bem formado', () => {
    expect(validarFontes(valido, fatos).fontes).toHaveLength(1);
  });

  it('rejeita fato esperado que não existe no conjunto de fatos', () => {
    const ruim = {
      ...valido,
      fontes: [{ ...valido.fontes[0], esperados: ['inexistente'] }],
    };
    expect(() => validarFontes(ruim, fatos)).toThrow(/inexistente/);
  });

  it('rejeita url que não seja https', () => {
    const ruim = { ...valido, fontes: [{ ...valido.fontes[0], url: 'http://exemplo.com' }] };
    expect(() => validarFontes(ruim, fatos)).toThrow(/https/);
  });

  it('rejeita alcance desconhecido', () => {
    const ruim = { ...valido, fontes: [{ ...valido.fontes[0], alcance: 'talvez' }] };
    expect(() => validarFontes(ruim, fatos)).toThrow(/alcance/);
  });

  it('rejeita id de fonte duplicado', () => {
    const dup = { ...valido, fontes: [valido.fontes[0], valido.fontes[0]] };
    expect(() => validarFontes(dup, fatos)).toThrow(/duplicado/);
  });

  it('rejeita lista de fontes vazia', () => {
    expect(() => validarFontes({ ...valido, fontes: [] }, fatos)).toThrow(/vazia/);
  });
});

describe('o registro versionado', () => {
  const r = validarFontes(JSON.parse(readFileSync(join(RAIZ, 'fontes.json'), 'utf8')), fatos);

  it('cobre as fontes que o diagnóstico mediu', () => {
    const ids = r.fontes.map((f) => f.id);
    for (const esperado of ['linkedin', 'github', 'aboutme', 'ness', 'ionic', 'forense']) {
      expect(ids).toContain(esperado);
    }
  });

  it('marca o LinkedIn como alcance parcial', () => {
    expect(r.fontes.find((f) => f.id === 'linkedin')?.alcance).toBe('parcial');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/__tests__/baseline-fontes.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/baseline/fontes"`.

- [ ] **Step 3: Criar o registro**

Crie `orm/identidade/fontes.json`:

```json
{
  "versao": 1,
  "atualizado": "2026-09-15",
  "fontes": [
    {
      "id": "linkedin",
      "url": "https://www.linkedin.com/in/ricardoesper",
      "alcance": "parcial",
      "esperados": ["nome", "cargo", "iso27001", "iso27701", "eixos"],
      "controle": "você"
    },
    {
      "id": "github",
      "url": "https://github.com/resper1965",
      "alcance": "total",
      "esperados": ["nome", "cargo", "iso27001", "iso27701", "eixos", "site"],
      "controle": "você"
    },
    {
      "id": "aboutme",
      "url": "https://about.me/resper",
      "alcance": "total",
      "esperados": ["nome", "cargo", "ness_1991", "iso27001", "iso27701", "emissor", "cciso", "eixos", "site"],
      "controle": "você"
    },
    {
      "id": "youtube",
      "url": "https://www.youtube.com/ricardoesper",
      "alcance": "parcial",
      "esperados": ["nome", "cargo", "ness_1991", "eixos", "site"],
      "controle": "você"
    },
    {
      "id": "ness",
      "url": "https://www.ness.com.br/sobre",
      "alcance": "total",
      "esperados": ["nome", "ness_1991"],
      "controle": "quem edita o site da NESS"
    },
    {
      "id": "ionic",
      "url": "https://ionic.health",
      "alcance": "total",
      "esperados": ["nome", "cargo"],
      "controle": "quem edita o site da IONIC"
    },
    {
      "id": "forense",
      "url": "https://forense.io",
      "alcance": "total",
      "esperados": ["nome"],
      "controle": "quem edita o site da forense.io"
    },
    {
      "id": "site",
      "url": "https://www.ricardoesper.com.br/pt-BR/sobre",
      "alcance": "total",
      "esperados": ["nome", "cargo", "ness_1991", "iso27001", "iso27701", "emissor", "cciso", "eixos"],
      "controle": "você"
    }
  ]
}
```

O Crunchbase fica de fora: devolveu `403` à busca de fora em 15/09/2026, então não é mensurável e entrar no registro só produziria ruído. Conferir à mão, conforme o spec.

- [ ] **Step 4: Escrever a implementação mínima**

Crie `src/lib/baseline/fontes.ts`:

```ts
/**
 * Registro das fontes externas que devem repetir os fatos canônicos.
 *
 * `alcance` é declaração de honestidade do instrumento. O LinkedIn serve muro
 * de login a robô: sem sessão, uma busca vê título e meta descrição, não o
 * "Sobre" nem as certificações. Tratar essa fonte como `total` faria o coletor
 * reportar como ausente o que está lá — e um instrumento que erra para o
 * pessimismo é tão inútil quanto um que erra para o otimismo.
 */

import type { ConjuntoFatos } from './fatos';

export type Alcance = 'total' | 'parcial';

export interface Fonte {
  id: string;
  url: string;
  alcance: Alcance;
  esperados: string[];
  controle: string;
}

export interface RegistroFontes {
  versao: number;
  atualizado: string;
  fontes: Fonte[];
}

const ALCANCES: Alcance[] = ['total', 'parcial'];

export function validarFontes(dados: unknown, fatos: ConjuntoFatos): RegistroFontes {
  const d = dados as RegistroFontes;

  if (!d || typeof d !== 'object') throw new Error('registro de fontes não é objeto');
  if (!Number.isInteger(d.versao) || d.versao < 1) throw new Error('versao deve ser inteiro positivo');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.atualizado ?? '')) {
    throw new Error('atualizado deve estar em AAAA-MM-DD');
  }
  if (!Array.isArray(d.fontes)) throw new Error('fontes não é lista');
  if (d.fontes.length === 0) throw new Error('lista de fontes vazia');

  const idsDeFato = new Set(fatos.fatos.map((f) => f.id));
  const vistos = new Set<string>();

  for (const f of d.fontes) {
    if (!f || typeof f.id !== 'string' || f.id.length === 0) throw new Error('fonte sem id');
    if (vistos.has(f.id)) throw new Error(`id de fonte duplicado: ${f.id}`);
    vistos.add(f.id);

    if (typeof f.url !== 'string' || !f.url.startsWith('https://')) {
      throw new Error(`fonte ${f.id}: url precisa ser https`);
    }
    if (!ALCANCES.includes(f.alcance)) {
      throw new Error(`fonte ${f.id}: alcance inválido "${f.alcance}"`);
    }
    if (!Array.isArray(f.esperados) || f.esperados.length === 0) {
      throw new Error(`fonte ${f.id}: esperados vazio`);
    }
    for (const e of f.esperados) {
      if (!idsDeFato.has(e)) {
        throw new Error(`fonte ${f.id}: fato esperado "${e}" não existe em fatos.json`);
      }
    }
    if (typeof f.controle !== 'string' || f.controle.length === 0) {
      throw new Error(`fonte ${f.id}: controle ausente`);
    }
  }

  return d;
}
```

- [ ] **Step 5: Rodar e confirmar que passa**

Run: `npx vitest run src/__tests__/baseline-fontes.test.ts`
Expected: PASS — 8 testes.

- [ ] **Step 6: Commit**

```bash
git add orm/identidade/fontes.json src/lib/baseline/fontes.ts src/__tests__/baseline-fontes.test.ts
git commit -m "feat(identidade): registro de fontes com alcance declarado"
```

---

### Task 3: Cobertura por fonte

**Files:**
- Create: `src/lib/baseline/cobertura.ts`
- Test: `src/__tests__/baseline-cobertura.test.ts`

**Interfaces:**
- Consumes: `Fonte` (Task 2), `ConjuntoFatos` e `fatosPresentes` (Task 1), `Medido` e `naoMedido` de `src/lib/baseline/snapshot.ts`.
- Produces: `interface CoberturaFonte { id: string; url: string; alcance: Alcance; controle: string; esperados: string[]; presentes: string[]; ausentes: string[]; cobertura: number }`; `function calcularCobertura(fonte: Fonte, html: string, fatos: ConjuntoFatos): CoberturaFonte`.

- [ ] **Step 1: Escrever o teste que falha**

Crie `src/__tests__/baseline-cobertura.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { calcularCobertura } from '@/lib/baseline/cobertura';
import { validarFatos } from '@/lib/baseline/fatos';
import type { Fonte } from '@/lib/baseline/fontes';

const fatos = validarFatos({
  versao: 1,
  atualizado: '2026-09-15',
  nome: 'Ricardo Esper',
  fatos: [
    { id: 'nome', rotulo: 'o nome', termos: ['ricardo esper'] },
    { id: 'cargo', rotulo: 'CISO da IONIC', termos: ['ciso', 'ionic'] },
    { id: 'iso27001', rotulo: 'ISO 27001', termos: ['27001'] },
  ],
});

const fonte: Fonte = {
  id: 'exemplo',
  url: 'https://exemplo.com',
  alcance: 'total',
  esperados: ['nome', 'cargo', 'iso27001'],
  controle: 'você',
};

describe('calcularCobertura', () => {
  it('separa presentes de ausentes e calcula a fração', () => {
    const r = calcularCobertura(fonte, '<p>Ricardo Esper, CISO da IONIC Health</p>', fatos);
    expect(r.presentes.sort()).toEqual(['cargo', 'nome']);
    expect(r.ausentes).toEqual(['iso27001']);
    expect(r.cobertura).toBeCloseTo(2 / 3);
  });

  it('cobertura zero quando nada está presente', () => {
    const r = calcularCobertura(fonte, '<p>página sobre outra coisa</p>', fatos);
    expect(r.presentes).toEqual([]);
    expect(r.cobertura).toBe(0);
  });

  it('cobertura um quando tudo está presente', () => {
    const r = calcularCobertura(fonte, 'Ricardo Esper CISO IONIC 27001', fatos);
    expect(r.cobertura).toBe(1);
  });

  it('só conta fato que a fonte deveria carregar', () => {
    const restrita: Fonte = { ...fonte, esperados: ['nome'] };
    const r = calcularCobertura(restrita, 'Ricardo Esper, CISO da IONIC, ISO 27001', fatos);
    expect(r.presentes).toEqual(['nome']);
    expect(r.cobertura).toBe(1);
  });

  it('remove marcação antes de procurar, para não casar dentro de atributo', () => {
    const r = calcularCobertura(fonte, '<a href="/ciso-ionic">outra coisa</a>', fatos);
    expect(r.presentes).toEqual([]);
  });

  it('preserva alcance e controle no resultado', () => {
    const r = calcularCobertura({ ...fonte, alcance: 'parcial' }, 'nada', fatos);
    expect(r.alcance).toBe('parcial');
    expect(r.controle).toBe('você');
  });
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/__tests__/baseline-cobertura.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/baseline/cobertura"`.

- [ ] **Step 3: Escrever a implementação mínima**

Crie `src/lib/baseline/cobertura.ts`:

```ts
/**
 * Quanto de uma fonte já carrega os fatos que ela deveria carregar.
 *
 * A marcação é removida antes da busca. Sem isso, um termo casaria dentro de
 * href, class ou comentário — e a fonte apareceria como tendo um fato que
 * nenhum leitor, humano ou robô, encontraria no texto.
 */

import { fatosPresentes } from './fatos';
import type { ConjuntoFatos } from './fatos';
import type { Alcance, Fonte } from './fontes';

export interface CoberturaFonte {
  id: string;
  url: string;
  alcance: Alcance;
  controle: string;
  esperados: string[];
  presentes: string[];
  ausentes: string[];
  cobertura: number;
}

/** Tira script, style e tags, deixando o texto que alguém de fato lê. */
export const textoVisivel = (html: string): string =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ');

export function calcularCobertura(
  fonte: Fonte,
  html: string,
  fatos: ConjuntoFatos,
): CoberturaFonte {
  const noTexto = new Set(fatosPresentes(textoVisivel(html), fatos));

  const presentes = fonte.esperados.filter((id) => noTexto.has(id));
  const ausentes = fonte.esperados.filter((id) => !noTexto.has(id));

  return {
    id: fonte.id,
    url: fonte.url,
    alcance: fonte.alcance,
    controle: fonte.controle,
    esperados: fonte.esperados,
    presentes,
    ausentes,
    cobertura: presentes.length / fonte.esperados.length,
  };
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/__tests__/baseline-cobertura.test.ts`
Expected: PASS — 6 testes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/baseline/cobertura.ts src/__tests__/baseline-cobertura.test.ts
git commit -m "feat(identidade): cobertura de fatos canônicos por fonte"
```

---

### Task 4: Coletor de identidade

**Files:**
- Create: `scripts/identidade-conferir.ts`
- Modify: `package.json` — acrescentar `identidade:conferir`
- Create: `orm/identidade/snapshots/.gitkeep`

**Interfaces:**
- Consumes: `validarFatos` (Task 1), `validarFontes` (Task 2), `calcularCobertura` (Task 3), `naoMedido` de `snapshot.ts`.
- Produces: `orm/identidade/snapshots/AAAA-MM-DD-identidade.json`.

Sem credencial: todas as fontes são páginas públicas.

- [ ] **Step 1: Escrever o coletor**

Crie `scripts/identidade-conferir.ts`:

```ts
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
import type { CoberturaFonte } from '../src/lib/baseline/cobertura';
import type { Medido } from '../src/lib/baseline/snapshot';

const RAIZ = join(__dirname, '..');
const DESTINO = join(RAIZ, 'orm/identidade/snapshots');

// Navegador comum: várias fontes servem conteúdo diferente, ou nada, a um
// agente que se identifica como robô.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

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

  const coberturas: CoberturaFonte[] = [];
  const falhas: FalhaFonte[] = [];
  let n = 0;

  for (const fonte of registro.fontes) {
    n++;
    try {
      const r = await fetch(fonte.url, { headers: { 'user-agent': UA }, redirect: 'follow' });
      if (!r.ok) throw new Error(`http ${r.status}`);
      const c = calcularCobertura(fonte, await r.text(), fatos);
      coberturas.push(c);
      const pct = Math.round(c.cobertura * 100);
      const marca = c.alcance === 'parcial' ? ' (alcance parcial)' : '';
      console.log(
        `[${n}/${registro.fontes.length}] ${fonte.id.padEnd(10)} ${String(pct).padStart(3)}%  ` +
          `faltam: ${c.ausentes.join(', ') || '—'}${marca}`,
      );
    } catch (e) {
      const erro = e instanceof Error ? e.message : String(e);
      falhas.push({ id: fonte.id, url: fonte.url, erro });
      console.warn(`[${n}/${registro.fontes.length}] ${fonte.id.padEnd(10)} falhou: ${erro}`);
    }
  }

  const identidade: Medido<CoberturaFonte[]> =
    coberturas.length > 0
      ? { medido: true, valor: coberturas }
      : naoMedido('nenhuma fonte respondeu — verifique a rede');

  mkdirSync(DESTINO, { recursive: true });
  writeFileSync(
    arquivo,
    JSON.stringify(
      { versao: 1, data: hoje, fatosVersao: fatos.versao, fontesVersao: registro.versao, identidade, falhas },
      null,
      2,
    ) + '\n',
    { flag: 'wx' },
  );

  const media =
    coberturas.length > 0
      ? Math.round((coberturas.reduce((s, c) => s + c.cobertura, 0) / coberturas.length) * 100)
      : 0;
  console.log(`\ngravado ${hoje}-identidade.json — cobertura média ${media}%, ${falhas.length} falha(s)`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
```

- [ ] **Step 2: Criar a pasta de snapshots**

```bash
mkdir -p orm/identidade/snapshots && touch orm/identidade/snapshots/.gitkeep
```

- [ ] **Step 3: Registrar o script**

Em `package.json`, junto dos outros de baseline:

```json
    "identidade:conferir": "tsx scripts/identidade-conferir.ts",
```

Sem `--env-file`: não usa credencial.

- [ ] **Step 4: Executar de verdade**

Run: `npm run identidade:conferir`
Expected: uma linha por fonte com a porcentagem e os fatos que faltam, e o arquivo gravado. Esta é a **primeira medição da Fase A** — o número que você vai comparar depois de preencher os perfis.

Se alguma fonte falhar por rede, ela entra em `falhas` e a rodada continua.

- [ ] **Step 5: Conferir as duas checagens estáticas**

Run: `npx tsc --noEmit` e depois `npm run typecheck:scripts`
Expected: ambas limpas.

- [ ] **Step 6: Commit**

```bash
git add scripts/identidade-conferir.ts package.json orm/identidade/snapshots
git commit -m "feat(identidade): coletor que mede cobertura das fontes externas"
```

---

### Task 5: Corrigir a sonda da OpenAI

**Files:**
- Modify: `scripts/baseline-sonda.ts`

Os dois defeitos apareceram na primeira execução real, em 15/09/2026, e zeraram as 25 chamadas da OpenAI.

- [ ] **Step 1: Trocar o parâmetro de limite de tokens**

Na função que chama `/ai/v1/chat/completions`, o corpo usa `max_tokens`. A API responde `400 Unsupported parameter: 'max_tokens' is not supported with this model. Use 'max_completion_tokens' instead.`

Troque a chave por `max_completion_tokens`, mantendo o valor `1024`, e acrescente o comentário:

```ts
    // `max_completion_tokens`, não `max_tokens`: o gpt-5.5 recusa o segundo com
    // 400. A rota da Anthropic, em /ai/v1/messages, continua usando max_tokens,
    // que é o nome dela lá — os dois nomes coexistem de propósito.
```

Não toque na chamada da Anthropic: `/ai/v1/messages` exige `max_tokens` e funciona.

- [ ] **Step 2: Espaçar as chamadas**

A mesma execução recebeu `429 Wholesale rate limit exceeded for this gateway. Please reduce request rate or use BYOK.` A corrida é sequencial e sem pausa.

Acrescente, no topo do arquivo:

```ts
/**
 * Pausa entre chamadas pagas. O faturamento unificado do Gateway tem limite de
 * taxa, e a primeira execução real o estourou com chamadas sequenciais sem
 * intervalo. Um segundo por chamada acrescenta menos de um minuto a uma rodada
 * de 50 e evita perder metade delas.
 */
const PAUSA_MS = 1000;
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));
```

E, dentro do laço de execuções, depois de cada chamada — tanto no caminho de sucesso quanto no de falha —, `await dormir(PAUSA_MS);`. Colocar só no sucesso deixaria a rajada de erros passar sem pausa, que é justamente quando o limite já foi atingido.

- [ ] **Step 3: Corrigir o motivo automático**

Quando um modelo termina com zero execuções úteis, o script grava em `naoMedidos` o motivo `todas as chamadas falharam — id de modelo aposentado?`. Isso é palpite, e na execução real estava errado: a causa foi parâmetro e limite de taxa.

Troque por um motivo que carregue o erro observado. Guarde a última mensagem de erro por modelo e escreva:

```ts
      `todas as chamadas falharam — último erro: ${ultimoErro[modelo.nome] ?? 'desconhecido'}`
```

Motivo que descreve o que aconteceu vale mais que motivo que adivinha a causa, e este arquivo é lido meses depois.

- [ ] **Step 4: Conferir o plano e as checagens**

Run: `npm run baseline:sonda:plano`
Expected: imprime o plano e sai sem chamar nada.

Run: `npx tsc --noEmit` e `npm run typecheck:scripts`
Expected: ambas limpas.

Run: `npm test`
Expected: PASS, sem mudança na contagem — este task não acrescenta teste, porque mexe em código de rede que mora fora do alcance do Vitest por construção.

**Não execute `npm run baseline:sonda`.** Gasta crédito do dono, e a decisão é dele.

- [ ] **Step 5: Commit**

```bash
git add scripts/baseline-sonda.ts
git commit -m "fix(baseline): parâmetro de token da openai, pausa e motivo real da falha"
```

---

### Task 6: Fechar o ciclo na documentação

**Files:**
- Modify: `orm/identidade/textos-canonicos.md`
- Modify: `orm/README.md`

- [ ] **Step 1: Ligar o texto ao instrumento**

No fim de `orm/identidade/textos-canonicos.md`, antes da seção "O que medir depois", acrescente:

```markdown
## Como saber se funcionou

    npm run identidade:conferir

Busca cada fonte do registro e grava, em `orm/identidade/snapshots/`, quantos
dos fatos canônicos ela carrega. Rode **antes** de preencher qualquer coisa: o
número de hoje é o marco zero da Fase A, e sem ele o "melhorou" depois é
opinião.

Fonte marcada como alcance parcial — o LinkedIn, por muro de login, e o YouTube
— mostra menos do que tem. Ali, ausência no relatório não é ausência na página,
e o campo `alcance` no snapshot existe para que ninguém leia o número errado.
```

- [ ] **Step 2: Registrar a pasta na estrutura**

Em `orm/README.md`, na seção `## Estrutura`, acrescente a linha, mantendo a ordem alfabética:

```
    identidade/   textos canônicos das fontes externas e a medição da cobertura
```

- [ ] **Step 3: Commit**

```bash
git add orm/identidade/textos-canonicos.md orm/README.md
git commit -m "docs(identidade): liga os textos canônicos ao coletor que os mede"
```

---

## Notas de execução

**O que este plano deliberadamente não faz**, e não é esquecimento:

- **Não preenche nenhuma fonte.** Os textos estão no spec; colar é trabalho humano em plataforma de terceiro. O plano constrói o instrumento que mede se foi feito.
- **Não julga qualidade de texto.** Mede continência de fato, que é pergunta que regex responde. "Sobre quem este texto fala" continua fora da automação, pelo motivo já registrado em `src/lib/baseline/citacao.ts`.
- **Não rasteja páginas além das registradas.** O registro é curto de propósito: oito fontes que importam, não um rastreador.
- **Não mede resposta de modelo com busca ativa.** É a dimensão que mais rápido reage à Fase A, e hoje não tem instrumento. Fica para um subprojeto próprio, depois que a Fase A tiver acontecido — instrumento antes de existir o que medir foi o desequilíbrio que este plano corrige.
