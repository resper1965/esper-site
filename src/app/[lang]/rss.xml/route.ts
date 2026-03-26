import { getAllPosts, type Post } from '@/lib/posts';
import { siteConfig } from '@/lib/site';
import { filterPostsByLanguage } from '@/lib/utils';

/**
 * RSS Feed generator for blog posts
 *
 * Accessible at:
 * - /pt-BR/rss.xml
 * - /en/rss.xml
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> }
) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang || 'pt-BR';

  // Get all posts from Supabase and filter by language
  let posts: Post[] = [];
  try {
    const allPosts = await getAllPosts();
    posts = filterPostsByLanguage(allPosts, lang);
  } catch (error) {
    console.error('Error fetching posts for RSS:', error);
    posts = [];
  }

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
    <link>${siteConfig.url}</link>
    <description>${description}</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/rss.xml" rel="self" type="application/rss+xml" />
    ${posts
      .map((post) => {
        const url = `${siteConfig.url}/blog/${post.slug}`;
        const pubDate = new Date(post.frontMatter.date).toUTCString();
        const description = post.frontMatter.description || post.frontMatter.excerpt || '';
        // Strip HTML tags from description for RSS
        const plainDescription = description.replace(/<[^>]*>/g, '').substring(0, 500);
        
        return `
    <item>
      <title><![CDATA[${post.frontMatter.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${plainDescription}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>ricardo@esper.ws (Ricardo Esper)</author>
      ${post.frontMatter.category ? `<category>${post.frontMatter.category}</category>` : ''}
      ${post.frontMatter.keywords ? post.frontMatter.keywords.map((k: string) => `<category>${k}</category>`).join('\n      ') : ''}
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
