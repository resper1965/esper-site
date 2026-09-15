import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { calcularCobertura } from '@/lib/baseline/cobertura';
import { validarFatos } from '@/lib/baseline/fatos';
import type { LinhaIdentidade, SnapshotIdentidade } from '@/lib/baseline/cobertura';
import type { Fonte } from '@/lib/baseline/fontes';

const SNAPSHOTS_IDENTIDADE = join(__dirname, '..', '..', 'orm', 'identidade', 'snapshots');

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

  it('recusa esperados vazio em vez de devolver NaN', () => {
    const vazia: Fonte = { ...fonte, esperados: [] };
    expect(() => calcularCobertura(vazia, 'Ricardo Esper', fatos)).toThrow(/esperados vazio/);
  });

  it('conta fato declarado em JSON-LD', () => {
    const html = `<html><body><p>nada</p><script type="application/ld+json">
      {"name":"Ricardo Esper","jobTitle":"CISO da IONIC Health"}
    </script></body></html>`;
    const r = calcularCobertura(fonte, html, fatos);
    expect(r.presentes.sort()).toEqual(['cargo', 'nome']);
  });

  it('script comum continua sendo descartado', () => {
    const html = '<script>var x = "Ricardo Esper CISO IONIC";</script><p>nada</p>';
    expect(calcularCobertura(fonte, html, fatos).presentes).toEqual([]);
  });

  it('registra quantos caracteres de texto visível sustentaram a medição', () => {
    const r = calcularCobertura(fonte, '<p>Ricardo Esper</p>', fatos);
    expect(r.caracteres).toBeGreaterThan(0);
    expect(r.caracteres).toBeLessThan(60);
  });

  // As duas formas do mesmo vazamento: um `>` literal onde o descarte genérico
  // de marcação não o espera. Ambas vazam PARA DENTRO do texto medido, ou
  // seja, ambas inflam — e cobertura inflada é o pior defeito deste marco zero.
  it('descarta o comentário inteiro, inclusive o que carrega > no meio', () => {
    const html = '<p>nada</p><!-- rascunho: a > b, Ricardo Esper é CISO da IONIC -->';
    expect(calcularCobertura(fonte, html, fatos).presentes).toEqual([]);
  });

  it('atributo com > entre aspas não vaza CSS para o texto medido', () => {
    const html = '<div class="[&>a]:text-ciso [&>b]:bg-ionic">nada</div>';
    const r = calcularCobertura(fonte, html, fatos);
    expect(r.presentes).toEqual([]);
    expect(r.caracteres).toBeLessThan(20);
  });
});

describe('LinhaIdentidade', () => {
  it('aceita tanto uma cobertura medida quanto uma linha declaradamente não medida', () => {
    const medida: LinhaIdentidade = calcularCobertura(fonte, '<p>Ricardo Esper</p>', fatos);
    const naoMedida: LinhaIdentidade = {
      id: 'ionic',
      url: 'https://ionic.health',
      medido: false,
      motivo: 'http 403',
    };
    expect('cobertura' in medida).toBe(true);
    expect('cobertura' in naoMedida).toBe(false);
  });
});

describe('snapshot de identidade commitado', () => {
  const arquivos = readdirSync(SNAPSHOTS_IDENTIDADE).filter((f) => f.endsWith('.json'));

  for (const arquivo of arquivos) {
    it(`${arquivo}: toda fonte tentada aparece uma vez, medida ou não medida`, () => {
      const snap = JSON.parse(
        readFileSync(join(SNAPSHOTS_IDENTIDADE, arquivo), 'utf8'),
      ) as SnapshotIdentidade;

      if (!snap.identidade.medido) return;

      // O consumidor que tirar média desta lista precisa ver as oito, não as
      // sobreviventes: uma fonte que falhou continua na lista, declarada.
      expect(snap.identidade.valor).toHaveLength(snap.tentadas);

      for (const linha of snap.identidade.valor) {
        const declarada = 'cobertura' in linha ? typeof linha.cobertura === 'number' : !linha.medido;
        expect(declarada, `${arquivo}/${linha.id}: sem cobertura e sem medido:false`).toBe(true);
      }
    });
  }
});
