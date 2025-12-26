import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/settings - Buscar configurações
 */
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar configurações
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('settings')
      .select('*')
      .order('key');

    if (error) {
      // Se a tabela não existir, retornar vazio
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json({ success: true, settings: [] });
      }
      logger.warn('Error fetching settings', { error });
      return NextResponse.json({ success: true, settings: [] });
    }

    return NextResponse.json({ success: true, settings: data || [] });
  } catch (error) {
    logger.error('Error fetching settings', { error });
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings - Salvar configuração
 */
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Chave é obrigatória' }, { status: 400 });
    }

    // Upsert configuração
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('settings')
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'key',
        }
      )
      .select()
      .single();

    if (error) {
      logger.error('Error saving setting', { error, key });
      return NextResponse.json(
        { error: 'Erro ao salvar configuração' },
        { status: 500 }
      );
    }

    logger.info('Setting saved', { key });

    return NextResponse.json({ success: true, setting: data });
  } catch (error) {
    logger.error('Error in settings POST', { error });
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}

