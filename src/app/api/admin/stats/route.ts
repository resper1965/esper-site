import { NextResponse } from 'next/server';
import { getPostStats } from '@/lib/cloudflare/posts';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/requireAuth';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const stats = await getPostStats();
    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Error in admin stats API', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
