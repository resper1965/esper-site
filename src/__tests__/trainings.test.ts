import { describe, it, expect } from 'vitest';
import { certifications, trainings, certificationBadges } from '@/lib/credentials';
import { generatePersonSchema } from '@/lib/metadata';

/**
 * Curso concluído não é exame prestado.
 *
 * O herói mostra um contador de "Certificações" alimentado por
 * `certifications.length`. Se um treinamento entrar naquela lista, o número
 * cresce e o rótulo passa a mentir — que é o erro que `credentials.ts` foi
 * escrito para corrigir. Estes testes prendem a separação.
 */
describe('treinamentos', () => {
  it('não contam como certificação', () => {
    const badges = certificationBadges();
    for (const t of trainings) {
      expect(badges).not.toContain(t.name['pt-BR']);
      expect(certifications.map((c) => c.short)).not.toContain(t.id);
    }
  });

  it('o curso de TSCM traz fornecedor e data', () => {
    const tscm = trainings.find((t) => t.id === 'rei-countermeasures-core-concepts-2009');
    expect(tscm).toBeDefined();
    expect(tscm!.provider.name).toContain('Research Electronics International');
    expect(tscm!.completed).toBe('2009-10');
  });

  it('o schema separa os dois por credentialCategory', () => {
    const person = generatePersonSchema('pt-BR') as {
      hasCredential: Array<Record<string, unknown>>;
      knowsAbout: string[];
    };
    const cats = person.hasCredential.map((c) => c.credentialCategory);
    expect(cats).toContain('certification');
    expect(cats).toContain('training');

    const treino = person.hasCredential.filter((c) => c.credentialCategory === 'training');
    expect(treino).toHaveLength(trainings.length);
    for (const t of treino) {
      expect(t.recognizedBy).toBeDefined();
      expect(t.dateCreated).toBeTruthy();
    }
  });

  it('dá lastro ao TSCM que o knowsAbout já declarava', () => {
    const person = generatePersonSchema('pt-BR') as {
      hasCredential: Array<Record<string, unknown>>;
      knowsAbout: string[];
    };
    expect(person.knowsAbout).toContain('TSCM');
    const nomes = person.hasCredential.map((c) => String(c.name)).join(' ');
    expect(nomes).toContain('TSCM');
  });
});
