import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Rascunho não é conteúdo público.
 *
 * As listagens desta camada sempre filtraram `published = 1`. A busca por
 * slug, não — e slug é derivado do título, portanto adivinhável. O efeito
 * era um post guardado para revisão sendo servido normalmente para quem
 * digitasse a URL, tanto na página do blog quanto em `GET /api/posts/[slug]`,
 * que é rota sem autenticação.
 *
 * Estes testes prendem o SQL, que é onde a garantia mora.
 */

const first = vi.fn();
vi.mock('@/lib/cloudflare/d1-client', () => ({
  db: () => ({ first, all: vi.fn().mockResolvedValue([]), execute: vi.fn() }),
}));

const { getPostBySlug } = await import('@/lib/cloudflare/posts');

beforeEach(() => {
  first.mockReset();
  first.mockResolvedValue(null);
});

describe('busca por slug', () => {
  it('filtra por published por padrão', async () => {
    await getPostBySlug('qualquer-coisa');
    const [sql] = first.mock.calls[0];
    expect(sql).toContain('published = 1');
  });

  it('só dispensa o filtro quando pedido explicitamente', async () => {
    await getPostBySlug('qualquer-coisa', { includeDrafts: true });
    const [sql] = first.mock.calls[0];
    expect(sql).not.toContain('published = 1');
  });

  it('o padrão é negar: chamada sem opções nunca vê rascunho', async () => {
    for (const opts of [undefined, {}, { includeDrafts: false }]) {
      first.mockClear();
      await getPostBySlug('x', opts as { includeDrafts?: boolean } | undefined);
      expect(first.mock.calls[0][0]).toContain('published = 1');
    }
  });
});
