import { CAREER_START_YEAR } from '@/lib/site';

/**
 * Trajetória profissional — fonte única.
 *
 * Alimenta a linha do tempo na página Sobre e o `hasOccupation` do schema
 * Person. Ter os dois saindo daqui é o ponto: uma trajetória que a página
 * conta de um jeito e o JSON-LD de outro é pior que não ter nenhuma.
 *
 * `startYear` é opcional de propósito. Um currículo é material que jornalista
 * confere: uma data inventada custa mais do que uma data ausente. Enquanto o
 * ano não vier do Ricardo, a entrada aparece sem ele.
 *
 * Confirmados por ele: NESS 1991, forense.io 2019, Trustness 2021, IONIC
 * Health 2023. Infinity Safe e Bekaa seguem sem data.
 */
export interface CareerEntry {
  /** Nome da organização, como ela se escreve. */
  organization: string;
  /** Cargo, em pt-BR e en. */
  role: { 'pt-BR': string; en: string };
  /** O que a organização faz — uma linha. */
  focus: { 'pt-BR': string; en: string };
  /** Ano de início. Ausente = ainda não confirmado; não estimar. */
  startYear?: number;
  /** Ausente = vínculo corrente. */
  endYear?: number;
  url?: string;
  /** Fundou ou cofundou a organização — alimenta `founder` no schema. */
  founded?: boolean;
  /** Vínculo empregatício corrente — alimenta `worksFor` no schema. */
  worksFor?: boolean;
}

/** Ano em que a carreira começou — âncora da linha do tempo. */
export const CAREER_START = CAREER_START_YEAR;

export const career: CareerEntry[] = [
  {
    organization: 'NESS',
    role: { 'pt-BR': 'Fundador e CEO', en: 'Founder and CEO' },
    focus: { 'pt-BR': 'Segurança da informação', en: 'Information security' },
    startYear: 1991,
    url: 'https://ness.com.br',
    founded: true,
    worksFor: true,
  },
  {
    organization: 'forense.io',
    role: { 'pt-BR': 'Fundador e CEO', en: 'Founder and CEO' },
    focus: { 'pt-BR': 'Forense digital e resposta a incidentes', en: 'Digital forensics and incident response' },
    startYear: 2019,
    founded: true,
  },
  {
    organization: 'Trustness',
    role: { 'pt-BR': 'Fundador e CEO', en: 'Founder and CEO' },
    focus: { 'pt-BR': 'Privacidade e compliance — LGPD, GDPR', en: 'Privacy and compliance — LGPD, GDPR' },
    startYear: 2021,
    founded: true,
  },
  {
    organization: 'Infinity Safe',
    role: { 'pt-BR': 'Fundador e CEO', en: 'Founder and CEO' },
    focus: { 'pt-BR': 'Proteção executiva e contraespionagem', en: 'Executive protection and counter-espionage' },
    // startYear: pendente de confirmação
    founded: true,
  },
  {
    organization: 'IONIC Health',
    role: { 'pt-BR': 'CISO e cofundador', en: 'CISO and co-founder' },
    focus: { 'pt-BR': 'Segurança em saúde digital', en: 'Security in digital health' },
    url: 'https://ionic.health',
    startYear: 2023,
    founded: true,
    worksFor: true,
  },
  {
    organization: 'Bekaa Trusted Advisors',
    role: { 'pt-BR': 'Conselheiro', en: 'Board member' },
    focus: { 'pt-BR': 'Advisory board', en: 'Advisory board' },
    // startYear: pendente de confirmação
  },
];

/**
 * A linha do tempo em ordem cronológica. Entradas sem ano vão para o fim,
 * preservando a ordem em que foram declaradas — elas são todas correntes,
 * então a ausência de data não muda a leitura.
 */
export function careerTimeline(): CareerEntry[] {
  const comAno = career.filter((e) => e.startYear !== undefined);
  const semAno = career.filter((e) => e.startYear === undefined);
  comAno.sort((a, b) => a.startYear! - b.startYear!);
  return [...comAno, ...semAno];
}

/** Quantos vínculos ainda esperam confirmação de data. */
export function entriesMissingStartYear(): CareerEntry[] {
  return career.filter((e) => e.startYear === undefined);
}

/** Organizações que ele fundou ou cofundou. */
export function foundedOrganizations(): CareerEntry[] {
  return career.filter((e) => e.founded);
}

/** Vínculos empregatícios correntes. */
export function currentEmployers(): CareerEntry[] {
  return career.filter((e) => e.worksFor);
}
