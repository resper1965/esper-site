import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * A capa de um post existia no banco (`cover_image`) e não chegava a lugar
 * nenhum que o leitor visse:
 *
 *  1. `og:image` apontava sempre para o cartão gerado `/opengraph-image`,
 *     ignorando a capa — então LinkedIn, WhatsApp e Google mostravam o cartão
 *     genérico. Pior: o JSON-LD da mesma página já preferia a capa, então as
 *     duas fontes de verdade discordavam entre si.
 *  2. A capa não era exibida em nenhum lugar dentro do artigo.
 *  3. `image_alt` era gravado no D1 e nunca mapeado para o frontMatter, então
 *     o texto alternativo se perdia entre o banco e a página.
 *
 * O redesign trocou a marcação — a capa passou a ser um `next/image` com as
 * dimensões declaradas, em vez de uma div com `aspect-[1200/630]` —, e as
 * asserções seguem a marcação nova. As três propriedades são as mesmas.
 */

const SRC = join(__dirname, '..');
const pagina = readFileSync(join(SRC, 'app', '[lang]', 'blog', '[slug]', 'page.tsx'), 'utf8');
const componente = readFileSync(join(SRC, 'components', 'blog-post-content.tsx'), 'utf8');
const repo = readFileSync(join(SRC, 'lib', 'cloudflare', 'posts.ts'), 'utf8');

describe('og:image usa a capa quando ela existe', () => {
  it('a metadata lê coverImage', () => {
    expect(pagina).toMatch(/coverImage/);
  });

  it('o cartão gerado vira fallback, não o padrão', () => {
    // Afirma sobre a expressão, não sobre posições no arquivo: comentários
    // mencionam `opengraph-image` e fariam um indexOf medir a coisa errada.
    const semComentarios = pagina.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    // cover ? <capa> : <cartão gerado>
    expect(semComentarios).toMatch(/cover\s*\n?\s*\?[\s\S]{0,120}opengraph-image/);
  });
});

describe('a capa é exibida dentro do artigo', () => {
  it('o componente renderiza a capa quando ela existe', () => {
    expect(componente).toMatch(/\{fm\.coverImage\s*&&/);
  });

  it('declara 1200x630 para não saltar o layout', () => {
    // Com width e height, o navegador reserva a proporção antes de baixar a
    // imagem — o mesmo efeito que o `aspect-[1200/630]` tinha na versão
    // anterior, e o que evita o salto de layout.
    expect(componente).toMatch(/width=\{1200\}/);
    expect(componente).toMatch(/height=\{630\}/);
  });

  it('o alt cai no título quando não há imageAlt', () => {
    expect(componente).toMatch(/fm\.imageAlt\s*\|\|\s*fm\.title/);
  });
});

describe('image_alt chega do banco até a página', () => {
  it('o tipo do frontMatter declara imageAlt', () => {
    expect(repo).toMatch(/imageAlt\?:\s*string/);
  });

  it('o mapeador lê a coluna image_alt', () => {
    expect(repo).toMatch(/imageAlt:\s*row\.image_alt/);
  });
});
