import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type PostUpdate = Database['public']['Tables']['posts']['Update'];

/**
 * GET /api/posts/[slug] - Busca post por slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Parsear JSON fields (Supabase já retorna como array, mas mantemos compatibilidade)
    const parsedPost = {
      ...post,
      keywords: Array.isArray(post.keywords) ? post.keywords : (post.keywords ? JSON.parse(post.keywords) : null),
      tags: Array.isArray(post.tags) ? post.tags : (post.tags ? JSON.parse(post.tags) : null),
      sources: Array.isArray(post.sources) ? post.sources : (post.sources ? JSON.parse(post.sources) : null),
    };

    return NextResponse.json({ post: parsedPost });
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar post' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/posts/[slug] - Atualiza post
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // Preparar dados para atualização
    const updateData: PostUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.coverImage !== undefined) updateData.cover_image = body.coverImage;
    if (body.imageAlt !== undefined) updateData.image_alt = body.imageAlt;
    if (body.keywords !== undefined) {
      updateData.keywords = Array.isArray(body.keywords) ? body.keywords : body.keywords;
    }
    if (body.tags !== undefined) {
      updateData.tags = Array.isArray(body.tags) ? body.tags : body.tags;
    }
    if (body.date !== undefined) updateData.date = body.date;
    if (body.published !== undefined) {
      updateData.published = body.published;
      if (body.published && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.readTime !== undefined) updateData.read_time = body.readTime;
    if (body.score !== undefined) updateData.score = body.score;

    const { data: updated, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('slug', slug)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar post' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[slug] - Deleta post
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug);

    if (error) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar post' },
      { status: 500 }
    );
  }
}
