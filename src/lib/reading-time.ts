/**
 * Calculate estimated reading time for content
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number, lang: 'pt-BR' | 'en' = 'pt-BR'): string {
  if (lang === 'pt-BR') {
    return `${minutes} min de leitura`;
  }
  return `${minutes} min read`;
}

/**
 * Check if a post is new (published within last 7 days)
 */
export function isNewPost(dateString: string): boolean {
  const postDate = new Date(dateString);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff <= 7;
}
