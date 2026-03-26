import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { signIn } from '../../../../lib/cloudflare/auth';
import { checkRateLimit } from '@/lib/rate-limit';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return '127.0.0.1';
}

export async function POST(request: Request) {
  // ── Rate limiting (5 attempts / 15 min per IP) ──────────
  const ip = getClientIp(request);
  const { allowed, retryAfterSeconds } = checkRateLimit(ip, {
    windowMs: 15 * 60 * 1000,
    maxAttempts: 5,
  });

  if (!allowed) {
    logger.warn('Login rate limited', { ip });
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const { user, session, error } = await signIn(email, password);

    if (error || !session || !user) {
      logger.warn('Login failed', { email, error });
      return NextResponse.json(
        { error: error || 'Erro ao fazer login' },
        { status: 401 }
      );
    }

    // Return user info and set JWT token in HTTP-only cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      authenticated: true,
    });

    response.cookies.set('session-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours (matches JWT expiry)
    });

    logger.info('Login successful', { email: user.email });

    return response;
  } catch (error) {
    logger.error('Error in login API', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
