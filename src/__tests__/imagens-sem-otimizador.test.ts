import { describe, it, expect } from 'vitest';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { authors } from '../lib/authors';

/**
 * O otimizador embutido do Next (`/_next/image`) não funciona no Cloudflare
 * Workers. Em produção ele respondia 500 com `error code: 1101` — exceção no
 * Worker —, e o resultado visível era a foto do autor nunca carregar no card
 * lateral do post.
 *
 * A correção é `images.unoptimized`, que faz o next/image emitir um <img>
 * apontando para o arquivo original. O preço disso é que o arquivo de origem
 * passa a ser servido como está: sem otimizador, um PNG de 800×800 seria
 * entregue inteiro para um avatar de 96px. Por isso o teste também guarda o
 * tamanho do arquivo.
 */

const RAIZ = join(__dirname, '..', '..');
const CONFIG = readFileSync(join(RAIZ, 'next.config.ts'), 'utf8');

describe('next.config: sem otimizador de imagem', () => {
  it('declara images.unoptimized', () => {
    expect(CONFIG).toMatch(/unoptimized:\s*true/);
  });

  it('não reintroduz opções que dependem do otimizador', () => {
    // Com `unoptimized`, estas não têm efeito. Se voltarem, é sinal de que
    // alguém desfez a correção sem perceber.
    for (const opcao of ['formats:', 'deviceSizes:', 'imageSizes:', 'minimumCacheTTL:']) {
      expect(CONFIG, `${opcao} voltou ao next.config`).not.toContain(opcao);
    }
  });
});

describe('avatares: o arquivo servido é do tamanho certo', () => {
  for (const [chave, autor] of Object.entries(authors)) {
    const caminho = join(RAIZ, 'public', autor.avatar.replace(/^\//, ''));

    it(`${chave}: o arquivo existe em ${autor.avatar}`, () => {
      expect(existsSync(caminho), `não encontrado: ${caminho}`).toBe(true);
    });

    it(`${chave}: pesa menos de 80 KB`, () => {
      // Exibido a 96px (256px em telas retina). Sem otimizador, o byte que
      // está no disco é o byte que vai para o leitor.
      const kb = statSync(caminho).size / 1024;
      expect(kb, `${autor.avatar} está com ${Math.round(kb)} KB`).toBeLessThan(80);
    });
  }
});
