import { describe, it, expect } from 'vitest';
import { calcularCobertura } from '@/lib/baseline/cobertura';
import { validarFatos } from '@/lib/baseline/fatos';
import type { Fonte } from '@/lib/baseline/fontes';

const fatos = validarFatos({
  versao: 1,
  atualizado: '2026-09-15',
  nome: 'Ricardo Esper',
  fatos: [
    { id: 'nome', rotulo: 'o nome', termos: ['ricardo esper'] },
    { id: 'cargo', rotulo: 'CISO da IONIC', termos: ['ciso', 'ionic'] },
    { id: 'iso27001', rotulo: 'ISO 27001', termos: ['27001'] },
  ],
});

const fonte: Fonte = {
  id: 'exemplo',
  url: 'https://exemplo.com',
  alcance: 'total',
  esperados: ['nome', 'cargo', 'iso27001'],
  controle: 'você',
};

describe('calcularCobertura', () => {
  it('separa presentes de ausentes e calcula a fração', () => {
    const r = calcularCobertura(fonte, '<p>Ricardo Esper, CISO da IONIC Health</p>', fatos);
    expect(r.presentes.sort()).toEqual(['cargo', 'nome']);
    expect(r.ausentes).toEqual(['iso27001']);
    expect(r.cobertura).toBeCloseTo(2 / 3);
  });

  it('cobertura zero quando nada está presente', () => {
    const r = calcularCobertura(fonte, '<p>página sobre outra coisa</p>', fatos);
    expect(r.presentes).toEqual([]);
    expect(r.cobertura).toBe(0);
  });

  it('cobertura um quando tudo está presente', () => {
    const r = calcularCobertura(fonte, 'Ricardo Esper CISO IONIC 27001', fatos);
    expect(r.cobertura).toBe(1);
  });

  it('só conta fato que a fonte deveria carregar', () => {
    const restrita: Fonte = { ...fonte, esperados: ['nome'] };
    const r = calcularCobertura(restrita, 'Ricardo Esper, CISO da IONIC, ISO 27001', fatos);
    expect(r.presentes).toEqual(['nome']);
    expect(r.cobertura).toBe(1);
  });

  it('remove marcação antes de procurar, para não casar dentro de atributo', () => {
    const r = calcularCobertura(fonte, '<a href="/ciso-ionic">outra coisa</a>', fatos);
    expect(r.presentes).toEqual([]);
  });

  it('preserva alcance e controle no resultado', () => {
    const r = calcularCobertura({ ...fonte, alcance: 'parcial' }, 'nada', fatos);
    expect(r.alcance).toBe('parcial');
    expect(r.controle).toBe('você');
  });
});
