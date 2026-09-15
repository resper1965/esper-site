import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarFatos, fatosPresentes } from '@/lib/baseline/fatos';

const ARQUIVO = join(__dirname, '..', '..', 'orm', 'identidade', 'fatos.json');

const valido = {
  versao: 1,
  atualizado: '2026-09-15',
  nome: 'Ricardo Esper',
  fatos: [
    { id: 'cargo', rotulo: 'CISO da IONIC Health', termos: ['ciso', 'ionic'] },
    { id: 'ness_1991', rotulo: 'fundador da NESS em 1991', termos: ['ness', '1991'] },
  ],
};

describe('validarFatos', () => {
  it('aceita um conjunto bem formado', () => {
    expect(validarFatos(valido).fatos).toHaveLength(2);
  });

  it('rejeita fato sem termo', () => {
    const vazio = { ...valido, fatos: [{ id: 'x', rotulo: 'x', termos: [] }] };
    expect(() => validarFatos(vazio)).toThrow(/termos/);
  });

  it('rejeita id duplicado', () => {
    const dup = { ...valido, fatos: [valido.fatos[0], valido.fatos[0]] };
    expect(() => validarFatos(dup)).toThrow(/duplicado/);
  });

  it('rejeita lista de fatos vazia', () => {
    expect(() => validarFatos({ ...valido, fatos: [] })).toThrow(/vazia/);
  });

  it('rejeita data fora do formato AAAA-MM-DD', () => {
    expect(() => validarFatos({ ...valido, atualizado: '15/09/2026' })).toThrow(/atualizado/);
  });
});

describe('fatosPresentes', () => {
  const c = validarFatos(valido);

  it('exige TODOS os termos do fato, não qualquer um', () => {
    expect(fatosPresentes('Ricardo é CISO em outra empresa', c)).toEqual([]);
    expect(fatosPresentes('CISO da IONIC Health', c)).toEqual(['cargo']);
  });

  it('ignora caixa e acento', () => {
    expect(fatosPresentes('Ciso da Iônic Health', c)).toEqual(['cargo']);
  });

  it('acha mais de um fato no mesmo texto', () => {
    const t = 'CISO da IONIC Health, fundador da NESS em 1991';
    expect(fatosPresentes(t, c).sort()).toEqual(['cargo', 'ness_1991']);
  });

  it('texto vazio não carrega fato nenhum', () => {
    expect(fatosPresentes('', c)).toEqual([]);
  });

  it('"nessa" não satisfaz o termo "ness"', () => {
    expect(fatosPresentes('Nessa época, em 1991, algo aconteceu', c)).toEqual([]);
  });

  it('"preciso" não satisfaz o termo "ciso"', () => {
    expect(fatosPresentes('preciso falar com a IONIC', c)).toEqual([]);
  });

  it('número maior não satisfaz um termo numérico', () => {
    const num = validarFatos({
      versao: 1,
      atualizado: '2026-09-15',
      nome: 'Ricardo Esper',
      fatos: [{ id: 'iso27001', rotulo: 'ISO 27001', termos: ['27001'] }],
    });
    expect(fatosPresentes('protocolo 127001 aprovado', num)).toEqual([]);
    expect(fatosPresentes('auditor ISO 27001', num)).toEqual(['iso27001']);
  });
});

describe('o arquivo de dados versionado', () => {
  const c = validarFatos(JSON.parse(readFileSync(ARQUIVO, 'utf8')));

  it('é válido e tem o nome certo', () => {
    expect(c.nome).toBe('Ricardo Esper');
    expect(c.fatos.length).toBeGreaterThanOrEqual(5);
  });

  it('não declara a ISO 42001 como obtida', () => {
    const ids = c.fatos.map((f) => f.id).join(' ');
    expect(ids).not.toMatch(/42001/);
  });

  it('os termos sem acento casam com texto acentuado de verdade', () => {
    const texto = 'Escreve sobre cibersegurança, privacidade e contraespionagem.';
    expect(fatosPresentes(texto, c)).toContain('eixos');
  });

  it('o termo do site casa dentro de uma URL completa', () => {
    expect(fatosPresentes('veja https://www.ricardoesper.com.br/pt-BR/sobre', c)).toContain('site');
  });
});
