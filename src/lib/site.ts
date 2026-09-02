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
 * Grafo de identidade — fonte única do `sameAs` em todo JSON-LD do site.
 *
 * Buscadores e modelos reconciliam "Ricardo Esper" numa entidade só cruzando
 * estas URLs. Uma ligação de mão dupla — o perfil apontando de volta para
 * ricardoesper.com.br — vale bem mais que uma de mão única.
 *
 * O comentário antigo dizia que todo perfil "MUST link back", e isso era
 * aspiração escrita como regra: das cinco entradas abaixo, só uma teve a
 * reciprocidade efetivamente medida. As outras não são suspeitas — são
 * inverificáveis daqui, porque LinkedIn, GitHub, Crunchbase e YouTube
 * respondem a acesso automatizado com bloqueio ou com HTML sem os links,
 * que são renderizados por JavaScript.
 *
 * Então o estado da verificação vira dado, não promessa. `ausente` é o
 * único que exclui do `sameAs`: um perfil que comprovadamente não aponta
 * de volta enfraquece o grafo, enquanto um que não deu para conferir
 * apenas rende menos.
 */
export type BacklinkStatus =
  /** Conferido: a página responde e traz link para o site. */
  | 'medido'
  /** Bloqueia acesso automatizado, ou renderiza os links via JavaScript. */
  | 'inverificavel'
  /** Conferido e não aponta de volta. Fica fora do `sameAs`. */
  | 'ausente';

export interface IdentityProfile {
  url: string;
  backlink: BacklinkStatus;
  /** Por que este status — para o próximo que abrir o arquivo. */
  nota?: string;
}

export const identityProfiles: Record<string, IdentityProfile> = {
  linkedin: {
    url: "https://www.linkedin.com/in/ricardoesper",
    backlink: 'inverificavel',
    nota: 'Responde 999 a acesso automatizado. O handle foi confirmado por uma URL de post público.',
  },
  github: {
    url: "https://github.com/resper1965",
    backlink: 'inverificavel',
    nota: 'A API devolve 403 pelo proxy. A conta é certa: é a dona deste repositório.',
  },
  aboutMe: {
    url: "https://about.me/resper",
    backlink: 'medido',
    nota: 'Único com reciprocidade medida: 200 e link de volta no HTML.',
  },
  youtube: {
    url: "https://www.youtube.com/ricardoesper",
    backlink: 'inverificavel',
    nota: 'Canal existe e resolve em /ricardoesper (@ricardoesper dá 404). Os links do canal são renderizados por JavaScript, então não aparecem no HTML.',
  },
  crunchbase: {
    url: "https://www.crunchbase.com/person/ricardo-esper-9f53",
    backlink: 'inverificavel',
    nota: 'Devolve 403 a acesso automatizado. URL fornecida pelo Ricardo.',
  },
};

/**
 * Âncoras de autoridade que ainda não existem.
 *
 * Wikidata é a de maior alavancagem: é o item que o Knowledge Graph do
 * Google e boa parte dos pipelines de treino leem direto.
 */
export const pendingIdentityProfiles: Record<string, string> = {
  // wikidata: "https://www.wikidata.org/wiki/Q...",
  // orcid: "https://orcid.org/0000-...",
  // lattes: "http://lattes.cnpq.br/...",
};

/** As URLs que entram no `sameAs` — tudo menos os backlinks ausentes. */
export const sameAsUrls: string[] = [
  ...Object.values(identityProfiles)
    .filter((p) => p.backlink !== 'ausente')
    .map((p) => p.url),
  ...Object.values(pendingIdentityProfiles),
];

/** Os que ainda merecem uma conferência manual — para o próximo passo. */
export function profilesNeedingBacklinkCheck(): Array<[string, IdentityProfile]> {
  return Object.entries(identityProfiles).filter(([, p]) => p.backlink !== 'medido');
}

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
