import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * POST /api/posts/[slug]/publish - Publica um post
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data: updated, error } = await supabase
      .from('posts')
      .update({
        published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      post: updated,
      message: 'Post publicado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao publicar post:', error);
    return NextResponse.json(
      { error: 'Erro ao publicar post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[slug]/publish - Despublica um post
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data: updated, error } = await supabase
      .from('posts')
      .update({
        published: false,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', slug)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      post: updated,
      message: 'Post despublicado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao despublicar post:', error);
    return NextResponse.json(
      { error: 'Erro ao despublicar post' },
      { status: 500 }
    );
  }
}
