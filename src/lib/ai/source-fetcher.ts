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

interface SourceContent {
  title: string;
  content: string;
  url: string;
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

/**
 * Extrai conteúdo de uma URL específica
 */
export async function fetchSourceContent(url: string): Promise<SourceContent> {
  try {
    console.log(`📥 Extraindo conteúdo de: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remover scripts, styles, etc
    $('script, style, nav, footer, aside, .ad, .advertisement').remove();
    
    // Tentar encontrar título
    const title = $('meta[property="og:title"]').attr('content') ||
                  $('meta[name="twitter:title"]').attr('content') ||
                  $('h1').first().text().trim() ||
                  $('title').text().trim() ||
                  'Artigo';
    
    // Tentar encontrar conteúdo principal
    let content = '';
    
    // Tentar seletores comuns de artigo
    const articleSelectors = [
      'article',
      '[role="article"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
      '.content'
    ];
    
    for (const selector of articleSelectors) {
      const article = $(selector).first();
      if (article.length > 0) {
        content = article.text().trim();
        if (content.length > 500) {
          break;
        }
      }
    }
    
    // Se não encontrou, pegar todos os parágrafos
    if (content.length < 500) {
      content = $('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
    }
    
    // Limpar e limitar conteúdo
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }
    
    if (!content || content.length < 100) {
      throw new Error('Conteúdo insuficiente extraído da página');
    }
    
    console.log(`✅ Conteúdo extraído: ${content.length} caracteres`);
    
    return {
      title: title.trim(),
      content: content.trim(),
      url
    };
  } catch (error) {
    console.error('❌ Erro ao extrair conteúdo:', error);
    throw error;
  }
}
