/**
 * Quebra de campos CSV, compartilhada pelos parsers de exportação do Search
 * Console. Uma só implementação: dois estados de máquina que precisam
 * concordar sobre aspas acabam discordando.
 */

/** CSV mínimo: campo entre aspas pode conter vírgula; aspas duplas escapam. */
export const campos = (linha: string): string[] => {
  const out: string[] = [];
  let atual = '';
  let dentro = false;

  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      if (dentro && linha[i + 1] === '"') {
        atual += '"';
        i++;
      } else {
        dentro = !dentro;
      }
    } else if (c === ',' && !dentro) {
      out.push(atual);
      atual = '';
    } else {
      atual += c;
    }
  }
  out.push(atual);
  return out;
};
