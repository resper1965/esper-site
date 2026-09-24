import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { categoryRoutes, categorySlug } from '@/lib/categories';

/**
 * Dois defeitos medidos em produção:
 *
 *  1. O rodapé apontava para `/categoria/automation`, que devolvia 404 — a
 *     rota real é `homeautomation`. Link quebrado em toda página do site.
 *  2. Não existia categoria `privacy`, apesar de privacidade ser um dos eixos
 *     editoriais e de `lib/categories.ts` já trazer cor, ícone e rótulo para
 *     ela. Posts de LGPD e privacidade estavam em `general`.
 *
 * O rodapé encolheu no redesign e não linka mais categoria nenhuma — quem
 * aponta para `/categoria/<slug>` agora é o cabeçalho de cada post. O que
 * este arquivo guarda não mudou: nenhuma rota de categoria pode ficar sem
 * ligação interna, e nenhum link pode apontar para um slug inexistente.
 *
 * O slug também deixou de ser escrito à mão em quem monta o link: sai de
 * `categorySlug()`, sobre a mesma tabela que a rota consome. Era a origem do
 * defeito 1 — duas listas de slug, uma em cada arquivo.
 */

const SRC = join(__dirname, '..');
const rota = readFileSync(join(SRC, 'app', '[lang]', 'categoria', '[category]', 'page.tsx'), 'utf8');
const post = readFileSync(join(SRC, 'components', 'blog-post-content.tsx'), 'utf8');

describe('a rota e quem linka leem a mesma tabela', () => {
  it('a rota importa os slugs de lib/categories', () => {
    expect(rota).toMatch(/import \{ categoryRoutes[^}]*\} from ["']@\/lib\/categories["']/);
  });

  it('não sobrou um segundo categoryMap escrito à mão na rota', () => {
    expect(rota).not.toMatch(/const categoryMap[^=]*=\s*\{/);
  });
});

describe('as rotas de categoria têm ligação interna', () => {
  it('o cabeçalho do post linka a categoria', () => {
    expect(post).toMatch(/categoria\/\$\{slugCategoria\}/);
  });

  it('o slug vem de categorySlug, não escrito à mão', () => {
    expect(post).toMatch(/categorySlug\(fm\.category\)/);
  });
});

describe('categorySlug resolve os nomes que os posts trazem', () => {
  it('resolve o nome em inglês, que é como o D1 grava', () => {
    expect(categorySlug('Cybersecurity')).toBe('cybersecurity');
    expect(categorySlug('Home Automation')).toBe('homeautomation');
  });

  it('resolve o nome em português', () => {
    expect(categorySlug('Privacidade')).toBe('privacy');
  });

  it('não inventa slug para categoria sem rota', () => {
    expect(categorySlug('Categoria Que Não Existe')).toBeUndefined();
  });

  it('nunca devolve `automation`, que nunca existiu', () => {
    const todos = Object.values(categoryRoutes).flatMap((n) => [n.pt, n.en]);
    for (const nome of todos) {
      expect(categorySlug(nome)).not.toBe('automation');
    }
  });
});

describe('a categoria privacy existe', () => {
  it('a tabela conhece privacy', () => {
    expect(Object.keys(categoryRoutes)).toContain('privacy');
  });

  it('privacy tem rótulo nos dois idiomas', () => {
    expect(categoryRoutes.privacy).toEqual({ pt: 'Privacidade', en: 'Privacy' });
  });

  it('os três eixos editoriais têm rota', () => {
    for (const eixo of ['cybersecurity', 'privacy', 'counterespionage']) {
      expect(Object.keys(categoryRoutes), `${eixo} sem rota`).toContain(eixo);
    }
  });
});
