import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    // Clear the auth cookie — no server-side session to invalidate
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session-token');

    logger.info('Logout successful');
    return response;
  } catch (error) {
    logger.error('Error in logout', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}
