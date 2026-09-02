/**
 * Duas carreiras, duas contas.
 *
 * 1985 é o início em tecnologia; 1991, o início em segurança da informação —
 * o ano em que ele fundou a ness. Os dois números são verdadeiros sobre
 * coisas diferentes, e por um tempo o site chamou os 41 de "anos em cyber",
 * o que contradizia o material que o próprio Ricardo distribui (o card do
 * IBDEE, por exemplo, diz 35 anos em cibersegurança).
 *
 * Uma entidade que declara durações diferentes sobre si mesma enfraquece
 * exatamente o sinal que este site existe para emitir. Separar as contas
 * resolve na origem: cada número passa a ter um rótulo que o sustenta.
 *
 * Antes disto o número estava escrito à mão em treze lugares, em duas
 * versões que se contradiziam — "34+ anos" em nove e "três décadas" nos
 * outros quatro. E 34 anos antes de 2026 daria 1992, um ano depois da
 * fundação da ness: não se funda uma empresa de segurança antes de entrar
 * na área.
 */
export const TECH_START_YEAR = 1985;

/** Início em segurança da informação — o ano da fundação da ness. */
export const SECURITY_START_YEAR = 1991;

/**
 * Mantido como apelido de TECH_START_YEAR: `career.ts` e a página Sobre
 * ancoram a linha do tempo no começo da trajetória, não no recorte de
 * segurança.
 */
export const CAREER_START_YEAR = TECH_START_YEAR;

/**
 * Anos em tecnologia. Um número escrito à mão envelhece em silêncio: "34
 * anos" continuaria dizendo 34 no ano que vem, e ninguém lembraria dos
 * treze arquivos.
 */
export function yearsOfExperience(now: Date = new Date()): number {
  return now.getFullYear() - TECH_START_YEAR;
}

/** Anos em segurança da informação — o recorte mais estrito, desde a ness. */
export function yearsInSecurity(now: Date = new Date()): number {
  return now.getFullYear() - SECURITY_START_YEAR;
}

/**
 * Data de nascimento — 12 de março de 1965.
 *
 * Vira conta pelo mesmo motivo que os anos de carreira viraram: um número
 * escrito à mão envelhece em silêncio e passa a mentir sozinho no aniversário
 * seguinte. Aqui também alimenta o `birthDate` do schema Person, que é campo
 * próprio do schema.org e ajuda um buscador a distinguir este Ricardo Esper
 * de qualquer homônimo.
 */
export const BIRTH_DATE = '1965-03-12';

/** Idade em anos completos — respeita se o aniversário do ano já passou. */
export function age(now: Date = new Date()): number {
  const [y, m, d] = BIRTH_DATE.split('-').map(Number);
  let years = now.getFullYear() - y;
  const jaFezAniversario =
    now.getMonth() + 1 > m || (now.getMonth() + 1 === m && now.getDate() >= d);
  if (!jaFezAniversario) years -= 1;
  return years;
}

/**
 * Países que ele conhece pessoalmente.
 *
 * Substitui o "12 países atendidos" que estava no ar até setembro de 2026 —
 * número inventado, e ainda por cima com moldura corporativa. Este é
 * biográfico e informado por ele: visitou, não "atendeu". A distinção
 * importa, porque é a diferença entre um fato que ele sustenta numa
 * entrevista e um que não.
 */
export const COUNTRIES_VISITED = 74;

export const siteConfig = {
  name: "Ricardo Esper",
  url: "https://www.ricardoesper.com.br",
  description:
    `Ricardo Esper — CISO, especialista em cibersegurança com mais de ${yearsInSecurity()} anos de experiência. Fundador da NESS (1991), CISO da IONIC Health, fundador da forense.io. Especialista em LGPD, GDPR, HIPAA, forense digital e proteção executiva.`,
  // English variant for i18n
  descriptionEn:
    `Ricardo Esper — CISO and cybersecurity expert with over ${yearsInSecurity()} years of experience. Founder of NESS (1991), CISO of IONIC Health, founder of forense.io. Expert in LGPD, GDPR, HIPAA, digital forensics and executive protection.`,
};

export type SiteConfig = typeof siteConfig;

/**
 * Identity graph — single source of truth for `sameAs` across every JSON-LD
 * schema on the site.
 *
 * Search engines and LLMs reconcile "Ricardo Esper" into one entity by
 * cross-referencing these URLs. Every profile listed here MUST link back to
 * ricardoesper.com.br, otherwise the link is one-way and carries far less
 * weight. (A regra dizia "esper.ws" até setembro de 2026, quando o canônico
 * mudou — um comentário que aponta para o domínio preterido é uma instrução
 * errada esperando alguém segui-la.)
 *
 * Only add a URL once the profile actually exists and is verified — a 404 in
 * `sameAs` weakens the whole graph instead of strengthening it.
 */
export const identityProfiles = {
  linkedin: "https://www.linkedin.com/in/ricardoesper",
  github: "https://github.com/resper1965",
  // about.me/resper cumpre a regra acima de forma verificável: a página
  // responde 200 e traz um link de volta para ricardoesper.com.br. É a
  // primeira ligação de mão dupla confirmada por medição, e não por
  // suposição — LinkedIn e GitHub bloqueiam a checagem automatizada.
  aboutMe: "https://about.me/resper",
  // Canal próprio. A forma `@ricardoesper` devolve 404 — este é o handle
  // legado, e é o que resolve. Verificar antes de escrever poupa um 404 no
  // grafo, que enfraquece em vez de fortalecer.
  youtube: "https://www.youtube.com/ricardoesper",
  // Crunchbase devolve 403 a acesso automatizado, então a verificação aqui
  // é a do Ricardo, não minha — ele forneceu a URL. Mesmo caso do LinkedIn
  // e do GitHub: a regra de "verificar antes de incluir" continua valendo,
  // mas quem verifica é quem consegue abrir a página.
  crunchbase: "https://www.crunchbase.com/person/ricardo-esper-9f53",
} as const;

/**
 * Slots reserved for authority anchors that still need to be created.
 *
 * Wikidata is the highest-leverage one: it is the item Google's Knowledge
 * Graph and most LLM training pipelines read directly. Fill each value in and
 * it flows into every schema automatically.
 *
 * See docs/REPUTATION-ONLINE.md for how to create them.
 */
export const pendingIdentityProfiles: Record<string, string> = {
  // wikidata: "https://www.wikidata.org/wiki/Q...",
  // orcid: "https://orcid.org/0000-...",
  // lattes: "http://lattes.cnpq.br/...",
};

/** Every verified profile URL, ready to drop into a JSON-LD `sameAs`. */
export const sameAsUrls: string[] = [
  ...Object.values(identityProfiles),
  ...Object.values(pendingIdentityProfiles),
];

/**
 * Organizations Ricardo Esper founded or leads. Used by the Person schema and
 * by the press kit so both stay in sync.
 */
export const affiliations = [
  { name: "NESS", url: "https://ness.com.br", foundingDate: "1991" },
  { name: "IONIC Health", url: "https://ionic.health" },
  { name: "forense.io" },
  { name: "Trustness" },
  { name: "Infinity Safe" },
] as const;
