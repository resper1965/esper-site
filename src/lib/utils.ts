import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data para exibição
 * @param date - Data a ser formatada
 * @param locale - Locale para formatação (pt-BR, en, etc.)
 * @returns Data formatada como string
 */
export function formatDate(date: Date | string, locale: string = 'pt-BR'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Normaliza um idioma para comparação (case-insensitive)
 * @param lang - Idioma a ser normalizado
 * @returns Idioma normalizado em lowercase
 */
export function normalizeLanguage(lang: string): string {
  return lang.toLowerCase();
}

/**
 * Filtra posts por idioma
 * @param posts - Array de posts
 * @param targetLang - Idioma alvo
 * @returns Posts filtrados por idioma
 */
export function filterPostsByLanguage<T extends { frontMatter: { language?: string } }>(
  posts: T[],
  targetLang: string
): T[] {
  const normalizedTarget = normalizeLanguage(targetLang);
  return posts.filter((post) => {
    const postLang = normalizeLanguage(post.frontMatter.language || 'pt-BR');
    return postLang === normalizedTarget;
  });
}

