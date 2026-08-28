import { yearsOfExperience } from '@/lib/site';
// Schema.org JSON-LD structured data for SEO
// https://schema.org/Person + https://schema.org/ProfessionalService

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://esper.ws/#person",
  "name": "Ricardo Esper",
  "givenName": "Ricardo",
  "familyName": "Esper",
  "jobTitle": "Chief Information Security Officer (CISO)",
  "description": `Especialista em cibersegurança com ${yearsOfExperience()} anos de experiência. CEO da NESS, CISO da IONIC Health, consultor internacional em privacidade e compliance.`,
  "url": "https://esper.ws",
  "image": "https://esper.ws/images/ricardo-esper.jpg",
  "sameAs": [
    "https://www.linkedin.com/in/ricardoesper",
    "https://github.com/resper1965"
  ],
  "knowsAbout": [
    "Cybersecurity",
    "Information Security",
    "LGPD",
    "GDPR",
    "HIPAA",
    "SOC 2",
    "Digital Forensics",
    "Zero Trust Architecture",
    "TSCM",
    "Executive Protection",
    "Privacy Compliance"
  ],
  "alumniOf": {
    "@type": "Organization",
    "name": "NESS Processos e Tecnologia"
  },
  "worksFor": [
    {
      "@type": "Organization",
      "name": "NESS Processos e Tecnologia",
      "url": "https://ness.com.br",
      "foundingDate": "1991"
    },
    {
      "@type": "Organization",
      "name": "IONIC Health",
      "url": "https://ionichealth.com"
    }
  ],
  "memberOf": [
    { "@type": "Organization", "name": "OWASP" },
    { "@type": "Organization", "name": "HackerOne" },
    { "@type": "Organization", "name": "IAPP" },
    { "@type": "Organization", "name": "ERII" },
    { "@type": "Organization", "name": "OAB/SP" }
  ],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certification",
      "name": "CCISO - Certified Chief Information Security Officer"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certification",
      "name": "CEHv8 - Certified Ethical Hacker"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "certification",
      "name": "GDPR Compliance"
    }
  ]
};

export const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://esper.ws/#service",
  "name": "Ricardo Esper - Consultoria em Cibersegurança",
  "description": "Consultoria especializada em segurança da informação, compliance (LGPD, GDPR, SOC 2), forense digital e proteção executiva.",
  "url": "https://esper.ws/servicos",
  "priceRange": "$$$$",
  "areaServed": {
    "@type": "Country",
    "name": "Brazil"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Serviços de Cibersegurança",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Consultoria CISO",
          "description": "Chief Information Security Officer as a Service - Liderança estratégica em segurança"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Contraespionagem Corporativa",
          "description": "TSCM, varreduras técnicas e proteção executiva"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Forense Digital",
          "description": "Investigação de incidentes e coleta de evidências digitais"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Compliance & Privacidade",
          "description": "Adequação LGPD, GDPR, HIPAA e SOC 2"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Advisory Board",
          "description": "Conselheiro estratégico para boards e M&A"
        }
      }
    ]
  },
  "founder": {
    "@id": "https://esper.ws/#person"
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://esper.ws/#website",
  "name": "Ricardo Esper - Blog de Cibersegurança",
  "url": "https://esper.ws",
  "description": `Insights de cibersegurança, compliance e proteção executiva por Ricardo Esper, CISO com ${yearsOfExperience()} anos de experiência.`,
  "publisher": {
    "@id": "https://esper.ws/#person"
  },
  "inLanguage": ["pt-BR", "en"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://esper.ws/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// Combined schemas for injection
export function getSchemaScripts() {
  return [
    personSchema,
    professionalServiceSchema,
    websiteSchema
  ];
}
