import { NextResponse } from 'next/server';
import { generatePost, savePostDraft } from '@/lib/ai/post-generator';
import { requireAuth } from '@/lib/requireAuth';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

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
        preview: post.content.substring(0, 500) + '...',
        coverImage: saved.coverImage
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

// GET removed — was leaking API surface to unauthenticated users.
// Use POST with auth instead.

