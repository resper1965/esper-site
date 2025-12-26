import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.warn('Unauthorized access attempt to admin stats', { error: authError?.message });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todos os posts (incluindo drafts)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('published, tags, score');

    if (postsError) {
      logger.error('Error fetching posts for stats', { error: postsError.message });
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Calcular estatísticas
    const totalPosts = posts?.length || 0;
    const publishedPosts = posts?.filter(p => p.published === true).length || 0;
    const draftPosts = posts?.filter(p => p.published === false).length || 0;

    // Contar por categoria (usando tags diretamente da tabela)
    const categoryCounts: { [key: string]: number } = {};
    posts?.forEach(post => {
      const tags = (post.tags as string[]) || [];
      if (tags.length > 0) {
        const primaryTag = tags[0];
        categoryCounts[primaryTag] = (categoryCounts[primaryTag] || 0) + 1;
      }
    });

    // Calcular score médio (usando campo score diretamente da tabela)
    let avgScore = 0;
    let scoresCount = 0;
    posts?.forEach(post => {
      if (post.score && typeof post.score === 'number') {
        avgScore += post.score;
        scoresCount++;
      }
    });
    avgScore = scoresCount > 0 ? avgScore / scoresCount : 0;

    const stats = {
      totalPosts,
      draftPosts,
      publishedPosts,
      avgScore: Math.round(avgScore * 10) / 10, // Arredondar para 1 casa decimal
      categoryCounts,
    };

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Error in admin stats API', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

