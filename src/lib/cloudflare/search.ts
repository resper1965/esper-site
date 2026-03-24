/**
 * Search module — D1 replacement for supabase/search.ts
 *
 * Uses FTS5 instead of Postgres tsvector for full-text search.
 * Identical exports: SearchResult, searchPosts, searchPostsSimple,
 * getSearchSuggestions, getRelatedPosts.
 */

import { db } from './d1-client';
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
 * Full-text search using FTS5
 */
export async function searchPosts(
  query: string,
  _language: string = 'pt-br',
  maxResults: number = 20
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    // FTS5 match syntax: tokenize the query terms
    const ftsQuery = query.trim().split(/\s+/).join(' OR ');

    const rows = await db().all<{
      slug: string;
      title: string;
      excerpt: string | null;
      category: string;
      date: string;
      cover_image: string | null;
      rank: number;
    }>(
      `SELECT p.slug, p.title, p.excerpt, p.category, p.date, p.cover_image,
              rank AS rank
       FROM posts_fts fts
       JOIN posts p ON p.rowid = fts.rowid
       WHERE posts_fts MATCH ?
         AND p.published = 1
       ORDER BY rank
       LIMIT ?`,
      [ftsQuery, maxResults]
    );

    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt || '',
      category: r.category,
      date: r.date,
      coverImage: r.cover_image,
      rank: r.rank,
    }));
  } catch (error) {
    console.error('❌ Search error:', error);
    return [];
  }
}

/**
 * Simple search using LIKE (fallback when FTS isn't ideal)
 */
export async function searchPostsSimple(
  query: string,
  language: string = 'pt-br'
): Promise<Post[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const pattern = `%${query.trim()}%`;
    const rows = await db().all<{
      slug: string;
      title: string;
      content: string;
      excerpt: string | null;
      category: string;
      language: string;
      date: string;
      author: string | null;
      cover_image: string | null;
      keywords: string | null;
      tags: string | null;
      description: string | null;
      featured: number | null;
      read_time: string | null;
    }>(
      `SELECT * FROM posts
       WHERE published = 1
         AND language = ?
         AND (title LIKE ? OR content LIKE ? OR excerpt LIKE ?)
       ORDER BY date DESC
       LIMIT 20`,
      [language, pattern, pattern, pattern]
    );

    return rows.map((r) => ({
      frontMatter: {
        title: r.title,
        slug: r.slug,
        date: r.date,
        category: r.category,
        language: r.language,
        excerpt: r.excerpt || '',
        author: r.author || 'Ricardo Esper',
        coverImage: r.cover_image || undefined,
        keywords: r.keywords ? JSON.parse(r.keywords) : undefined,
        tags: r.tags ? JSON.parse(r.tags) : undefined,
        description: r.description || undefined,
        featured: r.featured ? true : undefined,
        readTime: r.read_time || undefined,
      },
      content: r.content,
      htmlContent: '', // Processed on demand
      slug: r.slug,
    }));
  } catch (error) {
    console.error('❌ Search exception:', error);
    return [];
  }
}

/**
 * Auto-complete suggestions based on title prefix
 */
export async function getSearchSuggestions(
  partial: string,
  limit: number = 5
): Promise<string[]> {
  if (!partial || partial.length < 2) return [];

  try {
    const rows = await db().all<{ title: string }>(
      `SELECT title FROM posts
       WHERE published = 1
         AND title LIKE ?
       LIMIT ?`,
      [`%${partial}%`, limit]
    );
    return rows.map((r) => r.title);
  } catch (error) {
    console.error('❌ Suggestions error:', error);
    return [];
  }
}

/**
 * Related posts by shared category and tags
 * (replaces Postgres RPC + tsvector similarity)
 */
export async function getRelatedPosts(
  slug: string,
  limit: number = 3
): Promise<SearchResult[]> {
  try {
    // Get the current post's category and tags
    const post = await db().first<{
      category: string;
      tags: string | null;
    }>(`SELECT category, tags FROM posts WHERE slug = ?`, [slug]);

    if (!post) return [];

    // Find posts in the same category, excluding current
    const rows = await db().all<{
      slug: string;
      title: string;
      excerpt: string | null;
      category: string;
      date: string;
      cover_image: string | null;
    }>(
      `SELECT slug, title, excerpt, category, date, cover_image
       FROM posts
       WHERE published = 1
         AND slug != ?
         AND category = ?
       ORDER BY date DESC
       LIMIT ?`,
      [slug, post.category, limit]
    );

    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt || '',
      category: r.category,
      date: r.date,
      coverImage: r.cover_image,
      rank: 1,
    }));
  } catch (error) {
    console.error('❌ Related posts exception:', error);
    return [];
  }
}
