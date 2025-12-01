import { MetadataRoute } from 'next';
import { docs, meta } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { i18n } from '@/i18n/config';

const blogSource = loader({
  baseUrl: '/blog',
  source: createMDXSource(docs, meta),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://esper.ws';

  // Get all blog posts for all languages
  let posts: MetadataRoute.Sitemap = [];
  try {
    const pages = blogSource.getPages();
    if (Array.isArray(pages)) {
      posts = pages.map((post) => {
        const lang = post.data.language || 'pt-BR';
        return {
          url: `${baseUrl}/${lang}/blog/${post.slugs[0]}`,
          lastModified: new Date(post.data.date),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        };
      });
    }
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
