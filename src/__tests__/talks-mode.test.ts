import { describe, it, expect } from 'vitest';
import { generateEventSchema } from '@/lib/metadata';
import { talks } from '@/lib/talks';

describe('Formato desconhecido', () => {
  const c = talks.find((t) => t.id === 'ibdee-congresso-2024-fraudes-do-futuro')!;
  const s = generateEventSchema(c, 'pt-BR') as Record<string, unknown>;
  it('omite eventAttendanceMode quando o modo não foi informado', () => {
    expect(c.mode).toBeUndefined();
    expect(s).not.toHaveProperty('eventAttendanceMode');
  });
  it('e omite location, em vez de inventar um Place vazio', () => {
    expect(s).not.toHaveProperty('location');
  });
  it('mas mantém a data completa que o material trazia', () => {
    expect(s.startDate).toBe('2024-04-18');
  });
  it('o evento online segue com VirtualLocation', () => {
    const ib = talks.find((t) => t.id === 'ibdee-cco-2026')!;
    const so = generateEventSchema(ib, 'pt-BR') as Record<string, unknown>;
    expect((so.location as Record<string,string>)['@type']).toBe('VirtualLocation');
    expect(so.eventAttendanceMode).toContain('Online');
  });
});
