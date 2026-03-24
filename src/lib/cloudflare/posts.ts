/**
 * Posts module — D1 replacement for supabase/posts.ts
 *
 * Keeps identical exports: Post, PostFrontMatter, getAllPosts, getPostBySlug,
 * getLatestPosts, getPostsByCategory, getPostsByTag, createPost, updatePost,
 * publishPost, deletePost, getAllPostsIncludingDrafts.
 */

import { db } from './d1-client';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

// ── Types ─────────────────────────────────────────────────

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

/** Raw D1 row shape */
interface PostRow {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  description: string | null;
  category: string;
  language: string;
  author: string | null;
  cover_image: string | null;
  image_alt: string | null;
  keywords: string | null;   // JSON string
  tags: string | null;       // JSON string
  date: string;
  published: number;         // 0 | 1
  featured: number | null;
  read_time: string | null;
  generated_by: string | null;
  score: number | null;
  sources: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PostInsert {
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  description?: string;
  category?: string;
  language?: string;
  author?: string;
  cover_image?: string;
  image_alt?: string;
  keywords?: string[];
  tags?: string[];
  date: string;
  published?: boolean;
  featured?: boolean;
  read_time?: string;
  generated_by?: string;
  score?: number;
  sources?: unknown;
}

export interface PostUpdate {
  title?: string;
  content?: string;
  excerpt?: string;
  description?: string;
  category?: string;
  language?: string;
  author?: string;
  cover_image?: string;
  image_alt?: string;
  keywords?: string[];
  tags?: string[];
  date?: string;
  published?: boolean;
  featured?: boolean;
  read_time?: string;
  score?: number;
  updated_at?: string;
  published_at?: string;
}

// ── Helpers ───────────────────────────────────────────────

async function processMarkdown(content: string): Promise<string> {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('Content is empty or invalid');
  }
  const processed = await remark().use(remarkHtml).process(content);
  const html = String(processed);
  if (!html || html.trim().length === 0) {
    throw new Error('Processed content is empty');
  }
  return html;
}

function parseJsonArray(val: string | null): string[] | undefined {
  if (!val) return undefined;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function rowToFrontMatter(row: PostRow): PostFrontMatter {
  return {
    title: row.title,
    slug: row.slug,
    date: row.date,
    category: row.category || 'general',
    language: row.language,
    excerpt: row.excerpt || '',
    author: row.author || undefined,
    coverImage: row.cover_image || undefined,
    keywords: parseJsonArray(row.keywords),
    tags: parseJsonArray(row.tags),
    description: row.description || undefined,
    featured: row.featured ? true : undefined,
    readTime: row.read_time || undefined,
  };
}

async function rowToPost(row: PostRow): Promise<Post> {
  const htmlContent = await processMarkdown(row.content);
  return {
    frontMatter: rowToFrontMatter(row),
    content: row.content,
    htmlContent,
    slug: row.slug,
  };
}

async function rowsToPostsSafe(rows: PostRow[]): Promise<Post[]> {
  const results: Post[] = [];
  for (const row of rows) {
    try {
      results.push(await rowToPost(row));
    } catch (err) {
      console.error('Skipping post with bad content:', row.slug, err);
    }
  }
  return results;
}

// ── Public API ────────────────────────────────────────────

export async function getAllPosts(): Promise<Post[]> {
  const rows = await db().all<PostRow>(
    `SELECT * FROM posts WHERE published = 1 ORDER BY date DESC`
  );
  return rowsToPostsSafe(rows);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const row = await db().first<PostRow>(
      `SELECT * FROM posts WHERE slug = ?`,
      [slug]
    );
    if (!row || !row.content || row.content.trim().length === 0) return null;
    return await rowToPost(row);
  } catch (error) {
    console.error('Error in getPostBySlug:', error);
    return null;
  }
}

export async function getLatestPosts(limit: number = 3): Promise<Post[]> {
  const rows = await db().all<PostRow>(
    `SELECT * FROM posts WHERE published = 1 ORDER BY date DESC LIMIT ?`,
    [limit]
  );
  return rowsToPostsSafe(rows);
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  const rows = await db().all<PostRow>(
    `SELECT * FROM posts WHERE published = 1 AND category = ? ORDER BY date DESC`,
    [category]
  );
  return rowsToPostsSafe(rows);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  // D1/SQLite: search JSON array with LIKE (tags stored as '["tag1","tag2"]')
  const rows = await db().all<PostRow>(
    `SELECT * FROM posts WHERE published = 1 AND tags LIKE ? ORDER BY date DESC`,
    [`%"${tag}"%`]
  );
  return rowsToPostsSafe(rows);
}

