import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';
import { i18n } from '@/i18n/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://esper.ws';

  // Get all blog posts from Supabase
  let posts: MetadataRoute.Sitemap = [];
  try {
    const allPosts = await getAllPosts();
    posts = allPosts.map((post) => {
      const lang = post.frontMatter.language || 'pt-BR';
      return {
        url: `${baseUrl}/${lang}/blog/${post.slug}`,
        lastModified: new Date(post.frontMatter.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error('Error generating sitemap from Supabase:', error);
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
