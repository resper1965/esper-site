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

describe('Aparições', () => {
  it('só entram veículos independentes no subjectOf', async () => {
    const { independentAppearances, appearances } = await import('@/lib/appearances');
    expect(independentAppearances().every((a) => a.outlet.independent)).toBe(true);
    expect(appearances.length).toBeGreaterThan(0);
  });
  it('o Person declara subjectOf com o veículo nomeado', async () => {
    const { generatePersonSchema } = await import('@/lib/metadata');
    const p = generatePersonSchema('pt-BR') as Record<string, unknown>;
    const subj = p.subjectOf as Array<Record<string, unknown>>;
    expect(subj.length).toBeGreaterThan(0);
    expect((subj[0].publisher as Record<string, string>).name).toBeTruthy();
  });
  it('não emite uploadDate quando a data não foi confirmada', async () => {
    const { generateAppearanceSchema } = await import('@/lib/metadata');
    const { appearances } = await import('@/lib/appearances');
    const semData = appearances.find((a) => !a.publishedDate);
    if (semData) {
      const s = generateAppearanceSchema(semData, 'pt-BR') as Record<string, unknown>;
      expect(s).not.toHaveProperty('uploadDate');
    }
  });
  it('a aparição aponta o Ricardo como about, não como performer', async () => {
    const { generateAppearanceSchema } = await import('@/lib/metadata');
    const { appearances } = await import('@/lib/appearances');
    const s = generateAppearanceSchema(appearances[0], 'pt-BR') as Record<string, unknown>;
    expect((s.about as Record<string, string>)['@id']).toMatch(/\/sobre#person$/);
    expect(s).not.toHaveProperty('performer');
  });
});

describe('Data só com o ano', () => {
  it('reconhece o formato', async () => {
    const { isYearOnly } = await import('@/lib/talks');
    expect(isYearOnly('2024')).toBe(true);
    expect(isYearOnly('2026-09-10T19:00:00-03:00')).toBe(false);
  });
  it('nunca conta como "em breve", por mais no futuro que o ano pareça', async () => {
    const { upcomingTalks } = await import('@/lib/talks');
    const ids = upcomingTalks(new Date('2020-01-01')).map((t) => t.id);
    expect(ids).not.toContain('microsoft-reactor-cybersecurity-night-2024');
  });
  it('e sempre conta como passado', async () => {
    const { pastTalks } = await import('@/lib/talks');
    const ids = pastTalks(new Date('2020-01-01')).map((t) => t.id);
    expect(ids).toContain('microsoft-reactor-cybersecurity-night-2024');
  });
  it('o schema emite o ano como startDate, sem inventar dia', async () => {
    const { generateEventSchema } = await import('@/lib/metadata');
    const { talks } = await import('@/lib/talks');
    const ms = talks.find((t) => t.id === 'microsoft-reactor-cybersecurity-night-2024')!;
    const s = generateEventSchema(ms, 'pt-BR') as Record<string, unknown>;
    expect(s.startDate).toBe('2024');
  });
  it('nomeia a Microsoft como organizadora', async () => {
    const { generateEventSchema } = await import('@/lib/metadata');
    const { talks } = await import('@/lib/talks');
    const ms = talks.find((t) => t.id === 'microsoft-reactor-cybersecurity-night-2024')!;
    const s = generateEventSchema(ms, 'pt-BR') as Record<string, unknown>;
    expect((s.organizer as Record<string, string>).name).toContain('Microsoft');
  });
});
