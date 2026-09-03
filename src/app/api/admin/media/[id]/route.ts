import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import { logger } from '@/lib/logger';
import { deleteMedia, updateMedia } from '@/lib/cloudflare/media';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await updateMedia(id, {
      caption_pt: body.captionPt as string | undefined,
      caption_en: body.captionEn as string | undefined,
      alt_pt: body.altPt as string | undefined,
      alt_en: body.altEn as string | undefined,
      taken_on: body.takenOn as string | undefined,
      sort_order: body.sortOrder as number | undefined,
      published: typeof body.published === 'boolean' ? (body.published ? 1 : 0) : undefined,
      owner_id: body.ownerId as string | undefined,
    });
    if (!updated) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
    return NextResponse.json({ media: updated });
  } catch (error) {
    logger.error('Media update failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json({ error: 'Falha ao atualizar.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  try {
    const { id } = await ctx.params;
    const ok = await deleteMedia(id);
    if (!ok) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 });
    logger.info('Media deleted', { id });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    logger.error('Media delete failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json({ error: 'Falha ao apagar.' }, { status: 500 });
  }
}
