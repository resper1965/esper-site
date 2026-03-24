import { NextResponse } from 'next/server';
import {
  getAllPosts,
  getAllPostsIncludingDrafts,
  getDraftPosts,
  createPost,
  type PostInsert,
} from '@/lib/cloudflare/posts';
import { requireAuth } from '@/lib/requireAuth';

/**
 * GET /api/posts - Lista todos os posts
 * Query params: ?published=true&category=cybersecurity&limit=10
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const limit = searchParams.get('limit');

    let posts;
    if (published === 'false') {
      // If explicitly asking for unpublished, return drafts only
      posts = await getDraftPosts();
    } else if (published === 'true') {
      posts = await getAllPosts();
    } else {
      posts = await getAllPostsIncludingDrafts();
    }

    if (limit) {
      posts = posts.slice(0, parseInt(limit));
    }

    return NextResponse.json({ posts });
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
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();

    const postData: PostInsert = {
      slug: body.slug,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || '',
      description: body.description || body.excerpt || '',
      category: (body.category && body.category.trim() !== '') ? body.category.trim() : 'general',
      language: body.language || 'pt-br',
      author: body.author || 'Ricardo Esper',
      cover_image: body.coverImage || undefined,
      image_alt: body.imageAlt || undefined,
      keywords: Array.isArray(body.keywords) ? body.keywords : (body.keywords || undefined),
      tags: Array.isArray(body.tags) ? body.tags : (body.tags || undefined),
      date: body.date || new Date().toISOString().split('T')[0],
      published: body.published || false,
      featured: body.featured || false,
      read_time: body.readTime || undefined,
      generated_by: body.generatedBy || undefined,
      score: body.score || undefined,
      sources: Array.isArray(body.sources) ? body.sources : (body.sources || undefined),
    };

    const newPost = await createPost(postData);

    if (!newPost) {
      return NextResponse.json(
        { error: 'Erro ao criar post' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return NextResponse.json(
      { error: 'Erro ao criar post' },
      { status: 500 }
    );
  }
}
