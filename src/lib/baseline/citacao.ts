/**
 * Lê a resposta de um modelo e reporta apenas o que uma regex decide com
 * verdade: o site foi citado (com quais URLs) e o nome apareceu.
 *
 * ## Por que `recusou` e `confundiuHomonimo` não existem mais
 *
 * Os dois campos eram derivados por proximidade de palavras-chave e foram
 * removidos por decisão do dono do projeto, depois de três tentativas de
 * calibrar o recorte do teste — cada uma inverteu o viés para um lado
 * diferente:
 *
 * 1. Resposta inteira: marcador vazava de qualquer ponto do texto, e o campo
 *    nunca disparava.
 * 2. Divisão por frase: resposta em lista com marcadores fragmenta, o nome se
 *    separa da descrição, e o campo disparava quase sempre.
 * 3. Janela de ±160 caracteres: em lista, as credenciais do item vizinho
 *    entram na janela, e o campo voltava a nunca disparar.
 *
 * A causa não é o tamanho da janela. "Sobre quem este texto fala?" é um
 * julgamento sobre referência, e proximidade de palavra-chave não decide
 * referência — nenhum ajuste de recorte resolve isso, então não adianta tentar
 * um quarto. Agravante concreto: quatro dos cinco prompts da sonda são eles
 * próprios perguntas de cibersegurança, então a recusa típica ("Não tenho
 * informações sobre Ricardo Esper no campo da cibersegurança") já contém um
 * marcador do domínio correto — o sinal e o ruído são literalmente a mesma
 * palavra.
 *
 * ## A regra que fica
 *
 * Este módulo reporta só o que uma regex decide com verdade. Se a resposta é
 * sobre ele ou sobre um homônimo, e se foi recusa, é lido por uma pessoa a
 * partir das respostas cruas — que já são persistidas em
 * `AAAA-MM-DD-modelos-respostas.json` — na conferência de sanidade.
 *
 * Isto é o mesmo princípio de `Medido<T>`, aplicado ao instrumento: registrar
 * "não medido" em vez de inventar um número. Um campo que dispara quase sempre
 * ou quase nunca não é uma medição ruim; é uma medição falsa, e o subprojeto
 * inteiro existe para que a afirmação seja falsificável.
 *
 * Portanto: **não reintroduza a heurística.** Nem com outra janela, nem com
 * outra lista de marcadores, nem com um modelo pequeno "só para classificar".
 * Se a classificação precisar deixar de ser manual, isso é uma decisão de
 * escopo a ser tomada de novo, não um conserto a ser aplicado aqui.
 *
 * `mencionouNome` passa a significar exatamente "o nome apareceu no texto" —
 * inclusive dentro de uma recusa. É de propósito: descontar a recusa exigiria
 * justamente o julgamento que foi removido daqui.
 */

export interface Citacao {
  citouSite: boolean;
  urls: string[];
  mencionouNome: boolean;
}

/** Fecha no fim do host para que `ricardoesper.com.br.fake.example` não case. */
const DOMINIO = /(?:https?:\/\/)?(?:www\.)?ricardoesper\.com\.br(?![a-z0-9.-])(?:\/[^\s)\]}>,"']*)?/gi;

const NOME = /ricardo\s+esper/i;

export function detectarCitacao(resposta: string): Citacao {
  const urls = [...resposta.matchAll(DOMINIO)].map((m) => m[0]);
  return {
    citouSite: urls.length > 0,
    urls,
    mencionouNome: NOME.test(resposta),
  };
}
