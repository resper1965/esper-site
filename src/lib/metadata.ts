import { Metadata } from 'next';
import { siteConfig, sameAsUrls, yearsInSecurity } from './site';
import { i18n, type Locale } from '@/i18n/config';
import {  } from '@/lib/site';
import { careerTimeline, foundedOrganizations, currentEmployers } from '@/lib/career';

import { certifications, memberships } from '@/lib/credentials'
interface PageMetadataProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  lang?: Locale;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  authors?: string[];
  noindex?: boolean;
}

/**
 * Generates comprehensive metadata for SEO + GEO including:
 * - Open Graph, Twitter Cards
 * - Canonical URLs, hreflang
 * - Keywords, article metadata
 * - AI/GEO-optimized descriptions
 */
export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  lang = 'pt-BR',
  type = 'website',
  publishedTime,
  modifiedTime,
  keywords = [],
  authors = ['Ricardo Esper'],
  noindex = false,
}: PageMetadataProps): Metadata {
  let validLang: 'pt-BR' | 'en' = 'pt-BR';
  if (lang === 'pt-BR' || lang === 'en') validLang = lang;

  const url = `${siteConfig.url}/${validLang}${path}`;
  const defaultImage = `${siteConfig.url}/og-image.png`;
  const ogImage = image || defaultImage;

  const alternates = {
    canonical: url,
    languages: Object.fromEntries(
      i18n.locales.map((locale) => [locale, `${siteConfig.url}/${locale}${path}`])
    ),
  };

  // GEO-enhanced keywords: always include disambiguation terms
  const geoKeywords = [
    ...keywords,
    'Ricardo Esper',
    'Ricardo Esper CISO',
    'Ricardo Esper Brasil',
    'Ricardo Esper cibersegurança',
    'Ricardo Esper cybersecurity expert',
    'Ricardo Esper NESS',
    'Ricardo Esper IONIC Health',
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  const metadata: Metadata = {
    title,
    description,
    keywords: geoKeywords.join(', '),
    authors: authors.map((name) => ({ name })),
    creator: 'Ricardo Esper',
    publisher: 'Ricardo Esper',
    robots: noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    alternates,
    metadataBase: new URL(siteConfig.url),

    openGraph: {
      type,
      locale: validLang as 'pt-BR' | 'en',
      alternateLocale: i18n.locales.filter((l) => l !== validLang) as ('pt-BR' | 'en')[],
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(type === 'article' && publishedTime && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        authors,
        section: 'Cybersecurity',
      }),
    },

    // O card continua valendo: X, Slack, WhatsApp e vários leitores usam estas
    // tags para montar o preview. O que saiu foram `site` e `creator`, que
    // atribuiriam o conteúdo a uma conta que nao esta mais em uso.
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },

    other: {
      'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
      // GEO: help AI crawlers understand the entity
      'article:author': 'Ricardo Esper',
      'profile:first_name': 'Ricardo',
      'profile:last_name': 'Esper',
    },
  };

  return metadata;
}

/**
 * JSON-LD for a blog post
 */
export function generateArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  keywords = [],
  lang = 'pt-BR',
  wordCount,
  timeRequired,
}: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  lang?: Locale;
  wordCount?: number;
  timeRequired?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    headline: title,
    description,
    image: image || `${siteConfig.url}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      '@id': `${siteConfig.url}/sobre#person`,
      name: 'Ricardo Esper',
      jobTitle: 'Chief Information Security Officer',
      // Locale-prefixed: the un-prefixed form redirects. `@id` stays as-is —
      // it is an opaque identifier other schemas reference, not an address.
      url: `${siteConfig.url}/${lang}/sobre`,
      sameAs: sameAsUrls,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${siteConfig.url}#organization`,
      name: 'Ricardo Esper',
      logo: { '@type': 'ImageObject', url: `${siteConfig.url}/logo.png`, width: 512, height: 512 },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: keywords.join(', '),
    inLanguage: lang,
    articleSection: 'Cybersecurity',
    ...(wordCount && { wordCount }),
    ...(timeRequired && { timeRequired }),
    // GEO: speakable for voice search + AI extraction
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.article-summary', 'article p:first-of-type'],
    },
  };
}

/**
 * JSON-LD Person schema — GEO optimized for entity disambiguation
 * Ricardo Esper = The CISO / Cybersecurity Expert from Brazil
 */
