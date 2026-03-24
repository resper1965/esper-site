/**
 * Analytics module — D1 replacement for supabase/analytics.ts
 *
 * Identical exports: PostStats, AnalyticsDashboard, trackView, toggleLike,
 * hasUserLiked, getPostStats, getTopPosts, getAnalyticsDashboard, refreshStats.
 */

import { db } from './d1-client';

// ── Types ─────────────────────────────────────────────────

export interface PostStats {
  slug: string;
  title: string;
  views: number;
  likes: number;
  lastViewedAt?: string;
}

export interface AnalyticsDashboard {
  totalViews: number;
  totalLikes: number;
  totalPosts: number;
  topPosts: PostStats[];
  recentViews: {
    date: string;
    count: number;
  }[];
}

// ── Public API ────────────────────────────────────────────

/**
 * Track a view for a post
 * Inserts into post_views and increments the cached counter.
 */
export async function trackView(
  postSlug: string,
  userIp?: string,
  userAgent?: string,
  referrer?: string
): Promise<boolean> {
  try {
    const id = crypto.randomUUID().replace(/-/g, '');
    const now = new Date().toISOString();

    await db().batch([
      // Insert the view record
      db().prepare(
        `INSERT INTO post_views (id, post_slug, user_ip, user_agent, referrer, viewed_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, postSlug, userIp || null, userAgent || null, referrer || null, now),

      // Upsert the cached counter in post_stats
      db().prepare(
        `INSERT INTO post_stats (slug, views, likes, last_viewed_at)
         VALUES (?, 1, 0, ?)
         ON CONFLICT(slug) DO UPDATE SET
           views = views + 1,
           last_viewed_at = excluded.last_viewed_at`
      ).bind(postSlug, now),
    ]);

    return true;
  } catch (error) {
    console.error('❌ Track view error:', error);
    return false;
  }
}

/**
 * Toggle like on a post (add/remove)
 */
export async function toggleLike(
  postSlug: string,
  userIp: string
): Promise<{ liked: boolean; action: 'added' | 'removed' } | null> {
  try {
    // Check for existing like
    const existing = await db().first<{ id: string }>(
      `SELECT id FROM post_likes WHERE post_slug = ? AND user_ip = ?`,
      [postSlug, userIp]
    );

    if (existing) {
      // Remove
      await db().batch([
        db().prepare(`DELETE FROM post_likes WHERE id = ?`).bind(existing.id),
        db().prepare(
          `UPDATE post_stats SET likes = MAX(likes - 1, 0) WHERE slug = ?`
        ).bind(postSlug),
      ]);
      return { liked: false, action: 'removed' };
    }

    // Add
    const id = crypto.randomUUID().replace(/-/g, '');
    await db().batch([
      db().prepare(
        `INSERT INTO post_likes (id, post_slug, user_ip, created_at)
         VALUES (?, ?, ?, ?)`
      ).bind(id, postSlug, userIp, new Date().toISOString()),
      db().prepare(
        `INSERT INTO post_stats (slug, views, likes)
         VALUES (?, 0, 1)
         ON CONFLICT(slug) DO UPDATE SET likes = likes + 1`
      ).bind(postSlug),
    ]);

    return { liked: true, action: 'added' };
  } catch (error) {
    console.error('❌ Toggle like error:', error);
    return null;
  }
}

/**
 * Check if a user has liked a post
 */
export async function hasUserLiked(
  postSlug: string,
  userIp: string
): Promise<boolean> {
  try {
    const row = await db().first<{ id: string }>(
      `SELECT id FROM post_likes WHERE post_slug = ? AND user_ip = ?`,
      [postSlug, userIp]
    );
    return row !== null;
  } catch {
    return false;
  }
}

/**
 * Get stats for a specific post
 */
export async function getPostStats(postSlug: string): Promise<PostStats | null> {
  try {
    const row = await db().first<{
      slug: string;
      views: number;
      likes: number;
      last_viewed_at: string | null;
    }>(
      `SELECT s.slug, COALESCE(s.views, 0) AS views, COALESCE(s.likes, 0) AS likes, s.last_viewed_at
       FROM post_stats s
       WHERE s.slug = ?`,
      [postSlug]
    );

    if (!row) {
      return { slug: postSlug, title: '', views: 0, likes: 0 };
    }

    // Optionally grab the post title
    const titleRow = await db().first<{ title: string }>(
      `SELECT title FROM posts WHERE slug = ?`,
      [postSlug]
    );

    return {
      slug: row.slug,
      title: titleRow?.title || '',
      views: row.views,
      likes: row.likes,
      lastViewedAt: row.last_viewed_at || undefined,
    };
  } catch (error) {
    console.error('❌ Get stats error:', error);
    return null;
  }
}

/**
 * Get top posts by view count
 */
export async function getTopPosts(limit: number = 10): Promise<PostStats[]> {
  try {
    const rows = await db().all<{
      slug: string;
      title: string;
      views: number;
      likes: number;
      last_viewed_at: string | null;
    }>(
      `SELECT s.slug, COALESCE(p.title, '') AS title,
              COALESCE(s.views, 0) AS views, COALESCE(s.likes, 0) AS likes,
              s.last_viewed_at
       FROM post_stats s
       LEFT JOIN posts p ON p.slug = s.slug
       ORDER BY s.views DESC
       LIMIT ?`,
      [limit]
    );

    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      views: r.views,
      likes: r.likes,
      lastViewedAt: r.last_viewed_at || undefined,
    }));
  } catch (error) {
    console.error('❌ Get top posts error:', error);
    return [];
  }
}

/**
 * Full analytics dashboard
 */
export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  try {
    // Total published posts
    const countRow = await db().first<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM posts WHERE published = 1`
    );
    const totalPosts = countRow?.cnt || 0;

    // Totals from stats
    const totalsRow = await db().first<{ tv: number; tl: number }>(
      `SELECT COALESCE(SUM(views), 0) AS tv, COALESCE(SUM(likes), 0) AS tl
       FROM post_stats`
    );
    const totalViews = totalsRow?.tv || 0;
    const totalLikes = totalsRow?.tl || 0;

    const topPosts = await getTopPosts(10);

    // Views last 7 days grouped by date
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentRows = await db().all<{ dt: string; cnt: number }>(
      `SELECT DATE(viewed_at) AS dt, COUNT(*) AS cnt
       FROM post_views
       WHERE viewed_at >= ?
       GROUP BY dt
       ORDER BY dt`,
      [sevenDaysAgo]
    );

    const recentViews = recentRows.map((r) => ({
      date: r.dt,
      count: r.cnt,
    }));

    return { totalViews, totalLikes, totalPosts, topPosts, recentViews };
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    return { totalViews: 0, totalLikes: 0, totalPosts: 0, topPosts: [], recentViews: [] };
  }
}

/**
 * Refresh materialized stats — recalculates from raw tables
 */
export async function refreshStats(): Promise<boolean> {
  try {
    await db().execute(
      `INSERT OR REPLACE INTO post_stats (slug, views, likes, last_viewed_at)
       SELECT
         p.slug,
         COALESCE(v.cnt, 0) AS views,
         COALESCE(l.cnt, 0) AS likes,
         v.last_view
       FROM posts p
       LEFT JOIN (
         SELECT post_slug, COUNT(*) AS cnt, MAX(viewed_at) AS last_view
         FROM post_views GROUP BY post_slug
       ) v ON v.post_slug = p.slug
       LEFT JOIN (
         SELECT post_slug, COUNT(*) AS cnt
         FROM post_likes GROUP BY post_slug
       ) l ON l.post_slug = p.slug`
    );
    console.log('✅ Stats refreshed');
    return true;
  } catch (error) {
    console.error('❌ Refresh stats error:', error);
    return false;
  }
}
