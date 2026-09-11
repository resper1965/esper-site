import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkGfm from 'remark-gfm';

/**
 * Dois defeitos de renderização medidos em produção, nos dois casos com a
 * mesma assinatura: a dependência estava instalada e nunca era usada.
 *
 *  1. `remark-gfm` ausente do pipeline: markdown de tabela chegava ao leitor
 *     como uma linha de pipes.
 *  2. `@tailwindcss/typography` nunca registrado: o Tailwind 4 usa configuração
 *     em CSS e não carrega `tailwind.config.ts` nem plugin por conta própria,
 *     então `prose` e todos os `prose-*` não geravam regra alguma. Como o
 *     preflight zera a margem de <p>, todo post ficou sem espaço entre
 *     parágrafos.
 */

const TABELA = ['| Técnica | Frequência |', '|---|---|', '| Texto visível | 37,8% |'].join('\n');

const render = (md: string) =>
  String(remark().use(remarkGfm).use(remarkHtml).processSync(md));

describe('markdown: tabela vira <table>, não linha de pipes', () => {
  const html = render(TABELA);

  it('produz <table>', () => expect(html).toContain('<table>'));
  it('produz cabeçalho <th>', () => expect(html).toContain('<th>'));
  it('produz célula <td>', () => expect(html).toContain('<td>'));

  it('não deixa pipe solto no texto renderizado', () => {
    const semTags = html.replace(/<[^>]+>/g, '');
    expect(semTags).not.toContain('|');
  });

  it('sem remark-gfm o pipe sobraria (prova de que o plugin é o que resolve)', () => {
    const semGfm = String(remark().use(remarkHtml).processSync(TABELA));
    expect(semGfm.replace(/<[^>]+>/g, '')).toContain('|');
  });
});

describe('Tailwind: o plugin de tipografia está registrado', () => {
  const css = readFileSync(join(__dirname, '..', 'app', 'globals.css'), 'utf8');

  it('globals.css registra @tailwindcss/typography', () => {
    expect(css).toMatch(/@plugin\s+["']@tailwindcss\/typography["']/);
  });

  it('globals.css carrega o tailwind.config.ts legado', () => {
    expect(css).toMatch(/@config\s+["'][^"']*tailwind\.config\.ts["']/);
  });

  it('o pipeline do post usa remark-gfm', () => {
    const src = readFileSync(join(__dirname, '..', 'lib', 'cloudflare', 'posts.ts'), 'utf8');
    expect(src).toContain('remarkGfm');
    expect(src).toMatch(/\.use\(remarkGfm\)/);
  });
});
