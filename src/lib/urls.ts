import { i18n, type Locale } from '@/i18n/config';
import { siteConfig } from '@/lib/site';

/**
 * The locale a post belongs to. Posts are single-language: each one was
 * written in one locale and lives only under that prefix.
 */
export function postLocale(language?: string): Locale {
  return i18n.locales.includes(language as Locale)
    ? (language as Locale)
    : i18n.defaultLocale;
}

/** Locale-prefixed path for a post — what the middleware serves without redirecting. */
export function postPath(language: string | undefined, slug: string): string {
  return `/${postLocale(language)}/blog/${slug}`;
}

/**
 * Absolute URL for a post.
 *
 * Feeds, llms.txt and the sitemap must emit the same URL the page declares as
 * canonical. An un-prefixed `/blog/<slug>` 307s to the prefixed one, and a
 * catalogue full of redirects is a catalogue crawlers discount.
 */
export function postUrl(language: string | undefined, slug: string): string {
  return `${siteConfig.url}${postPath(language, slug)}`;
}
