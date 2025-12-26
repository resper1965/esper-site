import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Verificar autenticação
    const accessToken = cookieStore.get('sb-access-token')?.value;
    if (!accessToken) {
      logger.warn('Unauthorized access attempt to admin stats - no access token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      logger.warn('Unauthorized access attempt to admin stats', { error: authError?.message });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todos os posts (incluindo drafts)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('published, category, score');

    if (postsError) {
      logger.error('Error fetching posts for stats', { error: postsError.message });
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Calcular estatísticas
    const totalPosts = posts?.length || 0;
    const publishedPosts = posts?.filter(p => p.published === true).length || 0;
    const draftPosts = posts?.filter(p => p.published === false).length || 0;

    // Contar por categoria (usando campo category diretamente)
    const categoryCounts: { [key: string]: number } = {};
    posts?.forEach(post => {
      // Usar category diretamente da tabela (campo obrigatório)
      const category = post.category || 'general';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
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

