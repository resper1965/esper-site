import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/posts - Lista todos os posts
 * Query params: ?published=true&category=cybersecurity&limit=10
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const limit = searchParams.get('limit');
    // const category = searchParams.get('category'); // TODO: implementar filtro por categoria

    // Construir query base
    let posts;
    
    if (published === 'true') {
      posts = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.published, true))
        .orderBy(desc(schema.posts.date))
        .limit(limit ? parseInt(limit) : undefined);
    } else if (published === 'false') {
      posts = await db
        .select()
        .from(schema.posts)
        .where(eq(schema.posts.published, false))
        .orderBy(desc(schema.posts.date))
        .limit(limit ? parseInt(limit) : undefined);
    } else {
      posts = await db
        .select()
        .from(schema.posts)
        .orderBy(desc(schema.posts.date))
        .limit(limit ? parseInt(limit) : undefined);
    }

    // Parsear JSON fields
    const parsedPosts = posts.map(post => ({
      ...post,
      keywords: post.keywords ? JSON.parse(post.keywords) : null,
      tags: post.tags ? JSON.parse(post.tags) : null,
      sources: post.sources ? JSON.parse(post.sources) : null,
    }));

    return NextResponse.json({ posts: parsedPosts });
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar posts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts - Cria novo post
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const postData = {
      slug: body.slug,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || '',
      description: body.description || body.excerpt || '',
      category: body.category || 'general',
      language: body.language || 'pt-br',
      author: body.author || 'Ricardo Esper',
      coverImage: body.coverImage || null,
      imageAlt: body.imageAlt || null,
      keywords: body.keywords ? JSON.stringify(body.keywords) : null,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      date: body.date || new Date().toISOString().split('T')[0],
      published: body.published || false,
      featured: body.featured || false,
      readTime: body.readTime || null,
      generatedBy: body.generatedBy || null,
      score: body.score || null,
      sources: body.sources ? JSON.stringify(body.sources) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: body.published ? new Date().toISOString() : null,
    };

    const [newPost] = await db.insert(schema.posts).values(postData).returning();

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return NextResponse.json(
      { error: 'Erro ao criar post' },
      { status: 500 }
    );
  }
}

