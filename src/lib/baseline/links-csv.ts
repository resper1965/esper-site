/**
 * Lê a exportação CSV do relatório de Links do Search Console.
 *
 * O relatório não tem endpoint de API — a Search Console API expõe apenas
 * Search Analytics, Sitemaps, Sites e URL Inspection. A exportação é feita à
 * mão no painel, uma vez por rodada. A alternativa seria raspar a interface:
 * não suportado, e quebra sem aviso.
 */

import type { LinhaLink } from './snapshot';

/** CSV mínimo: campo entre aspas pode conter vírgula; aspas duplas escapam. */
const campos = (linha: string): string[] => {
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

export function parseLinksCsv(csv: string): LinhaLink[] {
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length <= 1) return [];

  return linhas.slice(1).map((linha) => {
    const partes = campos(linha);
    if (partes.length !== 2) {
      throw new Error(`linha com ${partes.length} campos, esperado 2: "${linha}"`);
    }
    const [dominio, bruto] = partes;
    const links = Number(bruto);
    if (bruto.trim() === '' || !Number.isFinite(links)) {
      throw new Error(`contagem não numérica para "${dominio}": "${bruto}"`);
    }
    return { dominio, links };
  });
}
