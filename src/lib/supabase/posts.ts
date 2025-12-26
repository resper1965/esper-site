import { supabase } from './client';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import type { Database } from './database.types';

type PostRow = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

export interface PostFrontMatter {
  title: string;
  slug: string;
  date: string;
  category: string;
  language: string;
  excerpt: string;
  author?: string;
  coverImage?: string;
  keywords?: string[];
  tags?: string[];
  description?: string;
  featured?: boolean;
  readTime?: string;
}

export interface Post {
  frontMatter: PostFrontMatter;
  content: string;
  htmlContent: string;
  slug: string;
}

async function processMarkdown(content: string): Promise<string> {
  const processedContent = await remark().use(remarkHtml).process(content);
  return processedContent.toString();
}

/**
 * Converte post do Supabase para formato compatível
 */
function dbPostToPost(dbPost: PostRow): PostFrontMatter {
  return {
    title: dbPost.title,
    slug: dbPost.slug,
    date: dbPost.date,
    category: dbPost.category,
    language: dbPost.language,
    excerpt: dbPost.excerpt || '',
    author: dbPost.author || undefined,
    coverImage: dbPost.cover_image || undefined,
    keywords: dbPost.keywords || undefined,
    tags: dbPost.tags || undefined,
    description: dbPost.description || undefined,
    featured: dbPost.featured || undefined,
    readTime: dbPost.read_time || undefined,
  };
}

/**
 * Busca todos os posts publicados
 */
export async function getAllPosts(): Promise<Post[]> {
  const { data: dbPosts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  if (!dbPosts) return [];

  const posts = await Promise.all(
    dbPosts.map(async (dbPost) => {
      const htmlContent = await processMarkdown(dbPost.content);
      return {
        frontMatter: dbPostToPost(dbPost),
        content: dbPost.content,
        htmlContent,
        slug: dbPost.slug,
      };
    })
  );

  return posts;
}

/**
 * Busca post por slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const { data: dbPost, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !dbPost) {
      return null;
    }

    const htmlContent = await processMarkdown(dbPost.content);

    return {
      frontMatter: dbPostToPost(dbPost),
      content: dbPost.content,
      htmlContent,
      slug: dbPost.slug,
    };
  } catch {
    return null;
  }
}

/**
 * Busca posts mais recentes
 */
export async function getLatestPosts(limit: number = 3): Promise<Post[]> {
  const { data: dbPosts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false })
    .limit(limit);

  if (error || !dbPosts) {
    return [];
  }

  const posts = await Promise.all(
    dbPosts.map(async (dbPost) => {
      const htmlContent = await processMarkdown(dbPost.content);
      return {
        frontMatter: dbPostToPost(dbPost),
        content: dbPost.content,
        htmlContent,
        slug: dbPost.slug,
      };
    })
  );

  return posts;
}

/**
 * Busca posts por categoria
 */
export async function getPostsByCategory(category: string): Promise<Post[]> {
  const { data: dbPosts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('date', { ascending: false });

  if (error || !dbPosts) {
    return [];
  }

  const posts = await Promise.all(
    dbPosts.map(async (dbPost) => {
      const htmlContent = await processMarkdown(dbPost.content);
      return {
        frontMatter: dbPostToPost(dbPost),
        content: dbPost.content,
        htmlContent,
        slug: dbPost.slug,
      };
    })
  );

  return posts;
}

/**
 * Busca posts por tag
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const { data: dbPosts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .contains('tags', [tag])
    .order('date', { ascending: false });

  if (error || !dbPosts) {
    return [];
  }

  const posts = await Promise.all(
    dbPosts.map(async (dbPost) => {
      const htmlContent = await processMarkdown(dbPost.content);
      return {
        frontMatter: dbPostToPost(dbPost),
        content: dbPost.content,
        htmlContent,
        slug: dbPost.slug,
      };
    })
  );

  return posts;
}

/**
 * Cria um novo post (draft)
 */
export async function createPost(post: PostInsert): Promise<PostRow | null> {
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  return data;
}

/**
 * Atualiza um post existente
 */
export async function updatePost(slug: string, updates: PostUpdate): Promise<PostRow | null> {
  const { data, error } = await supabase
    .from('posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return null;
  }

  return data;
}

/**
 * Publica um post (muda published para true)
 */
export async function publishPost(slug: string): Promise<PostRow | null> {
  const { data, error } = await supabase
    .from('posts')
    .update({
      published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    console.error('Error publishing post:', error);
    return null;
  }

  return data;
}

/**
 * Deleta um post
 */
export async function deletePost(slug: string): Promise<boolean> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }

  return true;
}

/**
 * Busca todos os posts (incluindo drafts) - apenas para admin
 */
export async function getAllPostsIncludingDrafts(): Promise<Post[]> {
  const { data: dbPosts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !dbPosts) {
    return [];
  }

  const posts = await Promise.all(
    dbPosts.map(async (dbPost) => {
      const htmlContent = await processMarkdown(dbPost.content);
      return {
        frontMatter: dbPostToPost(dbPost),
        content: dbPost.content,
        htmlContent,
        slug: dbPost.slug,
      };
    })
  );

  return posts;
}
