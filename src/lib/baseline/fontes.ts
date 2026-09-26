/**
 * Registro das fontes externas que devem repetir os fatos canônicos.
 *
 * `alcance` é declaração de honestidade do instrumento. O LinkedIn serve muro
 * de login a robô: sem sessão, uma busca vê título e meta descrição, não o
 * "Sobre" nem as certificações. Tratar essa fonte como `total` faria o coletor
 * reportar como ausente o que está lá — e um instrumento que erra para o
 * pessimismo é tão inútil quanto um que erra para o otimismo.
 */

import type { ConjuntoFatos } from './fatos';

export type Alcance = 'total' | 'parcial';

export interface Fonte {
  id: string;
  url: string;
  alcance: Alcance;
  esperados: string[];
  controle: string;
}

export interface RegistroFontes {
  versao: number;
  atualizado: string;
  fontes: Fonte[];
}

const ALCANCES: Alcance[] = ['total', 'parcial'];

export function validarFontes(dados: unknown, fatos: ConjuntoFatos): RegistroFontes {
  const d = dados as RegistroFontes;

  if (!d || typeof d !== 'object') throw new Error('registro de fontes não é objeto');
  if (!Number.isInteger(d.versao) || d.versao < 1) throw new Error('versao deve ser inteiro positivo');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.atualizado ?? '')) {
    throw new Error('atualizado deve estar em AAAA-MM-DD');
  }
  if (!Array.isArray(d.fontes)) throw new Error('fontes não é lista');
  if (d.fontes.length === 0) throw new Error('lista de fontes vazia');

  const idsDeFato = new Set(fatos.fatos.map((f) => f.id));
  const vistos = new Set<string>();

  for (const f of d.fontes) {
    if (!f || typeof f.id !== 'string' || f.id.length === 0) throw new Error('fonte sem id');
    if (vistos.has(f.id)) throw new Error(`id de fonte duplicado: ${f.id}`);
    vistos.add(f.id);

    if (typeof f.url !== 'string' || !f.url.startsWith('https://')) {
      throw new Error(`fonte ${f.id}: url precisa ser https`);
    }
    if (!ALCANCES.includes(f.alcance)) {
      throw new Error(`fonte ${f.id}: alcance inválido "${f.alcance}"`);
    }
    if (!Array.isArray(f.esperados) || f.esperados.length === 0) {
      throw new Error(`fonte ${f.id}: esperados vazio`);
    }
    for (const e of f.esperados) {
      if (!idsDeFato.has(e)) {
        throw new Error(`fonte ${f.id}: fato esperado "${e}" não existe em fatos.json`);
      }
    }
    if (typeof f.controle !== 'string' || f.controle.length === 0) {
      throw new Error(`fonte ${f.id}: controle ausente`);
    }
  }

  return d;
}
