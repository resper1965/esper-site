import { describe, it, expect } from 'vitest';
import { generateEventSchema } from '@/lib/metadata';
import { talks, upcomingTalks } from '@/lib/talks';

describe('Event schema', () => {
  const s = generateEventSchema(talks[0], 'pt-BR') as Record<string, unknown>;
  it('usa VirtualLocation para evento online', () => {
    expect((s.location as Record<string,string>)['@type']).toBe('VirtualLocation');
  });
  it('aponta o performer para o mesmo @id do Person', () => {
    expect((s.performer as Record<string,string>)['@id']).toMatch(/\/sobre#person$/);
  });
  it('tem startDate com offset explícito', () => {
    expect(s.startDate).toMatch(/[+-]\d{2}:\d{2}$/);
  });
  it('nomeia a organização anfitriã', () => {
    expect((s.organizer as Record<string,string>).name).toContain('IBDEE');
  });
  it('a aula do IBDEE ainda é futura hoje', () => {
    expect(upcomingTalks(new Date('2026-09-02')).map(t => t.id)).toContain('ibdee-cco-2026');
  });
  it('e deixa de ser depois da data', () => {
    expect(upcomingTalks(new Date('2026-09-11')).map(t => t.id)).not.toContain('ibdee-cco-2026');
  });

  it('usa o mesmo @id nos dois idiomas — a palestra é uma só', () => {
    const pt = generateEventSchema(talks[0], 'pt-BR') as Record<string, unknown>;
    const en = generateEventSchema(talks[0], 'en') as Record<string, unknown>;
    expect(pt['@id']).toBe(en['@id']);
    expect(String(pt['@id'])).not.toContain('/pt-BR/');
  });
  it('mas traduz o texto', () => {
    const pt = generateEventSchema(talks[0], 'pt-BR') as Record<string, unknown>;
    const en = generateEventSchema(talks[0], 'en') as Record<string, unknown>;
    expect(pt.name).not.toBe(en.name);
  });
  it('não inventa URL de sala quando não há accessUrl', () => {
    const t = { ...talks[0], accessUrl: undefined, registrationUrl: undefined };
    const s = generateEventSchema(t, 'pt-BR') as Record<string, unknown>;
    expect(s.location).not.toHaveProperty('url');
    expect(s).not.toHaveProperty('url');
  });
  it('prefere accessUrl a registrationUrl quando a sala é conhecida', () => {
    const t = { ...talks[0], accessUrl: 'https://sala.example/aula' };
    const s = generateEventSchema(t, 'pt-BR') as Record<string, unknown>;
    expect((s.location as Record<string, string>).url).toBe('https://sala.example/aula');
  });
});
