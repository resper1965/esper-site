import { NextResponse } from 'next/server';
import { getAllSources } from '@/lib/ai/source-fetcher';
import { analyzeTopics, selectBestTopic } from '@/lib/ai/topic-analyzer';
import { generatePost, savePostDraft } from '@/lib/ai/post-generator';
import { canPublishToday, canPublishCategory, getRecentPostTitles } from '@/lib/ai/scheduler';
import { sendPostGeneratedNotification, sendErrorNotification } from '@/lib/ai/email-notifier';

export async function GET(request: Request) {
  // Verificar auth token (opcional, para segurança)
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET || 'your-secret-token';

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🤖 Iniciando geração automática de post...');

    // 1. Verificar se pode publicar hoje
    if (!(await canPublishToday())) {
      console.log('⏸️ Já atingiu limite de posts hoje');
      return NextResponse.json({
        message: 'Limite diário atingido',
        skipped: true
      });
    }

    // 2. Buscar fontes recentes (últimas 24h)
    console.log('📡 Buscando fontes...');
    const sources = await getAllSources(24);

    if (sources.length === 0) {
      console.log('⚠️ Nenhuma fonte nova encontrada');
      return NextResponse.json({
        message: 'Nenhuma fonte nova',
        skipped: true
      });
    }

    console.log(`✅ ${sources.length} fontes encontradas`);

    // 3. Analisar tópicos
    console.log('🧠 Analisando tópicos...');
    const suggestions = await analyzeTopics(sources);

    if (suggestions.length === 0) {
      console.log('⚠️ Nenhum tópico sugerido');
      return NextResponse.json({
        message: 'Nenhum tópico relevante',
        skipped: true
      });
    }

    console.log(`✅ ${suggestions.length} tópicos sugeridos`);

    // 4. Selecionar melhor tópico (não duplicado)
    const recentPosts = await getRecentPostTitles(30);
    const selectedTopic = await selectBestTopic(suggestions, recentPosts);

    if (!selectedTopic) {
      console.log('⚠️ Todos tópicos são duplicados ou não adequados');
      return NextResponse.json({
        message: 'Tópicos duplicados',
        skipped: true
      });
    }

    console.log(`✅ Tópico selecionado: ${selectedTopic.topic}`);

    // 5. Verificar se pode publicar nesta categoria
    if (!(await canPublishCategory(selectedTopic.category))) {
      console.log(`⏸️ Categoria "${selectedTopic.category}" publicada recentemente`);
      return NextResponse.json({
        message: 'Categoria publicada recentemente',
        category: selectedTopic.category,
        skipped: true
      });
    }

    // 6. Gerar post
    console.log('✍️ Gerando post...');
    const post = await generatePost({
      topic: selectedTopic.topic,
      category: selectedTopic.category,
      keywords: selectedTopic.keywords,
      sources: sources
        .filter(s => selectedTopic.sources.includes(s.url))
        .map(s => ({
          title: s.title,
          url: s.url,
          summary: s.summary
        }))
    });

    console.log(`✅ Post gerado! Score: ${post.score}/10`);

    // 7. Salvar draft
    const saved = await savePostDraft(post);
    console.log(`✅ Draft salvo: ${saved.filepath}`);

    // 8. Enviar notificação por email
    await sendPostGeneratedNotification({
      title: selectedTopic.topic,
      slug: saved.slug,
      score: post.score,
      filepath: saved.filepath,
      category: selectedTopic.category
    });

    // 9. Auto-publish se score muito alto
    let isPublished = false;
    let finalPath = saved.filepath;

    if (post.score >= 9.0 && process.env.AUTO_PUBLISH === 'true') {
      console.log('🚀 Score alto! Auto-publicando...');
      const { publishPost } = await import('@/lib/ai/post-generator');
      const published = await publishPost(saved.filepath);
      finalPath = published.filepath;
      isPublished = true;
      console.log(`✅ Post publicado automaticamente: ${finalPath}`);
    }

    return NextResponse.json({
      success: true,
      topic: selectedTopic.topic,
      category: selectedTopic.category,
      score: post.score,
      slug: saved.slug,
      filepath: finalPath,
      autoPublished: isPublished
    });

  } catch (error) {
    console.error('❌ Erro na geração automática:', error);

    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorObj = error instanceof Error ? error : new Error(errorMessage);

    // Enviar notificação de erro
    await sendErrorNotification(errorObj, 'Cron Job - Geração Automática');

    return NextResponse.json({
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

// Método POST para teste manual
export async function POST(request: Request) {
  return GET(request);
}
