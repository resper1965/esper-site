/**
 * Lê a resposta de um modelo e diz o que aconteceu com a entidade.
 *
 * Três resultados distintos, de propósito. Citar o site, mencionar o nome sem
 * link e confundir com homônimo são coisas diferentes: tratá-las como uma só
 * infla a métrica e faz o diff subir sem nada ter melhorado.
 */

export interface Citacao {
  citouSite: boolean;
  urls: string[];
  mencionouNome: boolean;
  /**
   * Recusa cita a pessoa sem afirmar nada sobre ela — contar como menção
   * infla a métrica.
   */
  recusou: boolean;
  confundiuHomonimo: boolean;
}

/** Fecha no fim do host para que `ricardoesper.com.br.fake.example` não case. */
const DOMINIO = /(?:https?:\/\/)?(?:www\.)?ricardoesper\.com\.br(?![a-z0-9.-])(?:\/[^\s)\]}>,"']*)?/gi;

const NOME = /ricardo\s+esper/i;

/**
 * Marcadores do domínio correto. A ausência de todos, junto com a presença do
 * nome, é o sinal de que o modelo respondeu sobre outra pessoa.
 */
const CONTEXTO_CERTO = /\b(ciso|cibersegurança|cybersecurity|iso\s*(?:27001|27701|42001)|lgpd|gdpr|forense|ness|ionic|auditor|contraespionagem|tscm|segurança da informação)\b/i;

/**
 * Forma de recusa. O modelo que diz não conhecer a pessoa cita o nome sem
 * afirmar nada sobre ela: contar como menção infla a métrica, e contar como
 * confusão com homônimo inventa uma confusão que não houve.
 */
const RECUSA = /\b(n[ãa]o (tenho|encontrei|disponho|possuo)|n[ãa]o (h[áa]|existem?) informa|sem informa|n[ãa]o (sei|conhe[çc]o)|(don't|do not) have|no information|couldn't find|could not find|unable to find|i'm not (aware|familiar)|not familiar with)\b/i;

/**
 * Quantos caracteres de cada lado do nome entram na janela de contexto.
 *
 * Janela, e não divisão em frases: dividir por pontuação quebra em lista com
 * marcadores — que é a forma natural de responder "quem são..." — e separa o
 * nome da descrição dele, fazendo o campo disparar quase sempre. A janela não
 * depende de pontuação nenhuma.
 */
const JANELA = 160;

/** O texto ao redor de cada ocorrência do nome, concatenado. */
function janelaDoNome(resposta: string): string {
  const trechos: string[] = [];
  for (const m of resposta.matchAll(/ricardo\s+esper/gi)) {
    const i = m.index ?? 0;
    trechos.push(resposta.slice(Math.max(0, i - JANELA), i + m[0].length + JANELA));
  }
  return trechos.join(' ');
}

export function detectarCitacao(resposta: string): Citacao {
  const urls = [...resposta.matchAll(DOMINIO)].map((m) => m[0]);
  const nomePresente = NOME.test(resposta);
  const janela = janelaDoNome(resposta);
  const contextoCerto = CONTEXTO_CERTO.test(janela);

  // Recusa e contexto são interdependentes de propósito. Quem afirma uma
  // credencial não está recusando: "Ricardo Esper é CISO... não tenho certeza
  // sobre a data" é resposta com hesitação, não "não conheço essa pessoa".
  // Sem essa condição, hesitação normal zera uma menção real e deflaciona o
  // marco zero — e marco zero baixo faz todo snapshot futuro parecer melhora.
  const recusou = nomePresente && RECUSA.test(janela) && !contextoCerto;
  const mencionouNome = nomePresente && !recusou;

  return {
    citouSite: urls.length > 0,
    urls,
    mencionouNome,
    recusou,
    confundiuHomonimo: mencionouNome && !contextoCerto,
  };
}
