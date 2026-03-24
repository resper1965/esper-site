import { NextResponse } from 'next/server';
import {
  getPostBySlug,
  updatePost,
  deletePost,
  type PostUpdate,
} from '@/lib/cloudflare/posts';
import { requireAuth } from '@/lib/requireAuth';

/**
 * GET /api/posts/[slug] - Busca post por slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await getPostBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ post });
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
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { slug } = await params;
    const body = await request.json();

    // Preparar dados para atualização
    const updateData: PostUpdate = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) {
      updateData.category = (body.category && body.category.trim() !== '') ? body.category.trim() : 'general';
    }
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
    }
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.readTime !== undefined) updateData.read_time = body.readTime;
    if (body.score !== undefined) updateData.score = body.score;

    const updated = await updatePost(slug, updateData);

    if (!updated) {
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
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { slug } = await params;

    const success = await deletePost(slug);

    if (!success) {
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
