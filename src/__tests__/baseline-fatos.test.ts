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
});
