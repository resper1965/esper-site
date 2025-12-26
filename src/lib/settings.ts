/**
 * Settings module - Gerenciamento de configurações/variáveis de ambiente
 * 
 * Busca configurações do Supabase ao invés de process.env para permitir
 * edição via interface admin.
 */

import { createServerSupabaseClient } from './supabase/client';

/**
 * Busca valor de uma configuração do Supabase
 * Fallback para process.env se não encontrar no Supabase
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (!data) {
      // Fallback para process.env
      return process.env[key] || null;
    }

    return data.value || null;
  } catch {
    // Em caso de erro, usar process.env como fallback
    return process.env[key] || null;
  }
}

/**
 * Busca múltiplas configurações de uma vez
 */
export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};

  try {
    const supabase = createServerSupabaseClient();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('settings')
      .select('key, value')
      .in('key', keys);

    if (data) {
      data.forEach((item: { key: string; value: string }) => {
        result[item.key] = item.value;
      });
    }

    // Preencher com process.env para chaves não encontradas
    keys.forEach((key) => {
      if (!(key in result)) {
        result[key] = process.env[key] || null;
      }
    });

    return result;
  } catch {
    // Em caso de erro, usar apenas process.env
    keys.forEach((key) => {
      result[key] = process.env[key] || null;
    });
    return result;
  }
}

