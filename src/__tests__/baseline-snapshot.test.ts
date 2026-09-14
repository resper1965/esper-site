import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { encontrarSegredos, naoMedido } from '@/lib/baseline/snapshot';

const SNAPSHOTS = join(__dirname, '..', '..', 'orm', 'baseline', 'snapshots');

describe('encontrarSegredos', () => {
  it('acha chave do Google', () => {
    expect(encontrarSegredos('AIzaSyD-1234567890abcdefghijklmnopqrstu')).not.toHaveLength(0);
  });

  it('acha token do GitHub', () => {
    expect(encontrarSegredos('ghp_1234567890abcdefghijklmnopqrstuvwxyz')).not.toHaveLength(0);
  });

  it('acha token fine-grained do GitHub', () => {
    expect(
      encontrarSegredos('github_pat_11ABCDEFG0aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890'),
    ).not.toHaveLength(0);
  });

  it('acha chave da OpenAI', () => {
    expect(encontrarSegredos('sk-proj-abcdefghijklmnopqrstuvwxyz1234567890')).not.toHaveLength(0);
  });

  it('acha refresh token nomeado', () => {
    expect(encontrarSegredos('"refresh_token": "1//0abcdefgh"')).not.toHaveLength(0);
  });

  it('acha bloco de chave privada', () => {
    expect(encontrarSegredos('-----BEGIN PRIVATE KEY-----')).not.toHaveLength(0);
  });

  it('não acusa texto comum', () => {
    expect(encontrarSegredos('impressões: 120, posição média: 8.4')).toHaveLength(0);
  });

  it('não acusa a palavra token solta', () => {
    expect(encontrarSegredos('o modelo gastou 300 tokens')).toHaveLength(0);
  });
});

describe('naoMedido', () => {
  it('distingue ausência de medição de valor zero', () => {
    const m = naoMedido('exportação de links não foi feita nesta rodada');
    expect(m.medido).toBe(false);
    if (!m.medido) expect(m.motivo).toMatch(/links/);
  });
});

describe('nenhum snapshot commitado contém credencial', () => {
  const arquivos = readdirSync(SNAPSHOTS).filter((f) => f.endsWith('.json'));

  it('a pasta de snapshots existe e é legível', () => {
    expect(Array.isArray(arquivos)).toBe(true);
  });

  for (const arquivo of arquivos) {
    it(`${arquivo} está limpo`, () => {
      const achados = encontrarSegredos(readFileSync(join(SNAPSHOTS, arquivo), 'utf8'));
      expect(achados, `segredo em ${arquivo}: ${achados.join(', ')}`).toHaveLength(0);
    });
  }
});
