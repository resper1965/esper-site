import { db, schema } from './db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

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
 * Converte post do banco para formato compatível com código existente
 */
function dbPostToPost(dbPost: typeof schema.posts.$inferSelect): PostFrontMatter {
  return {
    title: dbPost.title,
    slug: dbPost.slug,
    date: dbPost.date,
    category: dbPost.category,
    language: dbPost.language,
    excerpt: dbPost.excerpt || '',
    author: dbPost.author || undefined,
    coverImage: dbPost.coverImage || undefined,
    keywords: dbPost.keywords ? JSON.parse(dbPost.keywords) : undefined,
    tags: dbPost.tags ? JSON.parse(dbPost.tags) : undefined,
    description: dbPost.description || undefined,
    featured: dbPost.featured || undefined,
    readTime: dbPost.readTime || undefined,
  };
}

/**
 * Busca todos os posts publicados
 */
export async function getAllPosts(): Promise<Post[]> {
  const dbPosts = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.published, true))
    .orderBy(desc(schema.posts.date));

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
    const [dbPost] = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1);

    if (!dbPost) {
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
  const dbPosts = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.published, true))
    .orderBy(desc(schema.posts.date))
    .limit(limit);

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
  const dbPosts = await db
    .select()
    .from(schema.posts)
    .where(and(
      eq(schema.posts.published, true),
      eq(schema.posts.category, category)
    ))
    .orderBy(desc(schema.posts.date));

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
  const dbPosts = await db
    .select()
    .from(schema.posts)
    .where(
      and(
        eq(schema.posts.published, true),
        sql`json_extract(${schema.posts.tags}, '$') LIKE ${'%' + tag + '%'}`
      )
    )
    .orderBy(desc(schema.posts.date));

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