export function generatePersonSchema(lang: Locale = 'pt-BR') {
  const description =
    lang === 'pt-BR'
      ? `Ricardo Esper é CISO, especialista em forense digital e consultor internacional em cibersegurança e privacidade. Com mais de ${yearsInSecurity()} anos de experiência, fundou a NESS em 1991, é CISO da IONIC Health e fundador da forense.io. Especialista em LGPD, GDPR, HIPAA e SOC 2.`
      : `Ricardo Esper is a CISO, digital forensics expert and international consultant in cybersecurity and privacy. With over ${yearsInSecurity()} years of experience, he founded NESS in 1991, is CISO of IONIC Health and founder of forense.io. Expert in LGPD, GDPR, HIPAA and SOC 2.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteConfig.url}/sobre#person`,
    name: 'Ricardo Esper',
    givenName: 'Ricardo',
    familyName: 'Esper',
    jobTitle: 'Chief Information Security Officer',
    description,
    url: `${siteConfig.url}/${lang}/sobre`,
    image: `${siteConfig.url}/authors/ricardo.png`,
    nationality: { '@type': 'Country', name: 'Brazil' },
    sameAs: [
      ...sameAsUrls,
      `${siteConfig.url}/pt-BR/sobre`,
      `${siteConfig.url}/en/sobre`,
    ],
    // Derivados de src/lib/career.ts. Antes eram três listas de empresas
    // escritas à mão — aqui, no worksFor e na página Sobre —, e o IONIC
    // Health aparecia em duas delas mas não na terceira.
    worksFor: currentEmployers().map((e) => ({
      '@type': 'Organization',
      name: e.organization,
      ...(e.url ? { url: e.url } : {}),
    })),
    founder: foundedOrganizations().map((e) => ({
      '@type': 'Organization',
      name: e.organization,
      ...(e.startYear ? { foundingDate: String(e.startYear) } : {}),
      ...(e.url ? { url: e.url } : {}),
    })),
    // A trajetória como dado, não como prosa: é o que permite a um
    // buscador ou a um agente responder "desde quando" sem inferir do
    // texto corrido.
    hasOccupation: careerTimeline().map((e) => ({
      '@type': 'Role',
      roleName: e.role[lang],
      ...(e.startYear ? { startDate: String(e.startYear) } : {}),
      ...(e.endYear ? { endDate: String(e.endYear) } : {}),
      'schema:worksFor': {
        '@type': 'Organization',
        name: e.organization,
        ...(e.url ? { url: e.url } : {}),
      },
    })),
    knowsAbout: [
      'Cybersecurity',
      'Information Security',
      'Digital Forensics',
      'Incident Response',
      'CISO Leadership',
      'Privacy Compliance',
      'LGPD',
      'GDPR',
      'HIPAA',
      'SOC 2',
      'Zero Trust Architecture',
      'Threat Intelligence',
      'OSINT',
      'Counter-Espionage',
      'TSCM',
      'Executive Protection',
      'Ransomware Defense',
      'Cloud Security',
    ],
    hasCredential: certifications.map((c) => ({
      '@type': 'EducationalOccupationalCredential',
      name: c.full[lang],
    })),
    memberOf: memberships.map((m) => ({
      '@type': 'Organization',
      name: m.name,
      ...('url' in m && m.url ? { url: m.url } : {}),
    })),
    // GEO: helps AI understand what topics this person is authoritative on
    mainEntityOfPage: {
      '@type': 'ProfilePage',
      '@id': `${siteConfig.url}/${lang}/sobre`,
      dateCreated: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    // Speakable — helps voice search and AI extract key info
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.about-summary', 'h2 + p'],
    },
  };
}

/**
 * ProfilePage schema — new Google standard for personal profiles
 * Critical for GEO (Generative Engine Optimization)
 */
export function generateProfilePageSchema(lang: Locale = 'pt-BR') {
  const description =
    lang === 'pt-BR'
      ? `Página oficial de Ricardo Esper — CISO, especialista em cibersegurança com ${yearsInSecurity()} anos de experiência no Brasil e no mundo.`
      : `Ricardo Esper's official page — CISO, cybersecurity expert with ${yearsInSecurity()} years of experience in Brazil and worldwide.`;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${siteConfig.url}/sobre`,
    name: lang === 'pt-BR' ? 'Sobre Ricardo Esper' : 'About Ricardo Esper',
    description,
    url: `${siteConfig.url}/${lang}/sobre`,
    inLanguage: lang,
    dateCreated: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: {
      '@type': 'Person',
      '@id': `${siteConfig.url}/sobre#person`,
      name: 'Ricardo Esper',
    },
    // GEO: disambiguate — this Ricardo Esper is the cybersecurity CISO, not others
    about: {
      '@type': 'Person',
      name: 'Ricardo Esper',
      jobTitle: 'Chief Information Security Officer',
      nationality: 'Brazilian',
      disambiguatingDescription:
        lang === 'pt-BR'
          ? 'Ricardo Esper (CISO) — fundador da NESS (1991), especialista em cibersegurança e forense digital. Não confundir com outros homônimos.'
          : 'Ricardo Esper (CISO) — founder of NESS (1991), cybersecurity and digital forensics expert. Not to be confused with other namesakes.',
    },
  };
}

/**
 * BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

/**
 * WebSite schema with SearchAction
 */
export function generateWebSiteSchema(lang: Locale = 'pt-BR') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}#website`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    inLanguage: lang,
    publisher: {
      '@type': 'Person',
      '@id': `${siteConfig.url}/sobre#person`,
      name: 'Ricardo Esper',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/${lang}/busca?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    // Speakable: helps AI tools identify key content
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', 'meta[name="description"]'],
    },
  };
}

