/**
 * Cadência de publicação no LinkedIn.
 *
 * O eixo editorial é cibersegurança, privacidade e contraespionagem
 * (`orm/referencia/posicionamento.md`); a cadência é a outra metade de não
 * virar ruído no feed de quem segue. Fica como trava, não como intenção
 * anotada — a mesma lógica de `encontrarSegredos()` em `baseline/`: uma
 * regra que só existe em prosa é uma regra que alguém esquece de seguir.
 *
 * `orm/linkedin/posts/` já é a fonte de verdade: um arquivo por post, com a
 * data no nome. Não existe estado separado para duplicar — a última
 * publicação é sempre o nome de arquivo mais recente.
 */

/** Dias úteis estritamente depois de `inicio` e até `fim`, inclusive. */
export function diasUteisEntre(inicio: Date, fim: Date): number {
  if (fim <= inicio) return 0;

  let contagem = 0;
  const cursor = new Date(inicio);
  cursor.setHours(0, 0, 0, 0);
  const alvo = new Date(fim);
  alvo.setHours(0, 0, 0, 0);

  while (cursor < alvo) {
    cursor.setDate(cursor.getDate() + 1);
    const diaDaSemana = cursor.getDay();
    if (diaDaSemana !== 0 && diaDaSemana !== 6) contagem++;
  }

  return contagem;
}

const PADRAO_DATA = /^(\d{4}-\d{2}-\d{2})-/;

/**
 * A data (AAAA-MM-DD) do post mais recente entre os nomes de arquivo, ou
 * `null` se não houver nenhum.
 *
 * Ignora `*.APAGADO.txt`: a cadência existe para não sobrecarregar o feed de
 * hoje, e um post apagado não está mais nele.
 */
export function ultimoPostEm(nomesDeArquivo: string[]): string | null {
  const datas = nomesDeArquivo
    .filter((f) => f.endsWith('.txt') && !f.endsWith('.APAGADO.txt'))
    .map((f) => f.match(PADRAO_DATA)?.[1])
    .filter((d): d is string => Boolean(d));

  if (datas.length === 0) return null;
  return datas.sort().at(-1)!;
}

export interface Janela {
  liberado: boolean;
  diasUteisDecorridos: number;
  diasUteisFaltando: number;
}

/**
 * Se já dá para publicar hoje, dado o último post e o mínimo de dias úteis
 * entre publicações.
 */
export function proximaJanela(
  ultimoPost: string | null,
  hoje: Date,
  minimoDiasUteis: number
): Janela {
  if (!ultimoPost) {
    return { liberado: true, diasUteisDecorridos: minimoDiasUteis, diasUteisFaltando: 0 };
  }

  const [ano, mes, dia] = ultimoPost.split('-').map(Number);
  const decorridos = diasUteisEntre(new Date(ano, mes - 1, dia), hoje);
  const faltando = Math.max(0, minimoDiasUteis - decorridos);

  return { liberado: faltando === 0, diasUteisDecorridos: decorridos, diasUteisFaltando: faltando };
}
