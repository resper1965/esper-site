import { describe, it, expect } from 'vitest';
import { parseBuscaCsv } from '@/lib/baseline/busca-csv';

// Em pt-BR o separador decimal é a vírgula, que é também o separador de campo:
// a exportação precisa citar esses campos, e o parser precisa desmontar a
// citação antes de olhar o número.
const PT = `Consultas principais,Cliques,Impressões,CTR,Posição
ricardo esper,12,1.234,"5,26%","8,41"
perito digital,0,87,"0%","23,7"
`;

const EN = `Top queries,Clicks,Impressions,CTR,Position
ricardo esper,12,1234,5.26%,8.41
digital forensics,0,87,0%,23.7
`;

describe('parseBuscaCsv', () => {
  it('lê a exportação pt-BR com milhar e decimal no idioma do arquivo', () => {
    const { idioma, linhas } = parseBuscaCsv(PT);
    expect(idioma).toBe('pt');
    expect(linhas).toHaveLength(2);
    expect(linhas[0]).toEqual({
      consulta: 'ricardo esper',
      cliques: 12,
      impressoes: 1234,
      ctr: 5.26,
      posicao: 8.41,
    });
    expect(linhas[1]).toEqual({
      consulta: 'perito digital',
      cliques: 0,
      impressoes: 87,
      ctr: 0,
      posicao: 23.7,
    });
  });

  it('lê a exportação em inglês', () => {
    const { idioma, linhas } = parseBuscaCsv(EN);
    expect(idioma).toBe('en');
    expect(linhas[0]).toEqual({
      consulta: 'ricardo esper',
      cliques: 12,
      impressoes: 1234,
      ctr: 5.26,
      posicao: 8.41,
    });
  });

  it('infere o idioma pelo cabeçalho, não pela forma dos números', () => {
    // "1.234" vale 1234 no arquivo pt e 1,234 no arquivo en. Quem decide é o
    // cabeçalho, nunca uma heurística sobre o valor.
    expect(parseBuscaCsv(PT).idioma).toBe('pt');
    expect(parseBuscaCsv(EN).idioma).toBe('en');
    expect(parseBuscaCsv(PT).linhas[0].impressoes).toBe(1234);
  });

  it('aceita BOM no primeiro cabeçalho', () => {
    expect(parseBuscaCsv('﻿' + PT).idioma).toBe('pt');
  });

  it('casa cabeçalho sem distinguir maiúscula nem espaço em volta', () => {
    const csv = ` TOP QUERIES , clicks ,IMPRESSIONS, ctr , Position \nfoo,1,2,3%,4.5\n`;
    expect(parseBuscaCsv(csv).linhas[0]).toEqual({
      consulta: 'foo',
      cliques: 1,
      impressoes: 2,
      ctr: 3,
      posicao: 4.5,
    });
  });

  it('respeita consulta entre aspas com vírgula dentro', () => {
    const csv = `Consultas principais,Cliques,Impressões,CTR,Posição
"esper, ricardo",3,10,"30,00%","1,50"
`;
    expect(parseBuscaCsv(csv).linhas[0]).toEqual({
      consulta: 'esper, ricardo',
      cliques: 3,
      impressoes: 10,
      ctr: 30,
      posicao: 1.5,
    });
  });

  it('nomeia o que achou e o que procurava quando falta uma coluna', () => {
    const csv = `Consultas principais,Cliques,CTR,Posição\nfoo,1,3%,"4,5"\n`;
    let erro: unknown;
    try {
      parseBuscaCsv(csv);
    } catch (e) {
      erro = e;
    }
    const msg = (erro as Error).message;
    // O que achou — é isso que se cola na tabela de cabeçalhos quando a
    // suposição não bater com a exportação real.
    expect(msg).toContain('Consultas principais');
    expect(msg).toContain('Cliques');
    // O que procurava.
    expect(msg).toContain('Impressões');
    expect(msg).toContain('Impressions');
  });

  it('devolve lista vazia para CSV só com cabeçalho', () => {
    expect(parseBuscaCsv('Consultas principais,Cliques,Impressões,CTR,Posição\n').linhas).toEqual([]);
  });

  it('rejeita linha com menos campos que o cabeçalho', () => {
    const csv = `Consultas principais,Cliques,Impressões,CTR,Posição\nfoo,1,2\n`;
    expect(() => parseBuscaCsv(csv)).toThrow(/campos/);
  });

  it('rejeita número malformado em vez de virar NaN', () => {
    const csv = `Consultas principais,Cliques,Impressões,CTR,Posição\nfoo,muitos,2,3%,"4,5"\n`;
    expect(() => parseBuscaCsv(csv)).toThrow(/foo/);
  });
});
