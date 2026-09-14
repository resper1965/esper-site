import { describe, it, expect } from 'vitest';
import { montarLinhasBusca } from '@/lib/baseline/busca';

const grupoDe = new Map([['ricardo esper', 'navegacional'], ['lgpd', 'categoria_pt']]);

describe('montarLinhasBusca', () => {
  it('consulta sem linha na API fica com posicao e ctr nulos, não zero', () => {
    const { doConjunto } = montarLinhasBusca([], grupoDe);
    const ausente = doConjunto.find((l) => l.consulta === 'lgpd');
    expect(ausente).toBeDefined();
    expect(ausente!.impressoes).toBe(0);
    expect(ausente!.cliques).toBe(0);
    expect(ausente!.posicao).toBeNull();
    expect(ausente!.ctr).toBeNull();
  });

  it('consulta com linha na API mantém posição e ctr numéricos', () => {
    const { doConjunto } = montarLinhasBusca(
      [{ keys: ['lgpd'], clicks: 2, impressions: 40, ctr: 0.05, position: 8.412 }],
      grupoDe,
    );
    const presente = doConjunto.find((l) => l.consulta === 'lgpd')!;
    expect(presente.posicao).toBe(8.41);
    expect(presente.ctr).toBe(5);
  });

  it('consulta fora do conjunto vai para a outra lista, com o grupo marcado', () => {
    const { doConjunto, foraDoConjunto } = montarLinhasBusca(
      [{ keys: ['outra coisa'], clicks: 0, impressions: 9, ctr: 0, position: 30 }],
      grupoDe,
    );
    expect(foraDoConjunto).toHaveLength(1);
    expect(foraDoConjunto[0].grupo).toBe('fora_do_conjunto');
    expect(doConjunto.every((l) => l.consulta !== 'outra coisa')).toBe(true);
  });

  it('ordena as de fora do conjunto por impressão decrescente', () => {
    const { foraDoConjunto } = montarLinhasBusca(
      [
        { keys: ['a'], clicks: 0, impressions: 3, ctr: 0, position: 1 },
        { keys: ['b'], clicks: 0, impressions: 90, ctr: 0, position: 1 },
      ],
      grupoDe,
    );
    expect(foraDoConjunto.map((l) => l.consulta)).toEqual(['b', 'a']);
  });
});
