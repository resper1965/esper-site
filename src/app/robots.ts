import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/drafts/'],
    },
    sitemap: 'https://esper.ws/sitemap.xml',
  };
}
