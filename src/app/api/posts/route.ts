import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/database.types';

type PostInsert = Database['public']['Tables']['posts']['Insert'];

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
    let query = supabase
      .from('posts')
      .select('*')
      .order('date', { ascending: false });

    if (published === 'true') {
      query = query.eq('published', true);
    } else if (published === 'false') {
      query = query.eq('published', false);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Erro ao buscar posts:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar posts' },
        { status: 500 }
      );
    }

    // Parsear JSON fields (Supabase já retorna como array, mas mantemos compatibilidade)
    const parsedPosts = (posts || []).map(post => ({
      ...post,
      keywords: Array.isArray(post.keywords) ? post.keywords : (post.keywords ? JSON.parse(post.keywords) : null),
      tags: Array.isArray(post.tags) ? post.tags : (post.tags ? JSON.parse(post.tags) : null),
      sources: Array.isArray(post.sources) ? post.sources : (post.sources ? JSON.parse(post.sources) : null),
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
    
    const postData: PostInsert = {
      slug: body.slug,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || '',
      description: body.description || body.excerpt || '',
      category: body.category || 'general',
      language: body.language || 'pt-br',
      author: body.author || 'Ricardo Esper',
      cover_image: body.coverImage || null,
      image_alt: body.imageAlt || null,
      keywords: Array.isArray(body.keywords) ? body.keywords : (body.keywords || null),
      tags: Array.isArray(body.tags) ? body.tags : (body.tags || null),
      date: body.date || new Date().toISOString().split('T')[0],
      published: body.published || false,
      featured: body.featured || false,
      read_time: body.readTime || null,
      generated_by: body.generatedBy || null,
      score: body.score || null,
      sources: Array.isArray(body.sources) ? body.sources : (body.sources || null),
    };

    const { data: newPost, error } = await supabase
      .from('posts')
      .insert([postData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar post:', error);
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
