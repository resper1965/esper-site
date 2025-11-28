// Configuração de fontes confiáveis
export const TRUSTED_SOURCES = {
  cybersecurity: [
    { name: 'CISA', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories', priority: 10 },
    { name: 'OWASP', url: 'https://owasp.org/blog/', priority: 9 },
    { name: 'NIST', url: 'https://www.nist.gov/cybersecurity', priority: 9 },
    { name: 'Krebs on Security', url: 'https://krebsonsecurity.com/feed/', priority: 8 },
    { name: 'Dark Reading', url: 'https://www.darkreading.com/rss.xml', priority: 7 }
  ],
  
  privacy: [
    { name: 'ANPD', url: 'https://www.gov.br/anpd/pt-br/assuntos/noticias', priority: 10 },
    { name: 'IAPP', url: 'https://iapp.org/news/', priority: 8 },
    { name: 'OAB SP Privacy', url: 'https://www.oabsp.org.br/', priority: 7 }
  ],
  
  counterespionage: [
    { name: 'ERII', url: 'https://www.erii.org/', priority: 9 }
  ],
  
  tech: [
    { name: 'ArXiv CS.CR', url: 'https://arxiv.org/list/cs.CR/recent', priority: 7 },
    { name: 'IEEE Security', url: 'https://www.computer.org/csdl/magazine/sp', priority: 8 }
  ]
};

export const SOURCE_WHITELIST = [
  'cisa.gov',
  'nist.gov',
  'owasp.org',
  'sans.org',
  'krebsonsecurity.com',
  'darkreading.com',
  'anpd.gov.br',
  'iapp.org',
  'oabsp.org.br',
  'erii.org',
  'arxiv.org',
  'ieee.org'
];

export function isSourceTrusted(url: string): boolean {
  return SOURCE_WHITELIST.some(domain => url.includes(domain));
}
