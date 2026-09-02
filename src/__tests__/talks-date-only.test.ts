import { describe, it, expect } from 'vitest';
import { talks, isDateOnly, isYearOnly, talkInstant, upcomingTalks } from '@/lib/talks';

/**
 * Uma data sem hora não é um instante.
 *
 * `new Date('2024-04-18')` é meia-noite UTC, e meia-noite UTC em São Paulo é
 * 21:00 do dia 17. A página chegou a exibir a palestra do IBDEE um dia antes
 * da data impressa no card do evento — e com um horário inventado. Estes
 * testes prendem a distinção entre as três precisões que o campo aceita.
 */
describe('precisão de startDate', () => {
  it('separa ano, dia e instante', () => {
    expect(isYearOnly('2024')).toBe(true);
    expect(isDateOnly('2024')).toBe(false);

    expect(isDateOnly('2024-04-18')).toBe(true);
    expect(isYearOnly('2024-04-18')).toBe(false);

    expect(isDateOnly('2022-05-11T09:30:00-03:00')).toBe(false);
    expect(isYearOnly('2022-05-11T09:30:00-03:00')).toBe(false);
  });

  it('formata uma data sem hora no dia que ela diz', () => {
    const dia = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date('2024-04-18'));
    expect(dia).toContain('18');
    expect(dia).toContain('abril');
  });

  it('mantém a data sem hora futura até o fim do dia em São Paulo', () => {
    const inicio = talkInstant('2024-04-18');
    // 18/04 às 20:00 em São Paulo ainda é o dia da palestra.
    expect(inicio.getTime()).toBeGreaterThan(
      new Date('2024-04-18T20:00:00-03:00').getTime(),
    );
    // 19/04 já passou.
    expect(inicio.getTime()).toBeLessThan(
      new Date('2024-04-19T00:00:00-03:00').getTime(),
    );
  });

  it('não promove nenhuma palestra passada a "em breve"', () => {
    const ids = new Set(upcomingTalks(new Date('2026-09-02T00:00:00Z')).map((t) => t.id));
    for (const t of talks) {
      if (t.startDate.startsWith('2024') || t.startDate.startsWith('2022')) {
        expect(ids.has(t.id)).toBe(false);
      }
    }
  });
});
