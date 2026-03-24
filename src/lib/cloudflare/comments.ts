/**
 * Comments module — D1 replacement for supabase/comments.ts
 *
 * Identical exports: Comment, CommentInsert, createComment, getPostComments,
 * getPendingComments, getAllPostComments, approveComment, deleteComment,
 * markAsSpam, getCommentCount, getPendingCount, subscribeToNewComments.
 */

import { db } from './d1-client';

// ── Types ─────────────────────────────────────────────────

export interface Comment {
  id: string;
  postSlug: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  approved: boolean;
  spamScore: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface CommentInsert {
  postSlug: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  content: string;
  userIp?: string;
}

// ── Helpers ───────────────────────────────────────────────

interface CommentRow {
  id: string;
  post_slug: string;
  author_name: string;
  author_email: string;
  author_website: string | null;
  content: string;
  approved: number;
  spam_score: number | null;
  user_ip: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postSlug: row.post_slug,
    authorName: row.author_name,
    authorEmail: row.author_email,
    authorWebsite: row.author_website || undefined,
    content: row.content,
    approved: row.approved === 1,
    spamScore: row.spam_score || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at || undefined,
  };
}

// ── Public API ────────────────────────────────────────────

/**
 * Create a new comment (requires moderation)
 */
export async function createComment(comment: CommentInsert): Promise<Comment | null> {
  try {
    const id = crypto.randomUUID().replace(/-/g, '');
    const now = new Date().toISOString();

    await db().execute(
      `INSERT INTO comments (id, post_slug, author_name, author_email, author_website, content, user_ip, approved, spam_score, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
      [
        id,
        comment.postSlug,
        comment.authorName,
        comment.authorEmail,
        comment.authorWebsite || null,
        comment.content,
        comment.userIp || null,
        now,
        now,
      ]
    );

    const row = await db().first<CommentRow>(
      `SELECT * FROM comments WHERE id = ?`,
      [id]
    );
    return row ? mapComment(row) : null;
  } catch (error) {
    console.error('❌ Create comment error:', error);
    return null;
  }
}

/**
 * Get approved comments for a post
 */
export async function getPostComments(postSlug: string): Promise<Comment[]> {
  try {
    const rows = await db().all<CommentRow>(
      `SELECT * FROM comments WHERE post_slug = ? AND approved = 1 ORDER BY created_at ASC`,
      [postSlug]
    );
    return rows.map(mapComment);
  } catch (error) {
    console.error('❌ Get comments error:', error);
    return [];
  }
}

/**
 * Get pending comments (admin)
 */
export async function getPendingComments(): Promise<Comment[]> {
  try {
    const rows = await db().all<CommentRow>(
      `SELECT * FROM comments WHERE approved = 0 ORDER BY created_at DESC`
    );
    return rows.map(mapComment);
  } catch (error) {
    console.error('❌ Get pending comments error:', error);
    return [];
  }
}

/**
 * Get all comments for a post including unapproved (admin)
 */
export async function getAllPostComments(postSlug: string): Promise<Comment[]> {
  try {
    const rows = await db().all<CommentRow>(
      `SELECT * FROM comments WHERE post_slug = ? ORDER BY created_at DESC`,
      [postSlug]
    );
    return rows.map(mapComment);
  } catch (error) {
    console.error('❌ Get all comments error:', error);
    return [];
  }
}

/**
 * Approve a comment
 */
export async function approveComment(commentId: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    await db().execute(
      `UPDATE comments SET approved = 1, approved_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, commentId]
    );
    console.log('✅ Comment approved:', commentId);
    return true;
  } catch (error) {
    console.error('❌ Approve comment error:', error);
    return false;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    await db().execute(`DELETE FROM comments WHERE id = ?`, [commentId]);
    console.log('✅ Comment deleted:', commentId);
    return true;
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    return false;
  }
}

/**
 * Mark comment as spam
 */
export async function markAsSpam(commentId: string): Promise<boolean> {
  try {
    const now = new Date().toISOString();
    await db().execute(
      `UPDATE comments SET spam_score = 1.0, approved = 0, updated_at = ? WHERE id = ?`,
      [now, commentId]
    );
    console.log('✅ Comment marked as spam:', commentId);
    return true;
  } catch (error) {
    console.error('❌ Mark as spam error:', error);
    return false;
  }
}

/**
 * Count approved comments for a post
 */
export async function getCommentCount(postSlug: string): Promise<number> {
  try {
    const row = await db().first<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM comments WHERE post_slug = ? AND approved = 1`,
      [postSlug]
    );
    return row?.cnt || 0;
  } catch (error) {
    console.error('❌ Comment count error:', error);
    return 0;
  }
}

/**
 * Count pending comments (admin)
 */
export async function getPendingCount(): Promise<number> {
  try {
    const row = await db().first<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM comments WHERE approved = 0`
    );
    return row?.cnt || 0;
  } catch (error) {
    console.error('❌ Pending count error:', error);
    return 0;
  }
}

/**
 * Real-time subscription stub
 *
 * D1 doesn't have real-time channels. For polling-based real-time,
 * use a Durable Object or poll this endpoint from the client.
 * This function returns a no-op unsubscribe for API compatibility.
 */
export function subscribeToNewComments(
  _callback: (comment: Comment) => void
): () => void {
  // D1 has no real-time push; implement via polling or Durable Objects
  console.warn('⚠️ Real-time comments not supported in D1. Use polling.');
  return () => {
    /* no-op unsubscribe */
  };
}
