/**
 * Shared authentication guard for API routes.
 *
 * Usage:
 *   const authResult = await requireAuth(request);
 *   if (authResult instanceof NextResponse) return authResult;
 *   // authResult is now AdminUser
 */

import { NextResponse } from 'next/server';
import { verifySession } from './cloudflare/auth';
import { cookies } from 'next/headers';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

/**
 * Verifies the session cookie and returns the authenticated user
 * or a 401 JSON response. Callers should check `instanceof NextResponse`.
 */
export async function requireAuth(
  _request?: Request
): Promise<AdminUser | NextResponse> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('session-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login em /admin/login' },
        { status: 401 }
      );
    }

    const user = await verifySession(accessToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada' },
        { status: 401 }
      );
    }

    return user;
  } catch {
    return NextResponse.json(
      { error: 'Erro de autenticação' },
      { status: 401 }
    );
  }
}
