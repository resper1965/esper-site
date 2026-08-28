/**
 * Credenciais — fonte única.
 *
 * Antes estavam escritas à mão em seis lugares (rodapé, herói, página Sobre,
 * press kit, llms.txt e o hasCredential do schema) e as listas divergiam: o
 * herói mostrava sete itens misturando certificação com filiação, o rodapé
 * quatro, o press kit três.
 *
 * Certificação e filiação são coisas diferentes e vinham embaralhadas. Aqui
 * ficam separadas, porque no schema.org também são: `hasCredential` para
 * uma, `memberOf` para a outra.
 */

export interface Credential {
  /** Sigla como o mercado a escreve. */
  short: string;
  /** Nome por extenso, para o schema e para quem não conhece a sigla. */
  full: { 'pt-BR': string; en: string };
}

export const certifications: Credential[] = [
  {
    short: 'ISO 27001 Lead Auditor',
    full: {
      'pt-BR': 'Auditor Líder ISO/IEC 27001 — Sistemas de Gestão de Segurança da Informação',
      en: 'ISO/IEC 27001 Lead Auditor — Information Security Management Systems',
    },
  },
  {
    short: 'ISO 27701 Lead Auditor',
    full: {
      'pt-BR': 'Auditor Líder ISO/IEC 27701 — Sistemas de Gestão de Privacidade da Informação',
      en: 'ISO/IEC 27701 Lead Auditor — Privacy Information Management Systems',
    },
  },
  {
    short: 'CCISO',
    full: {
      'pt-BR': 'CCISO — Certified Chief Information Security Officer',
      en: 'CCISO — Certified Chief Information Security Officer',
    },
  },
  {
    short: 'CEHv8',
    full: {
      'pt-BR': 'CEHv8 — Certified Ethical Hacker',
      en: 'CEHv8 — Certified Ethical Hacker',
    },
  },
  {
    short: 'GDPR',
    full: {
      'pt-BR': 'Certificação em conformidade com o GDPR',
      en: 'GDPR Compliance Certification',
    },
  },
];

/** Entidades das quais é membro — `memberOf` no schema, não `hasCredential`. */
export const memberships = [
  { name: 'OWASP', url: 'https://owasp.org' },
  { name: 'IAPP', url: 'https://iapp.org' },
  { name: 'HackerOne', url: 'https://hackerone.com' },
  { name: 'ERII' },
  { name: 'OAB/SP', url: 'https://oabsp.org.br' },
] as const;

/** Siglas, para as fileiras de selos na interface. */
export function certificationBadges(): string[] {
  return certifications.map((c) => c.short);
}
