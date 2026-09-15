/**
 * Fatos canônicos e sua detecção em texto.
 *
 * Resolução de entidade se constrói por repetição literal entre fontes
 * independentes. Este módulo responde uma pergunta de continência — "este
 * texto contém estes termos?" —, que regex decide bem.
 *
 * Não confunda com a classificação da sonda, que responde "sobre quem este
 * texto fala". Aquilo é julgamento de referência, regex não decide, e saiu da
 * automação depois de três tentativas. A diferença entre as duas perguntas é a
 * razão de uma estar aqui e a outra não.
 */

export interface Fato {
  id: string;
  rotulo: string;
  termos: string[];
}

export interface ConjuntoFatos {
  versao: number;
  atualizado: string;
  nome: string;
  fatos: Fato[];
}

/** Minúscula, sem acento, espaço colapsado. Aplicada aos dois lados. */
export const normalizar = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export function validarFatos(dados: unknown): ConjuntoFatos {
  const d = dados as ConjuntoFatos;

  if (!d || typeof d !== 'object') throw new Error('conjunto de fatos não é objeto');
  if (!Number.isInteger(d.versao) || d.versao < 1) throw new Error('versao deve ser inteiro positivo');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.atualizado ?? '')) {
    throw new Error('atualizado deve estar em AAAA-MM-DD');
  }
  if (typeof d.nome !== 'string' || d.nome.length === 0) throw new Error('nome ausente');
  if (!Array.isArray(d.fatos)) throw new Error('fatos não é lista');
  if (d.fatos.length === 0) throw new Error('lista de fatos vazia');

  const vistos = new Set<string>();
  for (const f of d.fatos) {
    if (!f || typeof f.id !== 'string' || f.id.length === 0) throw new Error('fato sem id');
    if (typeof f.rotulo !== 'string' || f.rotulo.length === 0) throw new Error(`fato ${f.id} sem rotulo`);
    if (!Array.isArray(f.termos) || f.termos.length === 0) throw new Error(`fato ${f.id} sem termos`);
    if (vistos.has(f.id)) throw new Error(`id duplicado: ${f.id}`);
    vistos.add(f.id);
  }

  return d;
}

/** Escapa metacaractere para o termo entrar cru numa expressão regular. */
const escapar = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Termo cercado por fronteira de palavra, e não continência solta.
 *
 * `"ness"` como substring casa com "nessa" e "nesse", que são palavras comuns
 * em português; junto de um `1991` incidental — um ano de copyright basta —
 * isso reportaria como presente um fato que a fonte nunca afirmou. O erro é
 * para o otimismo, e um marco zero inflado é pior que medição nenhuma.
 */
const contemTermo = (texto: string, termo: string): boolean =>
  new RegExp(`\\b${escapar(normalizar(termo))}\\b`).test(texto);

/**
 * Os ids dos fatos que o texto carrega. Um fato só conta se TODOS os seus
 * termos estiverem presentes: "CISO" sozinho não prova "CISO da IONIC Health",
 * e contar assim inflaria a cobertura de toda fonte que mencione o cargo
 * genérico.
 */
export function fatosPresentes(texto: string, conjunto: ConjuntoFatos): string[] {
  const alvo = normalizar(texto);
  return conjunto.fatos
    .filter((f) => f.termos.every((t) => contemTermo(alvo, t)))
    .map((f) => f.id);
}
