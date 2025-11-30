import { MetadataRoute } from 'next';
import { docs } from '@/.source';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://esper.ws';

  // Get all blog posts
  let posts: MetadataRoute.Sitemap = [];
  try {
    const pages = docs.getPages();
    posts = pages.map((post) => ({
      url: `${baseUrl}${post.url}`,
      lastModified: new Date(post.data.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...posts,
  ];
}
