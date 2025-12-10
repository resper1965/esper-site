import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * GET /api/posts/[slug] - Busca post por slug
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const [post] = await db
      .select()
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    // Parsear JSON fields
    const parsedPost = {
      ...post,
      keywords: post.keywords ? JSON.parse(post.keywords) : null,
      tags: post.tags ? JSON.parse(post.tags) : null,
      sources: post.sources ? JSON.parse(post.sources) : null,
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
    const updateData: Partial<typeof schema.posts.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.language !== undefined) updateData.language = body.language;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.imageAlt !== undefined) updateData.imageAlt = body.imageAlt;
    if (body.keywords !== undefined) updateData.keywords = JSON.stringify(body.keywords);
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.date !== undefined) updateData.date = body.date;
    if (body.published !== undefined) {
      updateData.published = body.published;
      if (body.published && !updateData.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
    }
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.readTime !== undefined) updateData.readTime = body.readTime;
    if (body.score !== undefined) updateData.score = body.score;

    const [updated] = await db
      .update(schema.posts)
      .set(updateData)
      .where(eq(schema.posts.slug, slug))
      .returning();

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
    const { slug } = await params;

    const [deleted] = await db
      .delete(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .returning();

    if (!deleted) {
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

