import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * O site não processa dados de quem lê. Isso não é uma intenção declarada num
 * texto — é uma propriedade verificável do que o navegador recebe:
 *
 *   - nenhum script de terceiro (analytics, pixel, tag manager, embed);
 *   - nenhuma fonte remota — `next/font` baixa no build e serve do domínio;
 *   - nenhum cookie;
 *   - `connect-src 'self'`, então nem uma requisição de saída escapa.
 *
 * A propriedade some com um `import` distraído. Estes testes são a trava:
 * se alguém reintroduzir um terceiro, a suíte quebra antes do deploy.
 */

const SRC = join(__dirname, '..');
const CONFIG = join(__dirname, '..', '..', 'next.config.ts');

/** Domínios de terceiro que já estiveram no projeto ou tendem a voltar. */
const TERCEIROS = [
  'googletagmanager.com',
  'google-analytics.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cloudflareinsights.com',
  'platform.twitter.com',
  'connect.facebook.net',
  'snap.licdn.com',
  'static.hotjar.com',
  'clarity.ms',
  'plausible.io',
];

const csp = (): string => {
  const src = readFileSync(CONFIG, 'utf8');
  // A política do site é a do bloco que exclui `/img/`; a de `/img/` é
  // `default-src 'none'; sandbox` e não interessa aqui.
  const m = [...src.matchAll(/'Content-Security-Policy',\s*\n?\s*value:\s*"([^"]+)"/g)];
  const politicas = m.map((x) => x[1]);
  const doSite = politicas.find((p) => p.includes("default-src 'self'"));
  expect(doSite, 'CSP do site não encontrada em next.config.ts').toBeDefined();
  return doSite as string;
};

const arquivosFonte = (dir: string): string[] => {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '__tests__' || e.name === 'node_modules') continue;
      out.push(...arquivosFonte(p));
    } else if (/\.(ts|tsx)$/.test(e.name) && statSync(p).isFile()) {
      out.push(p);
    }
  }
  return out;
};

describe('a CSP não autoriza terceiro algum', () => {
  for (const dominio of TERCEIROS) {
    it(`não permite ${dominio}`, () => {
      expect(csp()).not.toContain(dominio);
    });
  }

  it("connect-src é apenas 'self'", () => {
    expect(csp()).toContain("connect-src 'self';");
  });

  it("nenhum iframe: frame-src é 'none'", () => {
    expect(csp()).toContain("frame-src 'none'");
  });

  it("script-src não lista origem externa", () => {
    const m = csp().match(/script-src ([^;]+);/);
    expect(m, 'script-src ausente').not.toBeNull();
    expect(m![1]).not.toMatch(/https?:\/\//);
  });
});

describe('nenhum código do site carrega terceiro', () => {
  const fontes = arquivosFonte(SRC);

  it('encontra os arquivos do projeto', () => {
    expect(fontes.length).toBeGreaterThan(20);
  });

  for (const dominio of TERCEIROS) {
    it(`nenhum arquivo referencia ${dominio}`, () => {
      const culpados = fontes.filter((f) => readFileSync(f, 'utf8').includes(dominio));
      expect(culpados, `referenciam ${dominio}: ${culpados.join(', ')}`).toHaveLength(0);
    });
  }

  it('não existe componente de analytics', () => {
    const culpados = fontes.filter((f) => /\bgtag\(|dataLayer|data-cf-beacon/.test(readFileSync(f, 'utf8')));
    expect(culpados, `resquício de analytics em: ${culpados.join(', ')}`).toHaveLength(0);
  });
});
