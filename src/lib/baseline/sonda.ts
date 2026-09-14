/**
 * Uma resposta em branco não é "o modelo respondeu e não citou". É "não houve
 * resposta". Contar uma como a outra produz um número que parece medição e
 * não é — e a diferença some para sempre assim que o snapshot é gravado.
 */
export function respostaUtilizavel(resposta: unknown): resposta is string {
  return typeof resposta === 'string' && resposta.trim().length > 0;
}
