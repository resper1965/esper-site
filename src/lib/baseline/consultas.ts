/**
 * O conjunto de consultas é arquivo de dados, não código: é a parte que mais
 * muda, e embutir num script garantiria que ninguém edite. Este módulo só
 * valida a forma — quem lê o arquivo é o coletor, em `scripts/`.
 */

export type GrupoConsulta = 'navegacional' | 'categoria_pt' | 'categoria_en';

export const GRUPOS: GrupoConsulta[] = ['navegacional', 'categoria_pt', 'categoria_en'];

export interface ConjuntoConsultas {
  versao: number;
  atualizado: string;
  grupos: Record<GrupoConsulta, string[]>;
}

/** Consulta normalizada: sem espaço nas pontas, sem maiúscula, sem espaço duplo. */
const normalizada = (s: string): boolean => s === s.trim().toLowerCase().replace(/\s+/g, ' ');

export function validarConsultas(dados: unknown): ConjuntoConsultas {
  const d = dados as ConjuntoConsultas;

  if (!d || typeof d !== 'object') throw new Error('conjunto de consultas não é objeto');
  if (!Number.isInteger(d.versao) || d.versao < 1) throw new Error('versao deve ser inteiro positivo');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.atualizado ?? '')) {
    throw new Error('atualizado deve estar em AAAA-MM-DD');
  }
  if (!d.grupos || typeof d.grupos !== 'object') throw new Error('grupos ausente');

  const vistas = new Set<string>();

  for (const grupo of GRUPOS) {
    const lista = d.grupos[grupo];
    if (!Array.isArray(lista)) throw new Error(`grupo ${grupo} ausente ou não é lista`);
    if (lista.length === 0) throw new Error(`grupo ${grupo} está vazio`);

    for (const consulta of lista) {
      if (typeof consulta !== 'string' || consulta.length === 0) {
        throw new Error(`consulta inválida em ${grupo}`);
      }
      if (!normalizada(consulta)) {
        throw new Error(`consulta não normalizada em ${grupo}: "${consulta}"`);
      }
      if (vistas.has(consulta)) throw new Error(`consulta duplicada: "${consulta}"`);
      vistas.add(consulta);
    }
  }

  return d;
}
