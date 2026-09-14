import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarConsultas } from '@/lib/baseline/consultas';

const ARQUIVO = join(__dirname, '..', '..', 'orm', 'baseline', 'consultas.json');

const valido = {
  versao: 1,
  atualizado: '2026-09-14',
  grupos: {
    navegacional: ['ricardo esper'],
    categoria_pt: ['auditor líder iso 27001'],
    categoria_en: ['iso 42001 lead auditor'],
  },
};

describe('validarConsultas', () => {
  it('aceita um conjunto bem formado', () => {
    expect(validarConsultas(valido).versao).toBe(1);
  });

  it('rejeita grupo ausente', () => {
    const semEn = { ...valido, grupos: { ...valido.grupos } };
    delete (semEn.grupos as Record<string, unknown>).categoria_en;
    expect(() => validarConsultas(semEn)).toThrow(/categoria_en/);
  });

  it('rejeita grupo vazio', () => {
    const vazio = { ...valido, grupos: { ...valido.grupos, categoria_pt: [] } };
    expect(() => validarConsultas(vazio)).toThrow(/vazio/);
  });

  it('rejeita consulta duplicada, mesmo entre grupos diferentes', () => {
    const dup = {
      ...valido,
      grupos: { ...valido.grupos, categoria_pt: ['ricardo esper'] },
    };
    expect(() => validarConsultas(dup)).toThrow(/duplicada/);
  });

  it('rejeita consulta com espaço sobrando ou maiúscula', () => {
    const sujo = { ...valido, grupos: { ...valido.grupos, categoria_pt: [' LGPD '] } };
    expect(() => validarConsultas(sujo)).toThrow(/normalizada/);
  });

  it('rejeita data fora do formato AAAA-MM-DD', () => {
    expect(() => validarConsultas({ ...valido, atualizado: '14/09/2026' })).toThrow(/atualizado/);
  });
});

describe('o arquivo de dados versionado', () => {
  const conjunto = validarConsultas(JSON.parse(readFileSync(ARQUIVO, 'utf8')));

  it('é válido', () => {
    expect(conjunto.versao).toBeGreaterThan(0);
  });

  it('tem consulta em todos os três grupos', () => {
    expect(conjunto.grupos.navegacional.length).toBeGreaterThan(0);
    expect(conjunto.grupos.categoria_pt.length).toBeGreaterThan(0);
    expect(conjunto.grupos.categoria_en.length).toBeGreaterThan(0);
  });

  it('mantém o inglês restrito — o acervo em /en tem 7 posts', () => {
    expect(conjunto.grupos.categoria_en.length).toBeLessThanOrEqual(5);
  });
});
