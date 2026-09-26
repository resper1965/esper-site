import { describe, it, expect } from 'vitest';
import { parseNumero, parseContagem } from '@/lib/baseline/numero';

describe('parseNumero', () => {
  it('lê o separador de milhar pt-BR como milhar', () => {
    expect(parseNumero('1.234', 'pt')).toBe(1234);
  });

  it('lê o milhar redondo pt-BR "1.000" como mil, não como um', () => {
    expect(parseNumero('1.000', 'pt')).toBe(1000);
  });

  it('lê o mesmo texto em inglês como decimal, porque o idioma é declarado', () => {
    expect(parseNumero('1.234', 'en')).toBe(1.234);
  });

  it('lê o separador decimal pt-BR', () => {
    expect(parseNumero('8,41', 'pt')).toBe(8.41);
  });

  it('descarta o sufixo de porcentagem', () => {
    expect(parseNumero('5,26%', 'pt')).toBe(5.26);
    expect(parseNumero('5.26%', 'en')).toBe(5.26);
  });

  it('lê o separador de milhar inglês como milhar', () => {
    expect(parseNumero('1,234', 'en')).toBe(1234);
  });

  it('lê milhar encadeado', () => {
    expect(parseNumero('1.234.567', 'pt')).toBe(1234567);
    expect(parseNumero('1,234,567', 'en')).toBe(1234567);
  });

  it('lê milhar e decimal na mesma string', () => {
    expect(parseNumero('1.234,56', 'pt')).toBe(1234.56);
    expect(parseNumero('1,234.56', 'en')).toBe(1234.56);
  });

  it('ignora espaço em volta e dentro', () => {
    expect(parseNumero('  42 ', 'pt')).toBe(42);
  });

  it('rejeita campo vazio em vez de virar zero', () => {
    expect(() => parseNumero('', 'pt')).toThrow(/vazio/);
    expect(() => parseNumero('   ', 'pt')).toThrow(/vazio/);
  });

  it('rejeita texto não numérico', () => {
    expect(() => parseNumero('abc', 'pt')).toThrow(/não numérico/);
  });

  // "1.23" em pt-BR não é nem milhar (grupo de dois dígitos) nem decimal:
  // é dado malformado, e adivinhar qual dos dois seria o defeito de volta.
  it('rejeita grupo de milhar com menos de três dígitos em vez de adivinhar', () => {
    expect(() => parseNumero('1.23', 'pt')).toThrow(/milhar em posição inválida/);
    expect(() => parseNumero('1,23', 'en')).toThrow(/milhar em posição inválida/);
  });

  it('rejeita hexadecimal e notação científica', () => {
    expect(() => parseNumero('0x10', 'pt')).toThrow(/não numérico/);
    expect(() => parseNumero('1e3', 'pt')).toThrow(/não numérico/);
  });
});

describe('parseContagem', () => {
  it('aceita inteiro não negativo', () => {
    expect(parseContagem('1.234', 'pt')).toBe(1234);
    expect(parseContagem('0', 'pt')).toBe(0);
  });

  it('rejeita resultado fracionário', () => {
    expect(() => parseContagem('8,41', 'pt')).toThrow(/contagem inválida/);
  });

  it('rejeita contagem negativa', () => {
    expect(() => parseContagem('-5', 'pt')).toThrow(/contagem inválida/);
  });
});
