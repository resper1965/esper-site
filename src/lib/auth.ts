import { cookies } from 'next/headers';
import crypto from 'crypto';

// Senha hash (SHA256) - configure ADMIN_PASSWORD no .env
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production';

// Gerar hash da senha (use: node -e "console.log(require('crypto').createHash('sha256').update('sua-senha').digest('hex'))")
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verificar credenciais
export function verifyCredentials(username: string, password: string): boolean {
  const passwordHash = hashPassword(password);
  return username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH;
}

// Gerar token de sessão
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verificar token de sessão
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;
  
  if (!sessionToken) {
    return false;
  }

  // Verificar se o token está válido (comparar com hash armazenado)
  const expectedHash = cookieStore.get('admin_session_hash')?.value;
  if (!expectedHash) {
    return false;
  }

  const tokenHash = crypto.createHash('sha256').update(sessionToken + SESSION_SECRET).digest('hex');
  return tokenHash === expectedHash;
}

// Criar sessão
export async function createSession(): Promise<string> {
  const token = generateSessionToken();
  const tokenHash = crypto.createHash('sha256').update(token + SESSION_SECRET).digest('hex');
  
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
  
  cookieStore.set('admin_session_hash', tokenHash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return token;
}

// Destruir sessão
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  cookieStore.delete('admin_session_hash');
}

