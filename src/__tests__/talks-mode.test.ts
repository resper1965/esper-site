import { describe, it, expect } from 'vitest';
import { generateEventSchema } from '@/lib/metadata';
import { talks, type Talk } from '@/lib/talks';

/**
 * A regra que este arquivo guarda é "não invente o formato", não "o IBDEE
 * 2024 não tem formato". Enquanto o card do congresso era a única fonte, o
 * campo ficava ausente; o Ricardo confirmou em 09/2026 que foi presencial, e
 * o dado passou a existir.
 *
 * Por isso a omissão é testada contra uma palestra construída aqui: assim a
 * trava continua valendo mesmo quando todas as palestras reais tiverem
 * formato conhecido — que é o estado para onde a lista tende.
 */
describe('Formato desconhecido', () => {
  const semFormato: Talk = {
    id: 'evento-sem-formato',
    title: { 'pt-BR': 'Evento sem formato declarado', en: 'Event with no stated format' },
    host: { name: 'Organização qualquer' },
    startDate: '2024-04-18',
    summary: { 'pt-BR': 'Resumo.', en: 'Summary.' },
  };

  const s = generateEventSchema(semFormato, 'pt-BR') as Record<string, unknown>;

  it('omite eventAttendanceMode quando o modo não foi informado', () => {
    expect(s).not.toHaveProperty('eventAttendanceMode');
  });

  it('e omite location, em vez de inventar um Place vazio', () => {
    expect(s).not.toHaveProperty('location');
  });

  it('mantém a data completa que o material trazia', () => {
    expect(s.startDate).toBe('2024-04-18');
  });

  it('o evento online segue com VirtualLocation', () => {
    const ib = talks.find((t) => t.id === 'ibdee-cco-2026')!;
    const so = generateEventSchema(ib, 'pt-BR') as Record<string, unknown>;
    expect((so.location as Record<string, string>)['@type']).toBe('VirtualLocation');
    expect(so.eventAttendanceMode).toContain('Online');
  });
});

describe('Formato confirmado depois', () => {
  const congresso = talks.find((t) => t.id === 'ibdee-congresso-2024-fraudes-do-futuro')!;

  it('o congresso do IBDEE de 2024 é presencial', () => {
    expect(congresso.mode).toBe('presencial');
  });

  it('e o schema passa a declarar o modo', () => {
    const s = generateEventSchema(congresso, 'pt-BR') as Record<string, unknown>;
    expect(s.eventAttendanceMode).toContain('Offline');
  });
});
