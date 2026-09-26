import { describe, it, expect } from 'vitest';
import { respostaUtilizavel } from '@/lib/baseline/sonda';
import { resumirCitacoes } from '@/lib/baseline/snapshot';
import { detectarCitacao } from '@/lib/baseline/citacao';

describe('respostaUtilizavel', () => {
  it('aceita texto com conteúdo', () => {
    expect(respostaUtilizavel('Ricardo Esper é CISO.')).toBe(true);
  });

  it('rejeita string vazia', () => {
    expect(respostaUtilizavel('')).toBe(false);
  });

  it('rejeita string só com espaço', () => {
    expect(respostaUtilizavel('   \n  ')).toBe(false);
  });

  it('rejeita null e undefined', () => {
    expect(respostaUtilizavel(null)).toBe(false);
    expect(respostaUtilizavel(undefined)).toBe(false);
  });
});

describe('resumirCitacoes separa falha de medição', () => {
  it('falha não vira execução sem citação', () => {
    const r = resumirCitacoes('p', 'm', [], 5);
    expect(r.execucoes).toBe(0);
    expect(r.falhas).toBe(5);
    expect(r.citou).toBe(0);
  });

  it('conta só o que foi de fato pontuado', () => {
    const c = [detectarCitacao('veja ricardoesper.com.br'), detectarCitacao('Ricardo Esper é CISO.')];
    const r = resumirCitacoes('p', 'm', c, 3);
    expect(r.execucoes).toBe(2);
    expect(r.falhas).toBe(3);
    expect(r.citou).toBe(1);
  });

  it('falhas é zero quando não informado, para não quebrar chamador antigo', () => {
    expect(resumirCitacoes('p', 'm', []).falhas).toBe(0);
  });
});
