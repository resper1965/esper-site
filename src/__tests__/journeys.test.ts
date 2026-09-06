import { describe, it, expect } from 'vitest';
import { journeys, journeyTimeline, travelSummary } from '@/lib/journeys';
import { COUNTRIES_VISITED } from '@/lib/site';

/**
 * A lista de viagens passou a ter duas entradas no mesmo ano, e isso quebra
 * duas suposições que estavam embutidas: que o ano servia de chave, e que o
 * resumo em prosa podia citar as viagens à mão.
 */
describe('viagens', () => {
  it('cada viagem tem id único — o ano não serve mais de chave', () => {
    const ids = journeys.map((j) => j.id);
    expect(new Set(ids).size).toBe(journeys.length);
    const anos = journeys.map((j) => j.year);
    expect(new Set(anos).size).toBeLessThan(anos.length); // há ano repetido
  });

  it('ordena por ano e, dentro do ano, por mês', () => {
    const t = journeyTimeline();
    for (let i = 1; i < t.length; i++) {
      const a = t[i - 1], b = t[i];
      expect(a.year < b.year || (a.year === b.year && (a.month ?? 0) <= (b.month ?? 0))).toBe(true);
    }
    const y2026 = t.filter((j) => j.year === 2026).map((j) => j.id);
    expect(y2026).toEqual(['machu-picchu-2026', 'lencois-maranhenses-2026']);
  });

  it('o resumo é derivado da lista, não escrito à mão', () => {
    const s = travelSummary('pt-BR');
    expect(s).toContain(String(COUNTRIES_VISITED));
    for (const j of journeys) {
      expect(s).toContain(j.name['pt-BR']);
      expect(s).toContain(String(j.year));
    }
    const en = travelSummary('en');
    for (const j of journeys) expect(en).toContain(j.name.en);
  });

  it('a viagem com post aponta para um slug', () => {
    const comPost = journeys.filter((j) => j.relatedPostSlug);
    expect(comPost.length).toBeGreaterThan(0);
    for (const j of comPost) expect(j.relatedPostSlug).toMatch(/^[a-z0-9-]+$/);
  });
});
