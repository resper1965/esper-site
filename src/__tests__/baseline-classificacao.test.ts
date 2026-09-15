import { describe, it, expect } from 'vitest';
import {
  lerClassificacao,
  promptDeClassificacao,
  PISO_DE_CONFIANCA,
} from '@/lib/baseline/classificacao';

describe('promptDeClassificacao', () => {
  it('carrega a resposta a julgar e pede JSON estrito', () => {
    const { system, user } = promptDeClassificacao('Ricardo Esper é CISO.');
    expect(user).toContain('Ricardo Esper é CISO.');
    expect(system).toMatch(/sujeito/);
    expect(system).toMatch(/confianca/);
    expect(system).toMatch(/justificativa/);
  });

  it('dá ao classificador os fatos de desambiguação', () => {
    const { system } = promptDeClassificacao('qualquer coisa');
    expect(system).toContain('1991');
    expect(system).toMatch(/27001/);
    expect(system).toMatch(/homonimo/);
    expect(system).toMatch(/recusa/);
  });
});

describe('lerClassificacao', () => {
  it('lê JSON limpo', () => {
    const c = lerClassificacao(
      '{"sujeito":"ele","confianca":0.9,"justificativa":"Descreve o CISO fundador da NESS."}',
    );
    expect(c.sujeito).toBe('ele');
    expect(c.confianca).toBe(0.9);
    expect(c.justificativa).toContain('NESS');
  });

  it('lê JSON cercado por prosa', () => {
    const c = lerClassificacao(
      'Claro! Analisando o texto, concluo o seguinte:\n' +
        '{"sujeito":"homonimo","confianca":0.85,"justificativa":"Fala de um médico."}\n' +
        'Espero ter ajudado.',
    );
    expect(c.sujeito).toBe('homonimo');
    expect(c.confianca).toBe(0.85);
  });

  it('lê JSON dentro de bloco de código cercado', () => {
    const c = lerClassificacao(
      '```json\n{"sujeito":"recusa","confianca":0.95,"justificativa":"Diz não ter informação."}\n```',
    );
    expect(c.sujeito).toBe('recusa');
    expect(c.confianca).toBe(0.95);
  });

  it('devolve incerto quando o sujeito não é um dos quatro', () => {
    const c = lerClassificacao('{"sujeito":"talvez","confianca":0.99,"justificativa":"x"}');
    expect(c.sujeito).toBe('incerto');
    expect(c.confianca).toBe(0);
  });

  it('devolve incerto quando faltam campos', () => {
    expect(lerClassificacao('{"sujeito":"ele"}').sujeito).toBe('incerto');
    expect(lerClassificacao('{"confianca":0.9}').sujeito).toBe('incerto');
  });

  it('força incerto abaixo do piso de confiança', () => {
    const c = lerClassificacao(
      `{"sujeito":"ele","confianca":${PISO_DE_CONFIANCA - 0.01},"justificativa":"acho que sim"}`,
    );
    expect(c.sujeito).toBe('incerto');
    expect(c.justificativa).toContain('acho que sim');
  });

  it('aceita exatamente o piso', () => {
    const c = lerClassificacao(
      `{"sujeito":"ele","confianca":${PISO_DE_CONFIANCA},"justificativa":"no limite"}`,
    );
    expect(c.sujeito).toBe('ele');
  });

  it('grampeia confiança fora de 0 a 1', () => {
    expect(
      lerClassificacao('{"sujeito":"ele","confianca":7,"justificativa":"exagerou"}').confianca,
    ).toBe(1);
    const negativo = lerClassificacao(
      '{"sujeito":"ele","confianca":-3,"justificativa":"negativa"}',
    );
    expect(negativo.confianca).toBe(0);
    expect(negativo.sujeito).toBe('incerto');
  });

  it('devolve incerto em lixo total, sem lançar', () => {
    expect(lerClassificacao('não consigo responder isso').sujeito).toBe('incerto');
    expect(lerClassificacao('').sujeito).toBe('incerto');
    expect(lerClassificacao('{ isto não é json }').sujeito).toBe('incerto');
  });
});
