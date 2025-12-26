import { supabase } from './client';
import type { Post } from './posts';

export interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  coverImage: string | null;
  rank: number;
}

/**
 * Busca full-text em posts usando Postgres Full-Text Search
 * @param query Termo de busca (ex: "phishing segurança")
 * @param language Idioma (pt-br ou en)
 * @param maxResults Número máximo de resultados
 * @returns Lista de posts ordenados por relevância
 */
export async function searchPosts(
  query: string,
  language: string = 'pt-br',
  maxResults: number = 20
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .rpc('search_posts', {
        search_query: query.trim(),
        search_language: language,
        max_results: maxResults,
      });

    if (error) {
      console.error('❌ Search error:', error);
      return [];
    }

    // Mapear para formato SearchResult
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((result: any) => ({
      slug: result.slug,
      title: result.title,
      excerpt: result.excerpt || '',
      category: result.category,
      date: result.date,
      coverImage: result.cover_image,
      rank: result.rank,
    }));
  } catch (error) {
    console.error('❌ Search exception:', error);
    return [];
  }
}

/**
 * Busca simples usando textSearch do Supabase (alternativa sem RPC)
 */
export async function searchPostsSimple(
  query: string,
  language: string = 'pt-br'
): Promise<Post[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .eq('language', language)
      .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'portuguese',
      })
      .order('date', { ascending: false })
      .limit(20);

    if (error || !data) {
      console.error('❌ Search error:', error);
      return [];
    }

    // Converter para formato Post (sem processar markdown agora)
    return data.map((dbPost) => ({
      frontMatter: {
        title: dbPost.title,
        slug: dbPost.slug,
        date: dbPost.date,
        category: dbPost.category,
        language: dbPost.language,
        excerpt: dbPost.excerpt || '',
        author: dbPost.author || 'Ricardo Esper',
        coverImage: dbPost.cover_image || undefined,
        keywords: dbPost.keywords || undefined,
        tags: dbPost.tags || undefined,
        description: dbPost.description || undefined,
        featured: dbPost.featured || undefined,
        readTime: dbPost.read_time || undefined,
      },
      content: dbPost.content,
      htmlContent: '', // Processar depois se necessário
      slug: dbPost.slug,
    }));
  } catch (error) {
    console.error('❌ Search exception:', error);
    return [];
  }
}

/**
 * Obter sugestões de busca baseado em termos populares
 */
export async function getSearchSuggestions(
  partial: string,
  limit: number = 5
): Promise<string[]> {
  if (!partial || partial.length < 2) {
    return [];
  }

  try {
    // Buscar títulos que começam com o termo
    const { data, error } = await supabase
      .from('posts')
      .select('title')
      .eq('published', true)
      .ilike('title', `%${partial}%`)
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((post) => post.title);
  } catch (error) {
    console.error('❌ Suggestions error:', error);
    return [];
  }
}

/**
 * Obter posts relacionados a um post específico
 */
export async function getRelatedPosts(
  slug: string,
  limit: number = 3
): Promise<SearchResult[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_related_posts', {
        p_slug: slug,
        p_limit: limit,
      });

    if (error) {
      console.error('❌ Related posts error:', error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((result: any) => ({
      slug: result.slug,
      title: result.title,
      excerpt: result.excerpt || '',
      category: '',
      date: '',
      coverImage: result.cover_image,
      rank: result.similarity_score,
    }));
  } catch (error) {
    console.error('❌ Related posts exception:', error);
    return [];
  }
}
