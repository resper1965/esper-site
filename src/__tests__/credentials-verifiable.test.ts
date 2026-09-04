import { describe, it, expect } from 'vitest';
import { certifications } from '@/lib/credentials';
import { generatePersonSchema } from '@/lib/metadata';

/**
 * Uma certificação com número confere; uma só com nome, não.
 *
 * As duas ISO saem do mesmo exame PC01E09 da Global PCS. Se o número ou o
 * emissor sumirem do schema, o `hasCredential` volta a ser uma lista de
 * nomes — que é exatamente o que qualquer um pode escrever sobre si mesmo.
 */
describe('credenciais verificáveis', () => {
  const iso = certifications.filter((c) => c.short.startsWith('ISO'));

  it('as duas ISO trazem emissor e número', () => {
    expect(iso).toHaveLength(2);
    for (const c of iso) {
      expect(c.identifier).toBe('PC01E090056');
      expect(c.issuer?.name).toBe('Global PCS Certificações');
      expect(c.dateIssued).toBe('2026-08-20');
    }
  });

  it('o schema emite recognizedBy e identifier onde há emissor', () => {
    const person = generatePersonSchema('pt-BR') as {
      hasCredential: Array<Record<string, unknown>>;
    };
    // Filtra por categoria, não só por "tem emissor": treinamento também
    // traz `recognizedBy`, e a afirmação aqui é sobre as duas ISO.
    const comEmissor = person.hasCredential.filter(
      (c) => c.credentialCategory === 'certification' && 'recognizedBy' in c
    );
    expect(comEmissor).toHaveLength(2);
    for (const c of comEmissor) {
      expect(c.identifier).toMatchObject({ value: 'PC01E090056' });
      expect(c.credentialCategory).toBe('certification');
    }
  });

  it('não inventa emissor para as credenciais sem documento', () => {
    const person = generatePersonSchema('pt-BR') as {
      hasCredential: Array<Record<string, unknown>>;
    };
    const semEmissor = person.hasCredential.filter(
      (c) => c.credentialCategory === 'certification' && !('recognizedBy' in c)
    );
    expect(semEmissor.length).toBeGreaterThan(0);
    for (const c of semEmissor) {
      expect(c).not.toHaveProperty('identifier');
    }
  });
});
