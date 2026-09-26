/**
 * Classificação das respostas da sonda: a resposta é sobre ele, ou sobre um
 * homônimo? Foi recusa?
 *
 * Isto saiu da medição automática depois de três tentativas com regex, cada
 * uma invertendo o viés numa direção diferente. A raiz é que "sobre quem este
 * texto fala" é julgamento de referência, e proximidade de palavra-chave não
 * decide isso. Um modelo decide — e aqui ele faz trabalho, não está sendo
 * medido, então a identidade dele não importa e um modelo aberto e barato
 * serve.
 *
 * O classificador que julga NÃO é o mesmo que respondeu: Llama classifica o
 * que Claude e GPT disseram.
 */

export type Sujeito = 'ele' | 'homonimo' | 'recusa' | 'incerto';

export interface Classificacao {
  sujeito: Sujeito;
  confianca: number;
  justificativa: string;
}

/** Confiança abaixo deste piso vira `incerto`: o duvidoso não entra como medição. */
export const PISO_DE_CONFIANCA = 0.7;

const SUJEITOS: readonly string[] = ['ele', 'homonimo', 'recusa', 'incerto'];

const incerto = (justificativa: string): Classificacao => ({
  sujeito: 'incerto',
  confianca: 0,
  justificativa,
});

/** O prompt é dado, não código: precisa ser lido e ajustado sem recompilar nada. */
export function promptDeClassificacao(resposta: string): { system: string; user: string } {
  const system = [
    'Você classifica respostas de outros modelos de linguagem. A pergunta que',
    'você responde é sempre a mesma: de quem este texto fala?',
    '',
    'O alvo é Ricardo Esper, e estes são os fatos que o identificam:',
    '- é CISO (Chief Information Security Officer);',
    '- fundou a NESS em 1991;',
    '- é lead auditor ISO 27001 e ISO 27701;',
    '- trabalha com cibersegurança, privacidade e contraespionagem.',
    '',
    'Classifique em exatamente um destes valores de `sujeito`:',
    '- "ele": o texto descreve o Ricardo Esper dos fatos acima, ainda que com',
    '  imprecisões de detalhe;',
    '- "homonimo": o texto descreve OUTRA pessoa de mesmo nome — médico,',
    '  atleta, empresário de outro ramo, qualquer um que não seja o acima;',
    '- "recusa": o texto nomeia Ricardo Esper mas diz não ter informação sobre',
    '  ele, ou se recusa a responder. Recusa é recusa mesmo que o texto cite',
    '  corretamente o domínio de cibersegurança na frase em que recusa;',
    '- "incerto": não dá para decidir entre os anteriores.',
    '',
    'Responda SOMENTE com um objeto JSON, sem texto antes ou depois, sem bloco',
    'de código, com exatamente estas três chaves:',
    '{"sujeito": "ele|homonimo|recusa|incerto", "confianca": 0.0, "justificativa": "uma frase"}',
    '',
    '`confianca` é um número entre 0 e 1. `justificativa` é uma única frase em',
    'português dizendo o que no texto decidiu a classificação.',
  ].join('\n');

  const user = `Texto a classificar:\n\n${resposta}`;

  return { system, user };
}

/**
 * Lê o que o classificador devolveu. Modelo não obedece formato de forma
 * confiável, então isto aceita JSON cercado por texto, e devolve `incerto`
 * quando não consegue ler — nunca um palpite.
 */
export function lerClassificacao(bruto: string): Classificacao {
  const inicio = bruto.indexOf('{');
  if (inicio === -1) return incerto(`sem objeto JSON na resposta do classificador: ${recorte(bruto)}`);

  // ponytail: duas tentativas em vez de varredura de chaves balanceadas — a
  // primeira cobre JSON cercado por prosa ou por cerca de código, a segunda
  // cobre prosa que traz outra `}` depois. Se um dia a justificativa vier com
  // chave dentro de string, aí sim vale o parser balanceado.
  const objeto =
    tentarParse(bruto.slice(inicio, bruto.lastIndexOf('}') + 1)) ??
    tentarParse(bruto.slice(inicio, bruto.indexOf('}', inicio) + 1));
  if (!objeto) return incerto(`JSON ilegível na resposta do classificador: ${recorte(bruto)}`);

  const { sujeito, confianca, justificativa } = objeto as Record<string, unknown>;

  if (typeof justificativa !== 'string' || justificativa.trim() === '') {
    return incerto('classificador devolveu JSON sem justificativa');
  }
  if (typeof sujeito !== 'string' || !SUJEITOS.includes(sujeito)) {
    return incerto(`sujeito inválido (${String(sujeito)}): ${justificativa}`);
  }
  if (typeof confianca !== 'number' || !Number.isFinite(confianca)) {
    return incerto(`confiança ausente ou não numérica: ${justificativa}`);
  }

  const grampeada = Math.min(1, Math.max(0, confianca));
  // O duvidoso não entra como medição: vira `incerto` com a justificativa
  // preservada, para que a conferência à mão saiba o que o modelo tinha dito.
  if (grampeada < PISO_DE_CONFIANCA) {
    return { sujeito: 'incerto', confianca: grampeada, justificativa };
  }
  return { sujeito: sujeito as Sujeito, confianca: grampeada, justificativa };
}

function tentarParse(texto: string): unknown {
  try {
    const v: unknown = JSON.parse(texto);
    return typeof v === 'object' && v !== null && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

const recorte = (t: string): string => t.trim().slice(0, 120);
