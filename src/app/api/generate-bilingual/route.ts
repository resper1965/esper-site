import { NextResponse } from 'next/server';
import { generateBilingualPost, saveBilingualPosts } from '@/lib/ai/post-generator-bilingual';
import { requireAuth } from '@/lib/requireAuth';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { topic, category, sources = [], keywords = [] } = body;

    if (!topic || !category) {
      return NextResponse.json(
        { error: 'topic e category são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🌍 Gerando posts bilíngues...', { topic, category });

    // Generate both PT-BR and EN versions
    const posts = await generateBilingualPost({
      topic,
      category,
      sources,
      keywords,
    });

    console.log(`✅ Posts gerados!`);
    console.log(`   PT-BR Score: ${posts.ptBR.score}/10`);
    console.log(`   EN Score: ${posts.en.score}/10`);

    // Save both drafts
    const saved = await saveBilingualPosts(posts);

    return NextResponse.json({
      success: true,
      posts: {
        ptBR: {
          slug: saved.ptBR.slug,
          score: posts.ptBR.score,
          filepath: saved.ptBR.filepath,
          preview: posts.ptBR.content.substring(0, 300) + '...',
        },
        en: {
          slug: saved.en.slug,
          score: posts.en.score,
          filepath: saved.en.filepath,
          preview: posts.en.content.substring(0, 300) + '...',
        },
      },
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de geração bilíngue de posts funcionando!',
    usage: {
      method: 'POST',
      body: {
        topic: 'string (obrigatório)',
        category: 'cybersecurity | counterespionage | homeautomation | travel | general',
        sources: 'array opcional [{ title, url, summary }]',
        keywords: 'array opcional de strings',
      },
      response: {
        posts: {
          ptBR: '{ slug, score, filepath, preview }',
          en: '{ slug, score, filepath, preview }',
        },
      },
    },
  });
}
