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
  /**
   * Quem emitiu, quando, e como conferir.
   *
   * Opcionais porque nem toda credencial da lista tem o documento em mãos —
   * e uma certificação sem emissor continua sendo verdade, só não é
   * verificável. Onde temos, o `hasCredential` deixa de ser um nome solto e
   * vira um nó com órgão emissor e número: é a diferença entre "ele diz que
   * é auditor líder" e "este número confere no site do organismo".
   */
  issuer?: { name: string; url?: string };
  /** Número do certificado — o que se digita para conferir. */
  identifier?: string;
  /** Página onde a validade é confirmada. */
  verificationUrl?: string;
  /** Data de conclusão, ISO. */
  dateIssued?: string;
  /** Carga horária declarada no certificado. */
  hours?: number;
}

export const certifications: Credential[] = [
  // As duas ISO saem do mesmo exame, o PC01E09 da Global PCS: um curso de 40h
  // encerrado em 20/08/2026 que cobre a 27001:2022 com extensão para a
  // 27701:2025. Ficam separadas na lista porque são duas normas e o mercado
  // procura por cada uma — mas compartilham emissor e número de certificado.
  {
    short: 'ISO 27001 Lead Auditor',
    full: {
      'pt-BR':
        'Auditor Líder ISO/IEC 27001:2022 — Sistemas de Gestão de Segurança da Informação',
      en: 'ISO/IEC 27001:2022 Lead Auditor — Information Security Management Systems',
    },
    issuer: {
      name: 'Global PCS Certificações',
      url: 'https://www.globalpersoncert.com',
    },
    identifier: 'PC01E090056',
    verificationUrl: 'https://www.globalpersoncert.com',
    dateIssued: '2026-08-20',
    hours: 40,
  },
  {
    short: 'ISO 27701 Lead Auditor',
    full: {
      'pt-BR':
        'Auditor Líder ISO/IEC 27701:2025 — Sistemas de Gestão de Privacidade da Informação',
      en: 'ISO/IEC 27701:2025 Lead Auditor — Privacy Information Management Systems',
    },
    issuer: {
      name: 'Global PCS Certificações',
      url: 'https://www.globalpersoncert.com',
    },
    identifier: 'PC01E090056',
    verificationUrl: 'https://www.globalpersoncert.com',
    dateIssued: '2026-08-20',
    hours: 40,
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
