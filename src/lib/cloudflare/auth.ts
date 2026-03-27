/**
 * Auth module — Cookie/JWT replacement for supabase/auth.ts
 *
 * Uses a simple admin authentication approach:
 * - JWT tokens stored in HTTP-only cookies
 * - Password verified against hashed value in D1
 * - No Supabase Auth dependency
 *
 * Identical exports: signIn, signOut, getSession, getCurrentUser,
 * isAuthenticated, onAuthStateChange, resetPassword, updatePassword.
 */

import { db } from './d1-client';

// ── Types ─────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  access_token: string;
  user: AdminUser;
  expires_at: string;
}

// ── Helpers ───────────────────────────────────────────────

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start with an insecure configuration.');
  }
  return secret;
}
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Simple HMAC-based token (not full JWT for simplicity; can upgrade to jose)
 */
async function createToken(payload: Record<string, unknown>): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const data = `${header}.${body}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getJwtSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));

  return `${data}.${sigB64}`;
}

async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const [header, body, sig] = token.split('.');
    if (!header || !body || !sig) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(getJwtSecret()),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = `${header}.${body}`;
    const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(data)
    );

    if (!valid) return null;

    const payload = JSON.parse(atob(body));
    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Hash a password using PBKDF2 with a random 16-byte salt.
 * Returns "salt:hash" hex string for storage.
 */
async function hashPassword(password: string, existingSalt?: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = existingSalt
    ? Uint8Array.from(existingSalt.match(/.{2}/g)!.map((h) => parseInt(h, 16)))
    : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  );

  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return `${saltHex}:${hashHex}`;
}

/**
 * Constant-time comparison of two hex strings.
 * Prevents timing side-channel attacks on password verification.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}

/**
 * Verify a password against a stored "salt:hash" string.
 * Also supports legacy SHA-256 hashes (no colon) for migration.
 */
async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.includes(':')) {
    // PBKDF2 format: "salt:hash"
    const [salt] = storedHash.split(':');
    const computed = await hashPassword(password, salt);
    return constantTimeEqual(computed, storedHash);
  }
  // Legacy SHA-256 fallback — DEPRECATED: migrate these users to PBKDF2
  console.warn('[AUTH] Legacy SHA-256 password hash detected — schedule migration to PBKDF2');
  const encoder = new TextEncoder();
  const data = encoder.encode(password + getJwtSecret());
  const hash = await crypto.subtle.digest('SHA-256', data);
  const legacyHash = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return constantTimeEqual(legacyHash, storedHash);
}

// ── Public API ────────────────────────────────────────────

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: AdminUser | null; session: Session | null; error: string | null }> {
  try {
    const row = await db().first<{
      id: string;
      email: string;
      name: string;
      role: string;
      password_hash: string;
    }>(
      `SELECT id, email, name, role, password_hash FROM admin_users WHERE email = ?`,
      [email]
    );

    if (!row) {
      return { user: null, session: null, error: 'Invalid email or password' };
    }

    const passwordValid = await verifyPassword(password, row.password_hash);
    if (!passwordValid) {
      return { user: null, session: null, error: 'Invalid email or password' };
    }

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    const token = await createToken({
      sub: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      exp: Date.now() + SESSION_DURATION_MS,
    });

    const user: AdminUser = { id: row.id, email: row.email, name: row.name, role: row.role };
    const session: Session = { access_token: token, user, expires_at: expiresAt };

    return { user, session, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { user: null, session: null, error: 'Internal error' };
  }
}

/**
 * Sign out — client-side only.
 * Callers should POST to /api/auth/logout to clear HTTP-only cookies.
 * This function is a no-op on the server (cookies are HTTP-only).
 */
export async function signOut(): Promise<{ error: string | null }> {
  if (typeof window === 'undefined') {
    // Server-side: cannot clear HTTP-only cookies from here.
    // The API route handler clears the cookie directly.
    return { error: null };
  }
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) throw new Error('Logout failed');
    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Verify the current session from a token.
 * Server-side: reads from cookies(). Client-side: calls /api/auth/check.
 */
export async function getSession(): Promise<{ session: Session | null; error: string | null }> {
  if (typeof window !== 'undefined') {
    // Client-side: call the auth check API
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.authenticated && data.user) {
        return {
          session: {
            access_token: '',
            user: data.user as AdminUser,
            expires_at: '',
          },
          error: null,
        };
      }
      return { session: null, error: null };
    } catch {
      return { session: null, error: 'Failed to check session' };
    }
  }

  // Server-side: use Next.js cookies()
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('session-token')?.value;
    if (!token) return { session: null, error: null };

    const user = await verifySession(token);
    if (!user) return { session: null, error: null };

    return {
      session: {
        access_token: token,
        user,
        expires_at: '',
      },
      error: null,
    };
  } catch {
    return { session: null, error: 'Failed to read session cookies' };
  }
}

/**
 * Get the currently authenticated user.
 */
export async function getCurrentUser(): Promise<{ user: AdminUser | null; error: string | null }> {
  const { session, error } = await getSession();
  if (error) return { user: null, error };
  return { user: session?.user ?? null, error: null };
}

/**
 * Server-side: verify a token string (used by API routes / middleware)
 */
export async function verifySession(token: string): Promise<AdminUser | null> {
  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.sub as string,
    email: payload.email as string,
    name: (payload.name as string) || '',
    role: payload.role as string,
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const { session } = await getSession();
  return session !== null;
}

/**
 * Auth state change listener — no-op for cookie-based auth
 */
export function onAuthStateChange(
  _callback: (event: string, session: unknown) => void
): { data: { subscription: { unsubscribe: () => void } } } {
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          /* no-op */
        },
      },
    },
  };
}

/**
 * Password reset — not yet implemented.
 * Returns an error so callers know the operation did not succeed.
 */
export async function resetPassword(_email: string): Promise<{ error: string | null }> {
  return { error: 'Password reset is not yet implemented. Contact the administrator.' };
}

/**
 * Update password for the current user
 */
/**
 * Update password — not yet implemented.
 * Returns an error so callers know the operation did not succeed.
 */
export async function updatePassword(_newPassword: string): Promise<{ error: string | null }> {
  return { error: 'Password update is not yet implemented. Use the admin CLI to change passwords.' };
}