/**
 * Organization schema
 */
export function generateOrganizationSchema(lang: Locale = 'pt-BR') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}#organization`,
    name: 'Ricardo Esper',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description:
      lang === 'pt-BR'
        ? `Especialista em cibersegurança, forense digital e privacidade com mais de ${yearsInSecurity()} anos de experiência. CISO, consultor internacional e fundador da NESS.`
        : `Cybersecurity, digital forensics and privacy expert with over ${yearsInSecurity()} years of experience. CISO, international consultant and founder of NESS.`,
    founder: {
      '@type': 'Person',
      '@id': `${siteConfig.url}/sobre#person`,
      name: 'Ricardo Esper',
    },
    sameAs: sameAsUrls,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Professional Inquiry',
      availableLanguage: ['pt-BR', 'en'],
      url: 'https://www.linkedin.com/in/ricardoesper',
    },
    areaServed: [
      { '@type': 'Country', name: 'Brazil' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Continent', name: 'Europe' },
    ],
  };
}

/**
 * FAQPage schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/**
 * HowTo schema
 */
export function generateHowToSchema({
  name, description, steps, totalTime,
}: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(totalTime && { totalTime }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: step.image.startsWith('http') ? step.image : `${siteConfig.url}${step.image}`,
      }),
    })),
  };
}

/**
 * CollectionPage schema
 */
export function generateCollectionPageSchema({
  name, description, url, items, lang = 'pt-BR',
}: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; url: string }>;
  lang?: Locale;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    inLanguage: lang,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
      })),
    },
  };
}

/**
 * ProfessionalService schema
 */
export function generateProfessionalServiceSchema(lang: Locale = 'pt-BR') {
  const services = [
    {
      name: lang === 'pt-BR' ? 'CISO as a Service' : 'CISO as a Service',
      description: lang === 'pt-BR'
        ? 'Chief Information Security Officer as a Service — Liderança estratégica em segurança para empresas que precisam de expertise senior sem a carga de um executivo full-time.'
        : 'CISO as a Service — Strategic security leadership for organizations that need senior expertise without a full-time executive.',
    },
    {
      name: lang === 'pt-BR' ? 'Contraespionagem Corporativa' : 'Corporate Counter-Espionage',
      description: lang === 'pt-BR'
        ? 'TSCM (Technical Surveillance Counter Measures), varreduras técnicas e proteção executiva para altos executivos e instalações sensíveis.'
        : 'TSCM, technical sweeps and executive protection for C-suite executives and sensitive facilities.',
    },
    {
      name: lang === 'pt-BR' ? 'Forense Digital' : 'Digital Forensics',
      description: lang === 'pt-BR'
        ? 'Investigação forense de incidentes de segurança, coleta de evidências digitais, análise de malware e suporte jurídico.'
        : 'Forensic investigation of security incidents, digital evidence collection, malware analysis and legal support.',
    },
    {
      name: lang === 'pt-BR' ? 'Compliance & Privacidade' : 'Compliance & Privacy',
      description: lang === 'pt-BR'
        ? 'Adequação LGPD, GDPR, HIPAA e SOC 2. DPO as a Service. Avaliações de impacto (DPIA) e programas de governança de dados.'
        : 'LGPD, GDPR, HIPAA and SOC 2 compliance. DPO as a Service. DPIAs and data governance programs.',
    },
    {
      name: 'Advisory Board',
      description: lang === 'pt-BR'
        ? 'Conselheiro estratégico para boards corporativos, M&A e due diligence de segurança em processos de fusão e aquisição.'
        : 'Strategic advisor for corporate boards, M&A and security due diligence in merger and acquisition processes.',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.url}/servicos#service`,
    name: lang === 'pt-BR'
      ? 'Ricardo Esper — Consultoria em Cibersegurança'
      : 'Ricardo Esper — Cybersecurity Consulting',
    description: lang === 'pt-BR'
      ? `Consultoria especializada em segurança da informação, compliance, forense digital e proteção executiva. ${yearsInSecurity()} anos de experiência. Auditor líder ISO/IEC 27001 e 27701.`
      : `Specialized consulting in information security, compliance, digital forensics and executive protection. ${yearsInSecurity()} years of experience. ISO/IEC 27001 and 27701 Lead Auditor.`,
    url: `${siteConfig.url}/${lang}/servicos`,
    priceRange: '$$$$',
    provider: {
      '@type': 'Person',
      '@id': `${siteConfig.url}/sobre#person`,
      name: 'Ricardo Esper',
    },
    areaServed: [
      { '@type': 'Country', name: 'Brazil' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Continent', name: 'Europe' },
    ],
    availableLanguage: ['pt-BR', 'en', 'es'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: lang === 'pt-BR' ? 'Serviços de Cibersegurança' : 'Cybersecurity Services',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.description,
        },
      })),
    },
  };
}
