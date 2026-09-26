/**
 * Lê a exportação CSV do relatório de Links do Search Console.
 *
 * O relatório não tem endpoint de API — a Search Console API expõe apenas
 * Search Analytics, Sitemaps, Sites e URL Inspection. A exportação é feita à
 * mão no painel, uma vez por rodada. A alternativa seria raspar a interface:
 * não suportado, e quebra sem aviso.
 */

import { campos } from './csv';
import { parseContagem, type Idioma } from './numero';
import type { LinhaLink } from './snapshot';

export function parseLinksCsv(csv: string, idioma: Idioma = 'pt'): LinhaLink[] {
  const linhas = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length <= 1) return [];

  return linhas.slice(1).map((linha) => {
    const partes = campos(linha);
    if (partes.length !== 2) {
      throw new Error(`linha com ${partes.length} campos, esperado 2: "${linha}"`);
    }
    const [dominio, bruto] = partes;
    // A checagem é sobre o texto cru, no idioma declarado da exportação —
    // nunca sobre o que Number() devolve. Number.isInteger não serve: aceita
    // "1.000" como 1, que é o milhar redondo mais comum da exportação pt-BR e
    // a mesma contagem dividida por mil, passando por toda guarda. Pelo mesmo
    // caminho entravam "0x10" como 16, "1e3" como 1000 e "-5" como contagem
    // negativa. Ler "1.000" como mil é `parseContagem` quem faz, porque o
    // idioma é informado e não adivinhado.
    try {
      return { dominio, links: parseContagem(bruto, idioma) };
    } catch {
      throw new Error(`contagem não numérica para "${dominio}": "${bruto}"`);
    }
  });
}
