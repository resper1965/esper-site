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
  // IMPORTANTE: Usar anon key, não service role key
  // Service role bypassa RLS e não funciona com autenticação de usuário
  const clientKey = supabaseKey;
  
  const client = createClient<Database>(supabaseUrl, clientKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Se cookies foram fornecidos, usar o token diretamente nas requisições
  if (cookies) {
    const accessToken = cookies.get('sb-access-token')?.value;
    
    if (accessToken) {
      // Configurar o header Authorization para todas as requisições
      // Isso é mais confiável que setSession
      client.rest.headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }
  
  return client;
}
