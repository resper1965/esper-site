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

/** Frase, para limitar o contexto ao trecho que de fato fala do nome. */
const SENTENCA = /[^.!?\n]+[.!?\n]?/g;

/**
 * Forma de recusa. O modelo que diz não conhecer a pessoa cita o nome sem
 * afirmar nada sobre ela: contar como menção infla a métrica, e contar como
 * confusão com homônimo inventa uma confusão que não houve.
 */
const RECUSA = /\b(n[ãa]o (tenho|encontrei|disponho|possuo)|n[ãa]o (h[áa]|existem?) informa|sem informa|n[ãa]o (sei|conhe[çc]o)|(don't|do not) have|no information|couldn't find|could not find|unable to find|i'm not (aware|familiar)|not familiar with)\b/i;

export function detectarCitacao(resposta: string): Citacao {
  const urls = [...resposta.matchAll(DOMINIO)].map((m) => m[0]);
  const nomePresente = NOME.test(resposta);
  const recusou = nomePresente && RECUSA.test(resposta);
  const mencionouNome = nomePresente && !recusou;

  // O contexto é checado SÓ nas frases que contêm o nome. Checar a resposta
  // inteira torna o campo inútil: quatro dos cinco prompts da sonda são sobre
  // cibersegurança, então qualquer resposta a eles carrega palavra-marcador
  // independentemente de sobre quem fale.
  const trechosComNome = (resposta.match(SENTENCA) ?? []).filter((s) => NOME.test(s)).join(' ');

  return {
    citouSite: urls.length > 0,
    urls,
    mencionouNome,
    recusou,
    confundiuHomonimo: mencionouNome && !CONTEXTO_CERTO.test(trechosComNome),
  };
}
