import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/requireAuth';
import { getSettings, setSetting } from '@/lib/settings';

const SECRET_KEY_PATTERN = /(KEY|TOKEN|SECRET|PASSWORD)/i;

function inferCategory(key: string): 'ai' | 'database' | 'security' | 'other' {
  if (/CLOUDFLARE|AI|ANTHROPIC|OPENAI|GEMINI|LLAMA/i.test(key)) return 'ai';
  if (/DB|DATABASE|D1|VECTORIZE|R2|KV/i.test(key)) return 'database';
  if (/JWT|SECRET|PASSWORD|AUTH/i.test(key)) return 'security';
  return 'other';
}

/**
 * GET /api/admin/settings - Fetch settings
 */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const settingsMap = await getSettings();
    const settings = Object.entries(settingsMap).map(([key, value]) => ({
      key,
      value,
      masked: SECRET_KEY_PATTERN.test(key),
      description: `Configuração armazenada em D1 para ${key}`,
      category: inferCategory(key),
    }));

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    logger.error('Error fetching settings', { error });
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings - Save setting
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Chave é obrigatória' }, { status: 400 });
    }

    const saved = await setSetting(key, String(value ?? ''));

    if (!saved) {
      return NextResponse.json(
        { error: 'Não foi possível salvar a configuração' },
        { status: 500 }
      );
    }

    logger.info('Setting saved to D1', { key });

    return NextResponse.json({
      success: true,
      setting: {
        key,
        value: String(value ?? ''),
        updated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error in settings POST', { error });
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
