import { NextRequest, NextResponse } from 'next/server'
import { searchPosts } from '@/lib/cloudflare/search'

// Sem `export const runtime = 'edge'`: no Cloudflare Workers a aplicação
// inteira já roda no runtime de edge, e a declaração quebra o bundler do
// OpenNext, que exige funções edge em bundles separados.

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''

  if (q.trim().length < 2) {
    return NextResponse.json([])
  }

  try {
    const results = await searchPosts(q, 'pt-br', 8)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json([], { status: 500 })
  }
}
