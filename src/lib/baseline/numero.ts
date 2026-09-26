/**
 * Número de exportação do Search Console, no idioma da interface.
 *
 * Em pt-BR, `1.234` é mil duzentos e trinta e quatro e `8,41` é oito vírgula
 * quarenta e um. Em inglês, os separadores trocam de papel. `1.000` sozinho é
 * ambíguo entre os dois — mil, ou um vírgula zero — e adivinhar foi o defeito
 * que esta função existe para eliminar: quem informa o idioma é o cabeçalho do
 * próprio arquivo, não uma heurística sobre o valor.
 */

export type Idioma = 'pt' | 'en';

/**
 * Converte um campo numérico para número, ou lança. Aceita separador de
 * milhar, separador decimal e sufixo de porcentagem, conforme o idioma.
 */
export function parseNumero(bruto: string, idioma: Idioma): number {
  const limpo = bruto.trim().replace(/\s/g, '').replace(/%$/, '');
  if (limpo === '') throw new Error('campo numérico vazio');

  const milhar = idioma === 'pt' ? '.' : ',';
  const decimal = idioma === 'pt' ? ',' : '.';

  // Um separador de milhar sempre agrupa três dígitos. Qualquer outra coisa é
  // dado malformado, não licença para adivinhar.
  const semMilhar = limpo.split(milhar).length > 1
    ? (() => {
        const partes = limpo.split(milhar);
        if (partes.slice(1).some((p) => !/^\d{3}(?=$|[^\d])/.test(p))) {
          throw new Error(`separador de milhar em posição inválida: "${bruto}"`);
        }
        return partes.join('');
      })()
    : limpo;

  const normalizado = semMilhar.replace(decimal, '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) {
    throw new Error(`valor não numérico: "${bruto}"`);
  }
  const n = Number(normalizado);
  if (!Number.isFinite(n)) throw new Error(`valor não numérico: "${bruto}"`);
  return n;
}

/** Contagem: precisa ser inteiro não negativo depois de convertida. */
export function parseContagem(bruto: string, idioma: Idioma): number {
  const n = parseNumero(bruto, idioma);
  if (!Number.isInteger(n) || n < 0) throw new Error(`contagem inválida: "${bruto}"`);
  return n;
}
