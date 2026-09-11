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
  it('o componente renderiza postImage', () => {
    expect(componente).toMatch(/\{postImage\s*&&/);
  });

  it('reserva a proporção 1200x630 para não saltar o layout', () => {
    expect(componente).toContain('aspect-[1200/630]');
  });

  it('o alt cai no título quando não há imageAlt', () => {
    expect(componente).toMatch(/imageAlt\s*\|\|\s*post\.frontMatter\.title/);
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
