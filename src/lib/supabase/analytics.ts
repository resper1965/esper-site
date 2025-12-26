import { supabase } from './client';

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

/**
 * Rastrear visualização de um post
 * @param postSlug Slug do post
 * @param userIp IP do usuário (opcional, para analytics)
 * @param userAgent User-Agent do navegador (opcional)
 * @param referrer Referrer (de onde veio, opcional)
 */
export async function trackView(
  postSlug: string,
  userIp?: string,
  userAgent?: string,
  referrer?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_post_views', {
      p_slug: postSlug,
      p_ip: userIp || null,
      p_user_agent: userAgent || null,
      p_referrer: referrer || null,
    });

    if (error) {
      console.error('❌ Track view error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Track view exception:', error);
    return false;
  }
}

/**
 * Adicionar ou remover like de um post
 * @param postSlug Slug do post
 * @param userIp IP do usuário (para evitar duplicatas)
 * @returns { liked: boolean, action: 'added' | 'removed' }
 */
export async function toggleLike(
  postSlug: string,
  userIp: string
): Promise<{ liked: boolean; action: 'added' | 'removed' } | null> {
  try {
    const { data, error } = await supabase.rpc('toggle_post_like', {
      p_slug: postSlug,
      p_user_ip: userIp,
    });

    if (error) {
      console.error('❌ Toggle like error:', error);
      return null;
    }

    return {
      liked: data.liked,
      action: data.action,
    };
  } catch (error) {
    console.error('❌ Toggle like exception:', error);
    return null;
  }
}

/**
 * Verificar se usuário já deu like em um post
 */
export async function hasUserLiked(
  postSlug: string,
  userIp: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_slug', postSlug)
      .eq('user_ip', userIp)
      .single();

    if (error) {
      return false;
    }

    return data !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Obter estatísticas de um post específico
 */
export async function getPostStats(postSlug: string): Promise<PostStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_post_stats', {
      p_slug: postSlug,
    });

    if (error || !data) {
      console.error('❌ Get stats error:', error);
      return {
        slug: postSlug,
        title: '',
        views: 0,
        likes: 0,
      };
    }

    return {
      slug: data.slug,
      title: data.title || '',
      views: data.views || 0,
      likes: data.likes || 0,
      lastViewedAt: data.last_viewed_at,
    };
  } catch (error) {
    console.error('❌ Get stats exception:', error);
    return null;
  }
}

/**
 * Obter top posts por visualizações
 */
export async function getTopPosts(limit: number = 10): Promise<PostStats[]> {
  try {
    const { data, error } = await supabase
      .from('post_stats')
      .select('*')
      .order('views', { ascending: false })
      .limit(limit);

    if (error || !data) {
      console.error('❌ Get top posts error:', error);
      return [];
    }

    return data.map((stat) => ({
      slug: stat.slug,
      title: stat.title,
      views: stat.views || 0,
      likes: stat.likes || 0,
      lastViewedAt: stat.last_viewed_at,
    }));
  } catch (error) {
    console.error('❌ Get top posts exception:', error);
    return [];
  }
}

/**
 * Obter dashboard completo de analytics
 */
export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  try {
    // Total de posts
    const { count: totalPosts } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    // Total de views e likes
    const { data: totals } = await supabase
      .from('post_stats')
      .select('views, likes');

    const totalViews = totals?.reduce((sum, stat) => sum + (stat.views || 0), 0) || 0;
    const totalLikes = totals?.reduce((sum, stat) => sum + (stat.likes || 0), 0) || 0;

    // Top posts
    const topPosts = await getTopPosts(10);

    // Views dos últimos 7 dias
    const { data: recentViewsData } = await supabase
      .from('post_views')
      .select('viewed_at')
      .gte('viewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Agrupar por data
    const viewsByDate = (recentViewsData || []).reduce((acc: Record<string, number>, view) => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const recentViews = Object.entries(viewsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalViews,
      totalLikes,
      totalPosts: totalPosts || 0,
      topPosts,
      recentViews,
    };
  } catch (error) {
    console.error('❌ Get analytics dashboard exception:', error);
    return {
      totalViews: 0,
      totalLikes: 0,
      totalPosts: 0,
      topPosts: [],
      recentViews: [],
    };
  }
}

/**
 * Atualizar view materializada de estatísticas
 * Chamar periodicamente (ex: via cron) para performance
 */
export async function refreshStats(): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('refresh_post_stats');

    if (error) {
      console.error('❌ Refresh stats error:', error);
      return false;
    }

    console.log('✅ Stats refreshed');
    return true;
  } catch (error) {
    console.error('❌ Refresh stats exception:', error);
    return false;
  }
}
