import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/drafts/'],
      },
      // Answer engines are a distribution channel here, not a threat: being
      // cited by them is the point. Listed explicitly so the intent is not
      // mistaken for an oversight.
      {
        userAgent: ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/drafts/'],
      },
    ],
    sitemap: 'https://esper.ws/sitemap.xml',
  };
}
