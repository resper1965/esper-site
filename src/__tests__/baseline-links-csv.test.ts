import { describe, it, expect } from 'vitest';
import { parseLinksCsv } from '@/lib/baseline/links-csv';

const CSV = `Site,Links de entrada
exemplo.com.br,42
"outro, com vírgula.com",7
terceiro.org,1
`;

describe('parseLinksCsv', () => {
  it('lê domínio e contagem', () => {
    const linhas = parseLinksCsv(CSV);
    expect(linhas).toHaveLength(3);
    expect(linhas[0]).toEqual({ dominio: 'exemplo.com.br', links: 42 });
  });

  it('respeita campo entre aspas com vírgula dentro', () => {
    expect(parseLinksCsv(CSV)[1]).toEqual({ dominio: 'outro, com vírgula.com', links: 7 });
  });

  it('descarta o cabeçalho', () => {
    expect(parseLinksCsv(CSV).some((l) => l.dominio === 'Site')).toBe(false);
  });

  it('ignora linha em branco no fim', () => {
    expect(parseLinksCsv(CSV + '\n\n')).toHaveLength(3);
  });

  it('devolve lista vazia para CSV só com cabeçalho', () => {
    expect(parseLinksCsv('Site,Links de entrada\n')).toEqual([]);
  });

  it('rejeita contagem não numérica em vez de virar NaN', () => {
    expect(() => parseLinksCsv('Site,Links\nexemplo.com,muitos\n')).toThrow(/numérica/);
  });

  it('rejeita contagem vazia em vez de virar zero', () => {
    expect(() => parseLinksCsv('Site,Links\nexemplo.com,\n')).toThrow(/numérica/);
  });

  // Exportação pt-BR escreve 1.234 para mil duzentos e trinta e quatro. A
  // guarda antiga rejeitava — correto contra a divisão por mil, mas rejeitava
  // junto todo dado legítimo acima de mil. Agora quem decide é o idioma
  // declarado, não o formato do valor.
  it('lê o separador de milhar pt-BR como milhar', () => {
    expect(parseLinksCsv('Site,Links\nexemplo.com,1.234\n')).toEqual([
      { dominio: 'exemplo.com', links: 1234 },
    ]);
  });

  // "1.000" é o valor redondo mais comum da exportação pt-BR. Number() devolve
  // 1 — inteiro, e portanto invisível para uma guarda de Number.isInteger.
  it('lê o milhar redondo "1.000" como mil, não como um', () => {
    expect(parseLinksCsv('Site,Links\nexemplo.com,1.000\n')[0].links).toBe(1000);
  });

  // Em inglês os separadores trocam de papel, e o mesmo texto vira outro
  // número. O parâmetro existe para isso não ser adivinhado.
  it('lê o separador de milhar inglês quando o idioma é en', () => {
    expect(parseLinksCsv('Site,Links\nexemplo.com,"1,234"\n', 'en')).toEqual([
      { dominio: 'exemplo.com', links: 1234 },
    ]);
  });

  // Grupo de dois dígitos não é milhar em idioma nenhum: é dado malformado.
  it('rejeita separador de milhar em posição inválida', () => {
    expect(() => parseLinksCsv('Site,Links\nexemplo.com,1.23\n')).toThrow(/numérica/);
  });

  it('rejeita hexadecimal em vez de lê-lo como 16', () => {
    expect(() => parseLinksCsv('Site,Links\nexemplo.com,0x10\n')).toThrow(/numérica/);
  });

  it('rejeita notação científica em vez de lê-la como 1000', () => {
    expect(() => parseLinksCsv('Site,Links\nexemplo.com,1e3\n')).toThrow(/numérica/);
  });

  it('rejeita contagem negativa', () => {
    expect(() => parseLinksCsv('Site,Links\nexemplo.com,-5\n')).toThrow(/numérica/);
  });

  it('rejeita linha com mais campos que o esperado', () => {
    expect(() => parseLinksCsv('Site,Links\nexemplo.com,3,sobra\n')).toThrow(/esperado 2/);
  });
});
