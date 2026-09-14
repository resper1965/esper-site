import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Dois defeitos medidos em produção:
 *
 *  1. O rodapé apontava para `/categoria/automation`, que devolvia 404 — a
 *     rota real é `homeautomation`. Link quebrado em toda página do site.
 *  2. Não existia categoria `privacy`, apesar de privacidade ser um dos eixos
 *     editoriais e de `lib/categories.ts` já trazer cor, ícone e rótulo para
 *     ela. Posts de LGPD e privacidade estavam em `general`.
 *
 * Este teste garante que todo link de categoria no rodapé aponta para uma
 * rota que existe — o que pega qualquer link novo que erre o slug.
 */

const SRC = join(__dirname, '..');
const rota = readFileSync(join(SRC, 'app', '[lang]', 'categoria', '[category]', 'page.tsx'), 'utf8');
const rodape = readFileSync(join(SRC, 'components', 'footer.tsx'), 'utf8');

/** Slugs aceitos pela rota, lidos do `categoryMap`. */
const slugsDaRota = (): string[] => {
  const bloco = rota.match(/const categoryMap[^=]*=\s*\{([\s\S]*?)\n\};/);
  expect(bloco, 'categoryMap não encontrado na rota').not.toBeNull();
  return [...bloco![1].matchAll(/^\s*([a-z]+):/gm)].map((m) => m[1]);
};

/** Slugs que o rodapé linka em /categoria/<slug>. */
const slugsDoRodape = (): string[] =>
  [...rodape.matchAll(/categoria\/([a-z]+)`/g)].map((m) => m[1]);

describe('links de categoria do rodapé', () => {
  it('o rodapé linka pelo menos três categorias', () => {
    expect(slugsDoRodape().length).toBeGreaterThanOrEqual(3);
  });

  it('todo link do rodapé existe no categoryMap da rota', () => {
    const validos = slugsDaRota();
    const quebrados = slugsDoRodape().filter((s) => !validos.includes(s));
    expect(quebrados, `sem rota: ${quebrados.join(', ')}`).toHaveLength(0);
  });

  it('não sobrou o slug `automation`, que nunca existiu', () => {
    expect(slugsDoRodape()).not.toContain('automation');
  });
});

describe('a categoria privacy existe', () => {
  it('a rota conhece privacy', () => {
    expect(slugsDaRota()).toContain('privacy');
  });

  it('privacy tem rótulo nos dois idiomas', () => {
    expect(rota).toMatch(/privacy:\s*\{\s*pt:\s*'Privacidade',\s*en:\s*'Privacy'\s*\}/);
  });

  it('os três eixos editoriais têm rota', () => {
    const validos = slugsDaRota();
    for (const eixo of ['cybersecurity', 'privacy', 'counterespionage']) {
      expect(validos, `${eixo} sem rota`).toContain(eixo);
    }
  });
});
