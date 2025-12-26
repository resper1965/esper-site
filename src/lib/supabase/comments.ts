import { supabase } from './client';

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

/**
 * Criar novo comentário (requer aprovação)
 */
export async function createComment(comment: CommentInsert): Promise<Comment | null> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_slug: comment.postSlug,
        author_name: comment.authorName,
        author_email: comment.authorEmail,
        author_website: comment.authorWebsite || null,
        content: comment.content,
        user_ip: comment.userIp || null,
        approved: false, // Requer moderação
        spam_score: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Create comment error:', error);
      return null;
    }

    return mapComment(data);
  } catch (error) {
    console.error('❌ Create comment exception:', error);
    return null;
  }
}

/**
 * Obter comentários aprovados de um post
 */
export async function getPostComments(postSlug: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_slug', postSlug)
      .eq('approved', true)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('❌ Get comments error:', error);
      return [];
    }

    return data.map(mapComment);
  } catch (error) {
    console.error('❌ Get comments exception:', error);
    return [];
  }
}

/**
 * Obter comentários pendentes de aprovação (admin)
 */
export async function getPendingComments(): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('❌ Get pending comments error:', error);
      return [];
    }

    return data.map(mapComment);
  } catch (error) {
    console.error('❌ Get pending comments exception:', error);
    return [];
  }
}

/**
 * Obter todos os comentários de um post (admin - incluindo não aprovados)
 */
export async function getAllPostComments(postSlug: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_slug', postSlug)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('❌ Get all comments error:', error);
      return [];
    }

    return data.map(mapComment);
  } catch (error) {
    console.error('❌ Get all comments exception:', error);
    return [];
  }
}

/**
 * Aprovar comentário
 */
export async function approveComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('approve_comment', {
      comment_id: commentId,
    });

    if (error) {
      console.error('❌ Approve comment error:', error);
      return false;
    }

    console.log('✅ Comment approved:', commentId);
    return true;
  } catch (error) {
    console.error('❌ Approve comment exception:', error);
    return false;
  }
}

/**
 * Rejeitar/deletar comentário
 */
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('❌ Delete comment error:', error);
      return false;
    }

    console.log('✅ Comment deleted:', commentId);
    return true;
  } catch (error) {
    console.error('❌ Delete comment exception:', error);
    return false;
  }
}

/**
 * Marcar comentário como spam
 */
export async function markAsSpam(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('comments')
      .update({
        spam_score: 1.0,
        approved: false,
      })
      .eq('id', commentId);

    if (error) {
      console.error('❌ Mark as spam error:', error);
      return false;
    }

    console.log('✅ Comment marked as spam:', commentId);
    return true;
  } catch (error) {
    console.error('❌ Mark as spam exception:', error);
    return false;
  }
}

/**
 * Contar comentários aprovados de um post
 */
export async function getCommentCount(postSlug: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_slug', postSlug)
      .eq('approved', true);

    if (error) {
      console.error('❌ Get comment count error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('❌ Get comment count exception:', error);
    return 0;
  }
}

/**
 * Contar comentários pendentes (admin)
 */
export async function getPendingCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false);

    if (error) {
      console.error('❌ Get pending count error:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('❌ Get pending count exception:', error);
    return 0;
  }
}

/**
 * Helper: Mapear comentário do banco para interface
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapComment(data: any): Comment {
  return {
    id: data.id,
    postSlug: data.post_slug,
    authorName: data.author_name,
    authorEmail: data.author_email,
    authorWebsite: data.author_website || undefined,
    content: data.content,
    approved: data.approved,
    spamScore: data.spam_score || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    approvedAt: data.approved_at || undefined,
  };
}

/**
 * Subscribe para novos comentários em tempo real (admin)
 */
export function subscribeToNewComments(
  callback: (comment: Comment) => void
) {
  const subscription = supabase
    .channel('comments-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
      },
      (payload) => {
        callback(mapComment(payload.new));
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
