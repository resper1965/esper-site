import { supabase } from './client';

/**
 * Login com email e senha usando Supabase Auth
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    return { user: null, session: null, error: error.message };
  }

  return { user: data.user, session: data.session, error: null };
}

/**
 * Logout do usuário atual
 */
export async function signOut() {
  try {
    // Chamar API route para logout que remove cookies
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer logout');
    }

    // Também fazer logout no cliente
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

/**
 * Verifica se há uma sessão ativa
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Get session error:', error);
    return { session: null, error: error.message };
  }

  return { session: data.session, error: null };
}

/**
 * Retorna o usuário atual autenticado
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Get user error:', error);
    return { user: null, error: error.message };
  }

  return { user, error: null };
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const { session } = await getSession();
  return session !== null;
}

/**
 * Hook para ouvir mudanças na autenticação
 */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Recuperação de senha
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin/reset-password`,
  });

  if (error) {
    console.error('Password reset error:', error);
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Atualizar senha (após reset)
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    console.error('Update password error:', error);
    return { error: error.message };
  }

  return { error: null };
}
