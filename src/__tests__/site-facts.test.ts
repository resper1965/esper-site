import { describe, it, expect } from 'vitest';
import {
  age,
  BIRTH_DATE,
  yearsOfExperience,
  yearsInSecurity,
  TECH_START_YEAR,
  SECURITY_START_YEAR,
} from '@/lib/site';

/**
 * Os fatos biográficos do site são contas, não números escritos à mão — foi
 * assim que ele deixou de declarar "34 anos" numa página e "três décadas" na
 * outra. Contas, porém, erram de outro jeito: em silêncio, na borda.
 *
 * A idade é o caso clássico. Subtrair só os anos dá certo em setembro e passa
 * a mentir em janeiro, quando o aniversário do ano ainda não chegou. Ninguém
 * percebe, porque o número continua parecendo plausível.
 */
describe('idade', () => {
  it('conta anos completos depois do aniversário', () => {
    expect(age(new Date('2026-09-02T12:00:00Z'))).toBe(61);
  });

  it('ainda não conta o ano corrente antes do aniversário', () => {
    expect(age(new Date('2026-01-15T12:00:00Z'))).toBe(60);
  });

  it('vira no dia exato do aniversário', () => {
    expect(age(new Date('2026-03-11T12:00:00Z'))).toBe(60);
    expect(age(new Date('2026-03-12T12:00:00Z'))).toBe(61);
  });

  it('usa a data declarada como fonte', () => {
    expect(BIRTH_DATE).toBe('1965-03-12');
  });
});

/**
 * As duas carreiras são contas diferentes sobre coisas diferentes, e foram
 * separadas justamente porque o site chamava de "anos em cyber" o tempo em
 * tecnologia — contradizendo o material que o próprio Ricardo distribui.
 */
describe('tempo de carreira', () => {
  it('tecnologia conta desde 1985', () => {
    expect(TECH_START_YEAR).toBe(1985);
    expect(yearsOfExperience(new Date('2026-06-01T12:00:00Z'))).toBe(41);
  });

  it('segurança conta desde a fundação da ness, em 1991', () => {
    expect(SECURITY_START_YEAR).toBe(1991);
    expect(yearsInSecurity(new Date('2026-06-01T12:00:00Z'))).toBe(35);
  });

  it('mantém tecnologia sempre à frente de segurança', () => {
    const agora = new Date('2026-06-01T12:00:00Z');
    expect(yearsOfExperience(agora)).toBeGreaterThan(yearsInSecurity(agora));
  });
});
