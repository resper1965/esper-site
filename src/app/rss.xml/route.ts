import { docs } from '@/.source';

export async function GET() {
  const baseUrl = 'https://esper.ws';

  let posts: Array<{
    url: string;
    data: {
      title: string;
      description?: string;
      excerpt?: string;
      date: string;
      author?: string;
    };
  }> = [];

  try {
    posts = docs.getPages();
  } catch (error) {
    console.error('Error generating RSS feed:', error);
  }

  // Sort by date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
  });

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
        (post) => `
    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${baseUrl}${post.url}</link>
      <guid isPermaLink="true">${baseUrl}${post.url}</guid>
      <description><![CDATA[${post.data.description || post.data.excerpt || ''}]]></description>
      <pubDate>${new Date(post.data.date).toUTCString()}</pubDate>
      <author>${post.data.author || 'Ricardo Esper'}</author>
    </item>`
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
