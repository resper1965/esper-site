import { docs } from '@/.source';
import { siteConfig } from '@/lib/site';
import { type Locale } from '@/i18n/config';

/**
 * RSS Feed generator for blog posts
 *
 * Accessible at:
 * - /pt-BR/rss.xml
 * - /en/rss.xml
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: Locale }> }
) {
  const { lang } = await params;

  // Filter posts by language
  const posts = (docs as any)
    .filter((post: any) => {
      const postLang = post.data.language || 'pt-BR';
      return postLang === lang;
    })
    .sort((a: any, b: any) => {
      return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
    });

  const title = lang === 'pt-BR'
    ? 'Ricardo Esper - Blog de Cibersegurança'
    : 'Ricardo Esper - Cybersecurity Blog';

  const description = lang === 'pt-BR'
    ? 'Perspectivas de quem dedica mais de três décadas à segurança da informação'
    : 'Insights from three decades of information security experience';

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${siteConfig.url}/${lang}</link>
    <description>${description}</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/${lang}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map((post: any) => {
        const url = `${siteConfig.url}/${lang}/blog/${post.slugs[0]}`;
        const pubDate = new Date(post.data.date).toUTCString();
        return `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.data.description || post.data.excerpt || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>ricardo@esper.ws (Ricardo Esper)</author>
      ${post.data.category ? `<category>${post.data.category}</category>` : ''}
      ${post.data.keywords ? post.data.keywords.map((k: string) => `<category>${k}</category>`).join('\n      ') : ''}
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
