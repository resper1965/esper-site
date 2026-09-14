import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generatePageMetadata } from '../lib/metadata';

/**
 * Todo post era servido nos dois locales, com o mesmo conteúdo, e o
 * `hreflang` declarava os dois como tradução um do outro.
 *
 * Medido em produção antes da correção:
 *   /pt-BR/blog/ai-data-privacy-risks      → título em inglês
 *   /en/blog/iso-42001-governanca-de-ia    → título em português
 *   posts com o mesmo slug nos dois idiomas → 0
 *
 * Ou seja: 46 textos ocupando 92 URLs, e o site dizendo ao Google "esta é a
 * versão em inglês" enquanto entregava português. O Google trata divergência
 * de hreflang descartando o agrupamento — então o custo não era só duplicata.
 */

const paginaPost = readFileSync(
  join(__dirname, '..', 'app', '[lang]', 'blog', '[slug]', 'page.tsx'),
  'utf8'
);

describe('hreflang declara só o idioma que existe', () => {
  it('página em um idioma só não declara alternate do outro', () => {
    const m = generatePageMetadata({
      title: 'Post em português',
      description: 'd',
      path: '/blog/um-post',
      lang: 'pt-BR',
      availableLocales: ['pt-BR'],
    });
    const langs = m.alternates?.languages ?? {};
    expect(Object.keys(langs)).toEqual(['pt-BR']);
    expect(langs).not.toHaveProperty('en');
  });

  it('o canonical aponta para a URL do próprio idioma', () => {
    const m = generatePageMetadata({
      title: 'Post em inglês',
      description: 'd',
      path: '/blog/a-post',
      lang: 'en',
      availableLocales: ['en'],
    });
    expect(m.alternates?.canonical).toContain('/en/blog/a-post');
  });

  it('openGraph.alternateLocale também não inventa idioma', () => {
    const m = generatePageMetadata({
      title: 'x', description: 'd', path: '/blog/x',
      lang: 'pt-BR', availableLocales: ['pt-BR'],
    });
    expect(m.openGraph?.alternateLocale ?? []).toHaveLength(0);
  });

  it('página estática continua declarando os dois idiomas', () => {
    // O padrão não muda: sobre, palestras e home existem nos dois.
    const m = generatePageMetadata({ title: 'Sobre', description: 'd', path: '/sobre' });
    expect(Object.keys(m.alternates?.languages ?? {}).sort()).toEqual(['en', 'pt-BR']);
  });
});

describe('a URL do idioma errado não serve o post', () => {
  it('a página redireciona quando o locale não bate com o do post', () => {
    expect(paginaPost).toContain('permanentRedirect');
    expect(paginaPost).toMatch(/lang\s*!==\s*postLang/);
  });

  it('o redirect leva para a URL do idioma do post', () => {
    expect(paginaPost).toMatch(/permanentRedirect\(`\/\$\{postLang\}\/blog\/\$\{slug\}`\)/);
  });

  it('a metadata do post passa availableLocales', () => {
    expect(paginaPost).toMatch(/availableLocales:\s*\[postLang\]/);
  });
});
