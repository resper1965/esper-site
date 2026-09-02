import { describe, it, expect } from 'vitest';
import { generateWorkSchema } from '@/lib/metadata';
import { works, worksByYear } from '@/lib/works';

describe('Obras publicadas', () => {
  const w = works[0];
  const s = generateWorkSchema(w, 'pt-BR') as Record<string, unknown>;

  it('o Ricardo é contributor, nunca author', () => {
    // Prefaciar não é escrever. Atribuir a ele a autoria de um livro de
    // terceiro custaria a credibilidade de tudo o mais na página.
    expect((s.contributor as Record<string, string>)['@id']).toMatch(/\/sobre#person$/);
    expect((s.author as Record<string, string>).name).not.toBe('Ricardo Esper');
  });
  it('nomeia o autor real da obra', () => {
    expect((s.author as Record<string, string>).name).toBe('Luis Fernando Baptistella');
  });
  it('omite datePublished e isbn quando não confirmados', () => {
    expect(w.year).toBeUndefined();
    expect(s).not.toHaveProperty('datePublished');
    expect(s).not.toHaveProperty('isbn');
  });
  it('mas emite datePublished quando o ano existe', () => {
    const comAno = { ...w, year: 2024 };
    const s2 = generateWorkSchema(comAno, 'pt-BR') as Record<string, unknown>;
    expect(s2.datePublished).toBe('2024');
  });
  it('ordena as sem ano por último', () => {
    const ordenado = worksByYear();
    const idx = ordenado.findIndex((x) => x.year === undefined);
    const depois = ordenado.slice(idx);
    expect(depois.every((x) => x.year === undefined)).toBe(true);
  });
});
