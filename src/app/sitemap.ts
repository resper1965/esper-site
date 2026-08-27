import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';
import { i18n, type Locale } from '@/i18n/config';
import { siteConfig } from '@/lib/site';

/** Static pages, as paths relative to a locale root. */
const STATIC_PATHS: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
  { path: '/sobre', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/servicos', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/imprensa', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/busca', changeFrequency: 'weekly', priority: 0.6 },
];

/**
 * Every URL here is locale-prefixed, matching what `generatePageMetadata`
 * emits as canonical and what the middleware serves without redirecting.
 * A sitemap listing URLs that 307 elsewhere teaches crawlers to distrust it.
 */
function alternatesFor(path: string) {
  return {
    languages: Object.fromEntries(
      i18n.locales.map((locale) => [locale, `${siteConfig.url}/${locale}${path}`])
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = i18n.locales.flatMap((locale) =>
    STATIC_PATHS.map(({ path, changeFrequency, priority }) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: alternatesFor(path),
    }))
  );

  // Posts are single-language: each one belongs to the locale it was written
  // in, so it gets one entry rather than a hreflang pair.
  let posts: MetadataRoute.Sitemap = [];
  try {
    const allPosts = await getAllPosts();
    posts = allPosts.map((post) => {
      const language = i18n.locales.includes(post.frontMatter.language as Locale)
        ? (post.frontMatter.language as Locale)
        : i18n.defaultLocale;

      return {
        url: `${siteConfig.url}/${language}/blog/${post.slug}`,
        lastModified: new Date(post.frontMatter.date),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error('Error generating sitemap from posts:', error);
  }

  return [...staticPages, ...posts];
}
