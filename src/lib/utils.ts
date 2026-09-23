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


/**
 * A data curta dos cards e do cabeçalho do post — "7 set 2026", "Sep 7, 2026".
 *
 * `formatDate` escreve o mês por extenso, e "7 de setembro de 2026" ocupa
 * meia linha de metadado num card de 300px. Aqui o mês é abreviado e a
 * ordem segue o idioma.
 *
 * O fuso é a parte que erra em silêncio. `2026-09-07` é uma data de
 * calendário, mas `new Date()` a lê como meia-noite UTC — e meia-noite UTC
 * em São Paulo é 21h do dia 6. Formatada no fuso local, a data do post sai
 * um dia antes da que está gravada. Por isso data sem hora é formatada em
 * UTC, que é como a string foi lida; já um instante completo, com hora e
 * deslocamento, é convertido normalmente, porque aí o fuso é a informação.
 *
 * `palestras/page.tsx` faz a mesma distinção pelo mesmo motivo.
 */
const SO_DATA = /^\d{4}-\d{2}-\d{2}$/;

export function formatDateShort(date: Date | string, locale: string = 'pt-BR'): string {
  const semHora = typeof date === 'string' && SO_DATA.test(date);
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const texto = dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(semHora ? { timeZone: 'UTC' } : {}),
  });

  // pt-BR devolve "7 de set. de 2026"; en-US, "Sep 7, 2026".
  return texto.replace(/ de /g, ' ').replace(/\.(?=\s|$)/g, '');
}
