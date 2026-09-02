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
});
