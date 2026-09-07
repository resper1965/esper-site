import { describe, it, expect, vi, beforeEach } from 'vitest';

// A sessão é sempre inválida: o que se testa aqui é o caminho do visitante
// anônimo. Se ele consegue renderizar o painel, a falha é de autenticação.
vi.mock('../lib/cloudflare/auth', () => ({
  verifySession: vi.fn(async () => null),
}));

import { middleware } from '../middleware';
import { NextRequest } from 'next/server';

const req = (path: string) => new NextRequest(new URL(`https://exemplo.test${path}`));

describe('middleware: o admin não é alcançável sem sessão', () => {
  beforeEach(() => vi.clearAllMocks());

  // A regressão que este arquivo existe para impedir: /pt-BR/admin devolvia
  // 200 e renderizava o painel, porque `isAdmin` era calculado sobre o
  // pathname ainda com prefixo de idioma e o rewrite retornava antes da
  // checagem de autenticação.
  it.each([
    '/admin',
    '/admin/',
    '/admin/midia',
    '/admin/settings',
    '/pt-BR/admin',
    '/pt-BR/admin/midia',
    '/pt-BR/admin/settings',
    '/en/admin',
    '/en/admin/midia',
  ])('%s redireciona para o login', async (path) => {
    const res = await middleware(req(path));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
  });

  it.each(['/admin/login', '/pt-BR/admin/login', '/en/admin/login'])(
    '%s continua acessível — é a porta',
    async (path) => {
      const res = await middleware(req(path));
      expect(res.headers.get('location') ?? '').not.toContain('/admin/login');
    }
  );

  it('não confunde um post cujo slug começa com "admin" com o painel', async () => {
    const res = await middleware(req('/pt-BR/blog/administracao-de-riscos'));
    expect(res.headers.get('location') ?? '').not.toContain('/admin/login');
  });
});
