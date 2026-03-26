import { getAllPosts, type Post } from '@/lib/posts';

export async function GET() {
  const baseUrl = 'https://esper.ws';

  // Get all published posts from Supabase (already sorted by date)
  let sortedPosts: Post[] = [];
  try {
    sortedPosts = await getAllPosts();
  } catch (error) {
    console.error('Error fetching posts for RSS:', error);
    sortedPosts = [];
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ricardo Esper - Blog de Cibersegurança</title>
    <link>${baseUrl}</link>
    <description>Especialista em cibersegurança com mais de três décadas de experiência. Artigos sobre segurança digital, contraespionagem e tecnologia.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${sortedPosts
      .map(
        (post) => {
          const url = `${baseUrl}/blog/${post.slug}`;
          const description = post.frontMatter.description || post.frontMatter.excerpt || '';
          // Strip HTML tags from description for RSS
          const plainDescription = description.replace(/<[^>]*>/g, '').substring(0, 500);
          
          return `
    <item>
      <title><![CDATA[${post.frontMatter.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${plainDescription}]]></description>
      <pubDate>${new Date(post.frontMatter.date).toUTCString()}</pubDate>
      <author>${post.frontMatter.author || 'Ricardo Esper'}</author>
      ${post.frontMatter.category ? `<category>${post.frontMatter.category}</category>` : ''}
      ${post.frontMatter.keywords ? post.frontMatter.keywords.map((k: string) => `<category>${k}</category>`).join('\n      ') : ''}
    </item>`;
        }
      )
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
