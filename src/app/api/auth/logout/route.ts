import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    
    // Fazer logout no Supabase
    await supabase.auth.signOut();
    
    // Remover cookies de autenticação
    const response = NextResponse.json({ success: true });
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

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
