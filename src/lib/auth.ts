import { cookies } from 'next/headers';
import crypto from 'crypto';

// Configurações de autenticação
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// Gerar hash da senha
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verificar credenciais
export function verifyCredentials(username: string, password: string): boolean {
  // Verificar se as variáveis de ambiente estão configuradas
  if (!ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH === '') {
    console.error('❌ ADMIN_PASSWORD_HASH não está configurado');
    return false;
  }

  const passwordHash = hashPassword(password);
  const usernameMatch = username.trim() === ADMIN_USERNAME.trim();
  const passwordMatch = passwordHash === ADMIN_PASSWORD_HASH.trim();

  if (!usernameMatch || !passwordMatch) {
    console.log('❌ Credenciais inválidas:', {
      usernameMatch,
      passwordMatch,
      providedUsername: username,
      expectedUsername: ADMIN_USERNAME
    });
    return false;
  }

  return true;
}

// Criar token de sessão simples
function createSessionToken(): string {
  const payload = {
    username: ADMIN_USERNAME,
    timestamp: Date.now(),
    random: crypto.randomBytes(16).toString('hex')
  };
  
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(token)
    .digest('hex');
  
  return `${token}.${signature}`;
}

// Verificar token de sessão
function verifySessionToken(token: string): boolean {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
    const isExpired = Date.now() - decoded.timestamp > maxAge;

    return !isExpired && decoded.username === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

// Criar sessão
export async function createSession(): Promise<void> {
  const token = createSessionToken();
  const cookieStore = await cookies();
  
  cookieStore.set('admin_session', token, {
    httpOnly: false, // Mudado para false para permitir acesso via JavaScript se necessário
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  });
  
  console.log('✅ Sessão criada com sucesso');
}

// Verificar sessão
export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) {
      return false;
    }

    return verifySessionToken(sessionToken);
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return false;
  }
}

// Destruir sessão
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}