export async function createPost(post: PostInsert): Promise<PostRow | null> {
  try {
    const id = crypto.randomUUID().replace(/-/g, '');
    const now = new Date().toISOString();
    const category = post.category || 'general';

    await db().execute(
      `INSERT INTO posts (id, slug, title, content, excerpt, description, category, language, author, cover_image, image_alt, keywords, tags, date, published, featured, read_time, generated_by, score, sources, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        post.slug,
        post.title,
        post.content,
        post.excerpt || null,
        post.description || null,
        category,
        post.language || 'pt-BR',
        post.author || null,
        post.cover_image || null,
        post.image_alt || null,
        post.keywords ? JSON.stringify(post.keywords) : null,
        post.tags ? JSON.stringify(post.tags) : null,
        post.date,
        post.published ? 1 : 0,
        post.featured ? 1 : 0,
        post.read_time || null,
        post.generated_by || null,
        post.score ?? null,
        post.sources ? JSON.stringify(post.sources) : null,
        now,
        now,
      ]
    );

    return await db().first<PostRow>(`SELECT * FROM posts WHERE id = ?`, [id]);
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
}

export async function updatePost(slug: string, updates: PostUpdate): Promise<PostRow | null> {
  try {
    const sets: string[] = [];
    const params: unknown[] = [];

    const addField = (col: string, val: unknown) => {
      if (val !== undefined) {
        sets.push(`${col} = ?`);
        params.push(val);
      }
    };

    addField('title', updates.title);
    addField('content', updates.content);
    addField('excerpt', updates.excerpt);
    addField('description', updates.description);
    if (updates.category !== undefined) {
      addField('category', updates.category.trim() || 'general');
    }
    addField('language', updates.language);
    addField('author', updates.author);
    addField('cover_image', updates.cover_image);
    addField('image_alt', updates.image_alt);
    if (updates.keywords !== undefined) addField('keywords', JSON.stringify(updates.keywords));
    if (updates.tags !== undefined) addField('tags', JSON.stringify(updates.tags));
    addField('date', updates.date);
    if (updates.published !== undefined) addField('published', updates.published ? 1 : 0);
    if (updates.featured !== undefined) addField('featured', updates.featured ? 1 : 0);
    addField('read_time', updates.read_time);
    addField('score', updates.score);
    addField('published_at', updates.published_at);

    // Always set updated_at
    sets.push(`updated_at = ?`);
    params.push(new Date().toISOString());

    if (sets.length === 0) return null;

    params.push(slug);
    await db().execute(
      `UPDATE posts SET ${sets.join(', ')} WHERE slug = ?`,
      params
    );

    return await db().first<PostRow>(`SELECT * FROM posts WHERE slug = ?`, [slug]);
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
}

export async function publishPost(slug: string): Promise<PostRow | null> {
  const now = new Date().toISOString();
  try {
    await db().execute(
      `UPDATE posts SET published = 1, published_at = ?, updated_at = ? WHERE slug = ?`,
      [now, now, slug]
    );
    return await db().first<PostRow>(`SELECT * FROM posts WHERE slug = ?`, [slug]);
  } catch (error) {
    console.error('Error publishing post:', error);
    return null;
  }
}

export async function deletePost(slug: string): Promise<boolean> {
  try {
    await db().execute(`DELETE FROM posts WHERE slug = ?`, [slug]);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
}

export async function getDraftPosts(): Promise<Post[]> {
  const rows = await db().all<PostRow>(
    `SELECT * FROM posts WHERE published = 0 ORDER BY created_at DESC`
  );
  return rowsToPostsSafe(rows);
}

export async function getAllPostsIncludingDrafts(): Promise<Post[]> {
  const rows = await db().all<PostRow>(
    `SELECT * FROM posts ORDER BY created_at DESC`
  );
  return rowsToPostsSafe(rows);
}

/** Lightweight stats query for admin dashboard (avoids deserializing every post) */
export async function getPostStats(): Promise<{
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  avgScore: number;
  categoryCounts: Record<string, number>;
}> {
  const rows = await db().all<{ published: number; category: string; score: number | null }>(
    `SELECT published, category, score FROM posts`
  );

  let totalPosts = 0;
  let publishedPosts = 0;
  let scoreSum = 0;
  let scoreCount = 0;
  const categoryCounts: Record<string, number> = {};

  for (const row of rows) {
    totalPosts++;
    if (row.published) publishedPosts++;
    const cat = row.category || 'general';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    if (row.score != null && !isNaN(row.score)) {
      scoreSum += row.score;
      scoreCount++;
    }
  }

  return {
    totalPosts,
    publishedPosts,
    draftPosts: totalPosts - publishedPosts,
    avgScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : 0,
    categoryCounts,
  };
}
