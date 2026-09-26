import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validarFontes } from '@/lib/baseline/fontes';
import { validarFatos } from '@/lib/baseline/fatos';

const RAIZ = join(__dirname, '..', '..', 'orm', 'identidade');
const fatos = validarFatos(JSON.parse(readFileSync(join(RAIZ, 'fatos.json'), 'utf8')));

const valido = {
  versao: 1,
  atualizado: '2026-09-15',
  fontes: [
    {
      id: 'github',
      url: 'https://github.com/resper1965',
      alcance: 'total',
      esperados: ['nome', 'cargo', 'site'],
      controle: 'você',
    },
  ],
};

describe('validarFontes', () => {
  it('aceita um registro bem formado', () => {
    expect(validarFontes(valido, fatos).fontes).toHaveLength(1);
  });

  it('rejeita fato esperado que não existe no conjunto de fatos', () => {
    const ruim = {
      ...valido,
      fontes: [{ ...valido.fontes[0], esperados: ['inexistente'] }],
    };
    expect(() => validarFontes(ruim, fatos)).toThrow(/inexistente/);
  });

  it('rejeita url que não seja https', () => {
    const ruim = { ...valido, fontes: [{ ...valido.fontes[0], url: 'http://exemplo.com' }] };
    expect(() => validarFontes(ruim, fatos)).toThrow(/https/);
  });

  it('rejeita alcance desconhecido', () => {
    const ruim = { ...valido, fontes: [{ ...valido.fontes[0], alcance: 'talvez' }] };
    expect(() => validarFontes(ruim, fatos)).toThrow(/alcance/);
  });

  it('rejeita id de fonte duplicado', () => {
    const dup = { ...valido, fontes: [valido.fontes[0], valido.fontes[0]] };
    expect(() => validarFontes(dup, fatos)).toThrow(/duplicado/);
  });

  it('rejeita lista de fontes vazia', () => {
    expect(() => validarFontes({ ...valido, fontes: [] }, fatos)).toThrow(/vazia/);
  });
});

describe('o registro versionado', () => {
  const r = validarFontes(JSON.parse(readFileSync(join(RAIZ, 'fontes.json'), 'utf8')), fatos);

  it('cobre as fontes que o diagnóstico mediu', () => {
    const ids = r.fontes.map((f) => f.id);
    for (const esperado of ['linkedin', 'github', 'aboutme', 'ness', 'ionic', 'forense']) {
      expect(ids).toContain(esperado);
    }
  });

  it('marca o LinkedIn como alcance parcial', () => {
    expect(r.fontes.find((f) => f.id === 'linkedin')?.alcance).toBe('parcial');
  });
});
