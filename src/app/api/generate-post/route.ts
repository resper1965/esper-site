import { NextResponse } from 'next/server';
import { generatePost, savePostDraft } from '@/lib/ai/post-generator';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, category, sources = [], keywords = [] } = body;

    // Validações
    if (!topic || !category) {
      return NextResponse.json(
        { error: 'topic e category são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🚀 Gerando post...', { topic, category });

    // Gerar post
    const post = await generatePost({
      topic,
      category,
      sources,
      keywords
    });

    console.log(`✅ Post gerado! Score: ${post.score}/10`);

    // Salvar como draft
    const saved = await savePostDraft(post);

    return NextResponse.json({
      success: true,
      post: {
        slug: saved.slug,
        score: post.score,
        filepath: saved.filepath,
        preview: post.content.substring(0, 500) + '...'
      }
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}

// GET para testar
export async function GET() {
  return NextResponse.json({
    message: 'API de geração de posts funcionando!',
    usage: {
      method: 'POST',
      body: {
        topic: 'string (obrigatório)',
        category: 'cybersecurity | counterespionage | homeautomation | travel | general',
        sources: 'array opcional [{ title, url, summary }]',
        keywords: 'array opcional de strings'
      }
    }
  });
}
