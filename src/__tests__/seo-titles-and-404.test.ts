import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ptBR from '../i18n/dictionaries/pt-BR.json';
import en from '../i18n/dictionaries/en.json';

const APP = join(__dirname, '..', 'app');

/**
 * `notFound()` só produz 404 em respostas NÃO transmitidas por streaming.
 * Um `loading.tsx` no segmento — ou em qualquer ancestral — cria um limite de
 * <Suspense>, a resposta passa a ser streamed, e o cabeçalho 200 já saiu antes
 * de o `notFound()` acontecer. O resultado é um "soft 404": página de erro
 * servida com status 200, que o Google trata como conteúdo real.
 *
 * Medido em produção: /pt-BR/blog/<slug-inexistente> devolvia 200.
 * https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
describe('soft 404: nenhum loading.tsx acima de quem chama notFound()', () => {
  const callsNotFound = (dir: string): string[] => {
    const out: string[] = [];
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) out.push(...callsNotFound(p));
      else if (e.name === 'page.tsx') {
        const src = readFileSync(p, 'utf8');
        if (src.includes('notFound()')) out.push(dir);
      }
    }
    return out;
  };

  it.each(callsNotFound(APP))(
    '%s não tem loading.tsx em si nem em nenhum ancestral',
    (segment: string) => {
      const offenders: string[] = [];
      let dir = segment;
      while (dir.startsWith(APP)) {
        if (existsSync(join(dir, 'loading.tsx'))) offenders.push(dir);
        dir = join(dir, '..');
      }
      expect(offenders).toEqual([]);
    }
  );
});

/**
 * `site.name` é o sufixo do template de título. Enquanto ele era
 * "Ricardo Esper - Blog" e também servia de título padrão, a home saía
 * "Ricardo Esper - Blog - Ricardo Esper - Blog" — sufixo sobre sufixo — e
 * rotulava o site inteiro como blog.
 */
describe('títulos', () => {
  it.each([
    ['pt-BR', ptBR],
    ['en', en],
  ])('%s: o sufixo é a pessoa, não o formato', (_l, dict: typeof ptBR) => {
    expect(dict.site.name).toBe('Ricardo Esper');
    expect(dict.site.name).not.toMatch(/blog/i);
  });

  it.each([
    ['pt-BR', ptBR],
    ['en', en],
  ])('%s: a home tem título próprio, distinto do sufixo', (_l, dict: typeof ptBR) => {
    expect(dict.site.homeTitle).toBeTruthy();
    expect(dict.site.homeTitle).not.toBe(dict.site.name);
    expect(dict.site.homeTitle).toContain('Ricardo Esper');
    // o título tem de dizer o que ele é, não só quem ele é
    expect(dict.site.homeTitle.length).toBeGreaterThan(dict.site.name.length + 10);
  });

  it.each([
    ['pt-BR', ptBR],
    ['en', en],
  ])('%s: o título da home não repete o sufixo dentro de si', (_l, dict: typeof ptBR) => {
    const ocorrencias = dict.site.homeTitle.split(dict.site.name).length - 1;
    expect(ocorrencias).toBe(1);
  });
});
