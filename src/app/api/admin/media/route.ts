import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import { logger } from '@/lib/logger';
import { uploadMedia, listMedia } from '@/lib/cloudflare/media';
import { ImageRejected, MAX_IMAGE_BYTES } from '@/lib/image-sanitize';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Upload é escrita autenticada de arquivo — a rota mais sensível do site.
 * Por isso a ordem aqui é: sessão, limite de taxa, e só então ler o corpo.
 * Ler primeiro daria a quem não está autenticado o direito de fazer o
 * Worker consumir memória com um arquivo de 12 MB.
 */
const UPLOAD_RATE_LIMIT = { windowMs: 60_000, max: 30 };

export async function POST(request: Request) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  const ip = getClientIp(request);
  const { allowed, retryAfterSeconds } = checkRateLimit(`media:${ip}`, UPLOAD_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Muitos envios seguidos. Aguarde um instante.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Envie um arquivo no campo "file".' }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `Arquivo maior que ${MAX_IMAGE_BYTES / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    const str = (k: string) => {
      const v = form.get(k);
      return typeof v === 'string' && v.trim() ? v.trim() : null;
    };

    const record = await uploadMedia({
      bytes: new Uint8Array(await file.arrayBuffer()),
      collection: str('collection') ?? 'viagens',
      ownerId: str('ownerId'),
      captionPt: str('captionPt'),
      captionEn: str('captionEn'),
      altPt: str('altPt'),
      altEn: str('altEn'),
      takenOn: str('takenOn'),
      sortOrder: Number(str('sortOrder') ?? 0) || 0,
    });

    logger.info('Media uploaded', { id: record.id, key: record.r2_key, bytes: record.size_bytes });
    return NextResponse.json({ media: record }, { status: 201 });
  } catch (error) {
    // Recusa de higienização é erro do usuário, não do servidor: o motivo
    // volta para ele porque é acionável ("é SVG", "passou do tamanho").
    if (error instanceof ImageRejected) {
      return NextResponse.json({ error: error.reason }, { status: 415 });
    }
    logger.error('Media upload failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json({ error: 'Falha ao enviar a imagem.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  try {
    const url = new URL(request.url);
    const media = await listMedia(
      url.searchParams.get('collection') ?? undefined,
      url.searchParams.get('ownerId') ?? undefined
    );
    return NextResponse.json({ media });
  } catch (error) {
    logger.error('Media list failed', { error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json({ error: 'Falha ao listar.' }, { status: 500 });
  }
}
