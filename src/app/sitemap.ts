import { MetadataRoute } from 'next';
import { docs } from '@/.source';
import { i18n } from '@/i18n/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://esper.ws';

  // Get all blog posts for all languages
  let posts: MetadataRoute.Sitemap = [];
  try {
    const pages = docs.getPages();
    posts = pages.map((post) => {
      const lang = post.data.language || 'pt-BR';
      return {
        url: `${baseUrl}/${lang}/blog/${post.slugs[0]}`,
        lastModified: new Date(post.data.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  // Generate static pages for each language
  const staticPages: MetadataRoute.Sitemap = i18n.locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/${locale}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]);

  return [
    ...staticPages,
    ...posts,
  ];
}
