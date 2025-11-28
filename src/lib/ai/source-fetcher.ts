import Parser from 'rss-parser';
import * as cheerio from 'cheerio';

interface Source {
  title: string;
  url: string;
  summary: string;
  publishedDate: Date;
  source: string;
  relevanceScore?: number;
}

const parser = new Parser();

// Fontes RSS confiáveis
const RSS_SOURCES = [
  {
    name: 'CISA Alerts',
    url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
    priority: 10,
    category: 'cybersecurity'
  },
  {
    name: 'Krebs on Security',
    url: 'https://krebsonsecurity.com/feed/',
    priority: 9,
    category: 'cybersecurity'
  },
  {
    name: 'Dark Reading',
    url: 'https://www.darkreading.com/rss.xml',
    priority: 8,
    category: 'cybersecurity'
  },
  {
    name: 'OWASP Blog',
    url: 'https://owasp.org/blog/feed.xml',
    priority: 9,
    category: 'cybersecurity'
  }
];

export async function fetchRecentNews(hoursBack: number = 24): Promise<Source[]> {
  const cutoffDate = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  const allSources: Source[] = [];

  for (const source of RSS_SOURCES) {
    try {
      console.log(`📡 Fetching: ${source.name}...`);
      const feed = await parser.parseURL(source.url);

      const items = feed.items
        .filter(item => {
          const pubDate = item.pubDate ? new Date(item.pubDate) : new Date(0);
          return pubDate > cutoffDate;
        })
        .map(item => ({
          title: item.title || 'Sem título',
          url: item.link || '',
          summary: item.contentSnippet?.substring(0, 300) || item.content?.substring(0, 300) || '',
          publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
          source: source.name,
          relevanceScore: source.priority
        }));

      allSources.push(...items);
      console.log(`  ✅ ${items.length} items from ${source.name}`);
    } catch (error) {
      console.error(`  ❌ Error fetching ${source.name}:`, error);
    }
  }

  // Ordenar por data (mais recente primeiro)
  allSources.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());

  return allSources;
}

export async function fetchANPDNews(): Promise<Source[]> {
  try {
    console.log('📡 Fetching ANPD (Brasil)...');
    
    // ANPD não tem RSS, fazer scraping básico
    const response = await fetch('https://www.gov.br/anpd/pt-br/assuntos/noticias');
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const news: Source[] = [];
    
    $('.item').each((i, elem) => {
      if (i < 5) { // Últimas 5 notícias
        const title = $(elem).find('.title').text().trim();
        const url = $(elem).find('a').attr('href') || '';
        const summary = $(elem).find('.description').text().trim();
        
        if (title && url) {
          news.push({
            title,
            url: url.startsWith('http') ? url : `https://www.gov.br${url}`,
            summary,
            publishedDate: new Date(),
            source: 'ANPD',
            relevanceScore: 10
          });
        }
      }
    });
    
    console.log(`  ✅ ${news.length} items from ANPD`);
    return news;
  } catch (error) {
    console.error('  ❌ Error fetching ANPD:', error);
    return [];
  }
}

export async function getAllSources(hoursBack: number = 24): Promise<Source[]> {
  const [rssSources, anpdNews] = await Promise.all([
    fetchRecentNews(hoursBack),
    fetchANPDNews()
  ]);

  return [...rssSources, ...anpdNews];
}
