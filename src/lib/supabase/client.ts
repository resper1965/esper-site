import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Durante o build, usar valores placeholder se não estiverem disponíveis
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (process.env.NEXT_PHASE === 'phase-production-build' ? 'https://placeholder.supabase.co' : '');
// Suporta tanto a chave publishable moderna quanto a anon key legacy
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                    (process.env.NEXT_PHASE === 'phase-production-build' ? 'placeholder-key' : '');

if (!supabaseUrl || !supabaseKey) {
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }
}

// Cliente Supabase para uso geral (server-side e client-side)
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: typeof window !== 'undefined', // Apenas no client
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Cliente para uso exclusivo no servidor (com cookies da requisição)
// Lê cookies do request para manter sessão do usuário
export function createServerSupabaseClient(cookies?: { get: (name: string) => { value: string } | undefined }) {
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;
  
  const client = createClient<Database>(supabaseUrl, serverKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Se cookies foram fornecidos, tentar ler a sessão
  if (cookies) {
    const accessToken = cookies.get('sb-access-token')?.value;
    const refreshToken = cookies.get('sb-refresh-token')?.value;
    
    if (accessToken) {
      // Definir o token de acesso manualmente
      // Tipagem do Supabase requer any aqui
      const sessionData = {
        access_token: accessToken,
        refresh_token: refreshToken || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      client.auth.setSession(sessionData).catch(() => {
        // Ignorar erros ao definir sessão
      });
    }
  }
  
  return client;
}
