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

export function detectarCitacao(resposta: string): Citacao {
  const urls = [...resposta.matchAll(DOMINIO)].map((m) => m[0]);
  const mencionouNome = NOME.test(resposta);

  return {
    citouSite: urls.length > 0,
    urls,
    mencionouNome,
    confundiuHomonimo: mencionouNome && !CONTEXTO_CERTO.test(resposta),
  };
}
