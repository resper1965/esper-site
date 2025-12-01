import { Metadata } from 'next';
import { siteConfig } from './site';
import { i18n, type Locale } from '@/i18n/config';

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
 * Generates comprehensive metadata for SEO including:
 * - Open Graph tags
 * - Twitter Cards
 * - Canonical URLs
 * - hreflang tags (alternate language versions)
 * - Keywords and article metadata
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
  const url = `${siteConfig.url}/${lang}${path}`;
  const defaultImage = `${siteConfig.url}/og-image.png`;
  const ogImage = image || defaultImage;

  // Generate alternate language URLs for hreflang
  const alternates = {
    canonical: url,
    languages: Object.fromEntries(
      i18n.locales.map((locale) => [
        locale,
        `${siteConfig.url}/${locale}${path}`,
      ])
    ),
  };

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    authors: authors.map(name => ({ name })),
    creator: 'Ricardo Esper',
    publisher: 'Ricardo Esper',
    robots: noindex ? 'noindex, nofollow' : 'index, follow',
    alternates,
    metadataBase: new URL(siteConfig.url),

    // Open Graph
    openGraph: {
      type,
      locale: lang,
      alternateLocale: i18n.locales.filter(l => l !== lang),
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && publishedTime && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        authors: authors,
        section: 'Cybersecurity',
      }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@ricardoesper',
      creator: '@ricardoesper',
      title,
      description,
      images: [ogImage],
    },

    // Additional metadata
    other: {
      'google-site-verification': process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
  };

  return metadata;
}

/**
 * Generates JSON-LD structured data for a blog post
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
    headline: title,
    description,
    image: image || `${siteConfig.url}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: 'Ricardo Esper',
      jobTitle: 'CISO & Cybersecurity Expert',
      url: `${siteConfig.url}/${lang}/sobre`,
      sameAs: [
        'https://www.linkedin.com/in/ricardoesper',
        'https://twitter.com/ricardoesper',
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ricardo Esper',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: keywords.join(', '),
    inLanguage: lang,
    articleSection: 'Cybersecurity',
    ...(wordCount && { wordCount }),
    ...(timeRequired && { timeRequired }),
  };
}

/**
 * Generates JSON-LD structured data for the Person (Ricardo Esper)
 */
export function generatePersonSchema(lang: Locale = 'pt-BR') {
  const description = lang === 'pt-BR'
    ? 'CISO, forense digital e consultor internacional em cibersegurança e privacidade. Mais de 34 anos de experiência em segurança da informação.'
    : 'CISO, digital forensics expert and international consultant in cybersecurity and privacy. Over 34 years of experience in information security.';

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Ricardo Esper',
    jobTitle: 'Chief Information Security Officer',
    description,
    url: `${siteConfig.url}/${lang}/sobre`,
    image: `${siteConfig.url}/ricardo-esper.jpg`,
    sameAs: [
      'https://www.linkedin.com/in/ricardoesper',
      'https://twitter.com/ricardoesper',
    ],
    worksFor: {
      '@type': 'Organization',
      name: 'IONIC Health',
    },
    alumniOf: [
      {
        '@type': 'Organization',
        name: 'NESS',
      },
    ],
    knowsAbout: [
      'Cybersecurity',
      'Digital Forensics',
      'Privacy Compliance',
      'LGPD',
      'GDPR',
      'HIPAA',
      'SOC 2',
      'Information Security',
      'Threat Intelligence',
    ],
  };
}

/**
 * Generates JSON-LD BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
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
 * Generates JSON-LD WebSite structured data with search action
 */
export function generateWebSiteSchema(lang: Locale = 'pt-BR') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: `${siteConfig.url}/${lang}`,
    inLanguage: lang,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/${lang}?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates JSON-LD Organization schema
 */
export function generateOrganizationSchema(lang: Locale = 'pt-BR') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ricardo Esper',
    url: `${siteConfig.url}/${lang}`,
    logo: `${siteConfig.url}/logo.png`,
    description: lang === 'pt-BR'
      ? 'Especialista em cibersegurança, forense digital e privacidade com mais de 34 anos de experiência'
      : 'Cybersecurity, digital forensics and privacy expert with over 34 years of experience',
    founder: {
      '@type': 'Person',
      name: 'Ricardo Esper',
    },
    sameAs: [
      'https://www.linkedin.com/in/ricardoesper',
      'https://twitter.com/ricardoesper',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Professional',
      availableLanguage: ['pt-BR', 'en'],
    },
  };
}

/**
 * Generates JSON-LD FAQPage schema
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates JSON-LD HowTo schema
 */
export function generateHowToSchema({
  name,
  description,
  steps,
  totalTime,
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
 * Generates JSON-LD CollectionPage schema for category/tag pages
 */
export function generateCollectionPageSchema({
  name,
  description,
  url,
  items,
  lang = 'pt-BR',
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
