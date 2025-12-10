import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * POST /api/posts/[slug]/publish - Publica um post
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [updated] = await db
      .update(schema.posts)
      .set({
        published: true,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.posts.slug, slug))
      .returning();

    if (!updated) {
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

    const [updated] = await db
      .update(schema.posts)
      .set({
        published: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.posts.slug, slug))
      .returning();

    if (!updated) {
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

