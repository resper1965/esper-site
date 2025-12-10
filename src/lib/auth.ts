import { cookies } from 'next/headers';

// Configuração simples - apenas uma senha
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

// Verificar senha
export function verifyPassword(password: string): boolean {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD === '') {
    console.error('❌ ADMIN_PASSWORD não está configurado');
    return false;
  }

  return password.trim() === ADMIN_PASSWORD.trim();
}

// Criar sessão simples - apenas um cookie com valor fixo
export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin_logged_in', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    path: '/',
  });
}

// Verificar sessão - apenas verifica se o cookie existe
export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const isLoggedIn = cookieStore.get('admin_logged_in')?.value === 'true';
    return isLoggedIn;
  } catch {
    return false;
  }
}

// Destruir sessão
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_logged_in');
}
