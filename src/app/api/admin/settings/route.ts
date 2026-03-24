import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/requireAuth';

/**
 * GET /api/admin/settings - Fetch settings
 * 
 * Settings table is not yet migrated to D1.
 * Returns empty array until migration is completed.
 */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    // TODO: Implement settings in D1 when needed
    return NextResponse.json({ success: true, settings: [] });
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
 * 
 * Settings table is not yet migrated to D1.
 * Returns success stub until migration is completed.
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Chave é obrigatória' }, { status: 400 });
    }

    // TODO: Implement settings upsert in D1 when needed
    logger.info('Setting save requested (D1 not yet configured)', { key });

    return NextResponse.json({
      success: true,
      setting: { key, value, updated_at: new Date().toISOString() },
    });
  } catch (error) {
    logger.error('Error in settings POST', { error });
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
