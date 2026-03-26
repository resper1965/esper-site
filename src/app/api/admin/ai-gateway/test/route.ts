import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/requireAuth';
import { generateChatCompletion } from '@/lib/cloudflare/ai-gateway';

/**
 * POST /api/admin/ai-gateway/test - Testar conexão com AI Gateway
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    await request.json().catch(() => ({}));

    try {
      const result = await generateChatCompletion({
        model: '@cf/meta/llama-3.1-8b-instruct-fast',
        maxTokens: 32,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: 'Responda de forma extremamente curta.',
          },
          {
            role: 'user',
            content: 'Responda apenas OK',
          },
        ],
      });

      logger.info('Cloudflare AI test successful', {
        model: result.model,
        responseLength: result.text.length,
      });

      return NextResponse.json({
        success: true,
        model: result.model,
        response: result.text,
      });
    } catch (error) {
      logger.error('Cloudflare AI test failed', { error });
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
