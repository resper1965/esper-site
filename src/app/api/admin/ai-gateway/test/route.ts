import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/ai-gateway/test - Testar conexão com AI Gateway
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

    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'Chave API é obrigatória' }, { status: 400 });
    }

    // Testar conexão com um modelo simples
    try {
      const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: 'https://ai-gateway.vercel.sh/v1',
      });

      const result = await generateText({
        model: openai('google/gemini-2.5-flash'), // Modelo rápido para teste
        prompt: 'Responda apenas: OK',
      });

      logger.info('AI Gateway test successful', {
        model: 'google/gemini-2.5-flash',
        responseLength: result.text.length,
      });

      return NextResponse.json({
        success: true,
        model: 'google/gemini-2.5-flash',
        response: result.text,
      });
    } catch (error) {
      logger.error('AI Gateway test failed', { error });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao testar conexão',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error in AI Gateway test', { error });
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}

