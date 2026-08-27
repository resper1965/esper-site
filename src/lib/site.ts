export const siteConfig = {
  name: "Ricardo Esper",
  url: "https://esper.ws",
  description:
    "Ricardo Esper — CISO, especialista em cibersegurança com mais de 34 anos de experiência. Fundador da NESS (1991), CISO da IONIC Health, fundador da forense.io. Especialista em LGPD, GDPR, HIPAA, forense digital e proteção executiva.",
  // English variant for i18n
  descriptionEn:
    "Ricardo Esper — CISO and cybersecurity expert with over 34 years of experience. Founder of NESS (1991), CISO of IONIC Health, founder of forense.io. Expert in LGPD, GDPR, HIPAA, digital forensics and executive protection.",
};

export type SiteConfig = typeof siteConfig;

/**
 * Identity graph — single source of truth for `sameAs` across every JSON-LD
 * schema on the site.
 *
 * Search engines and LLMs reconcile "Ricardo Esper" into one entity by
 * cross-referencing these URLs. Every profile listed here MUST link back to
 * esper.ws, otherwise the link is one-way and carries far less weight.
 *
 * Only add a URL once the profile actually exists and is verified — a 404 in
 * `sameAs` weakens the whole graph instead of strengthening it.
 */
export const identityProfiles = {
  linkedin: "https://www.linkedin.com/in/ricardoesper",
  github: "https://github.com/resper1965",
  twitter: "https://twitter.com/ricardoesper",
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
  // crunchbase: "https://www.crunchbase.com/person/...",
  // youtube: "https://www.youtube.com/@...",
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
