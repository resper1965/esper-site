import { NextResponse } from 'next/server';
import { generatePost, savePostDraft } from '@/lib/ai/post-generator';
import { fetchSourceContent } from '@/lib/ai/source-fetcher';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, category = 'general', keywords = [] } = body;

    // Validações
    if (!url) {
      return NextResponse.json(
        { error: 'URL é obrigatória' },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    console.log('📥 Extraindo conteúdo da URL...', { url });

    // Extrair conteúdo da URL
    const sourceContent = await fetchSourceContent(url);
    
    if (!sourceContent || !sourceContent.content) {
      return NextResponse.json(
        { error: 'Não foi possível extrair conteúdo da URL' },
        { status: 400 }
      );
    }

    console.log('✅ Conteúdo extraído!', {
      title: sourceContent.title,
      contentLength: sourceContent.content.length
    });

    // Criar prompt para reescrever no tom do Ricardo Esper
    const topic = `Reescreva o seguinte artigo no tom de voz do Ricardo Esper, mantendo as informações principais mas adaptando para o estilo e perspectiva dele:

Título original: ${sourceContent.title}
URL: ${url}

Conteúdo original:
${sourceContent.content.substring(0, 5000)}${sourceContent.content.length > 5000 ? '...' : ''}

Instruções:
- Mantenha as informações técnicas e fatos principais
- Adapte para o tom de voz do Ricardo Esper (experiência, autoridade, casos práticos)
- Adicione insights baseados na experiência dele quando relevante
- Mantenha a estrutura e fluxo do artigo original
- Use primeira pessoa quando apropriado
- Cite a fonte original no final`;

    console.log('🚀 Gerando post no tom do Ricardo Esper...');

    // Gerar post
    const post = await generatePost({
      topic,
      category,
      sources: [{
        title: sourceContent.title,
        url: url,
        summary: sourceContent.content.substring(0, 300) + '...'
      }],
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
        preview: post.content.substring(0, 500) + '...',
        originalTitle: sourceContent.title,
        originalUrl: url
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

