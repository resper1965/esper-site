import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);

    // Fazer login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      logger.warn('Login failed', { email, error: error?.message });
      return NextResponse.json(
        { error: error?.message || 'Erro ao fazer login' },
        { status: 401 }
      );
    }

    // Salvar tokens em cookies HTTP-only para segurança
    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      authenticated: true,
    });

    // Configurar cookies com as mesmas configurações de segurança
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    logger.info('Login successful', { email: data.user.email });

    return response;
  } catch (error) {
    logger.error('Error in login API', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

