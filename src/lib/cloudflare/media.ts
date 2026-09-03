/**
 * Mídia — R2 para os bytes, D1 para o que os descreve.
 *
 * O `storage.ts` que já existia aqui fala com o R2 pela API REST e precisa de
 * um token em runtime. Isso é o padrão de antes da migração, que teve como
 * objetivo justamente eliminar tokens do caminho quente. Este módulo usa o
 * binding `IMAGES`, que o Worker já tem: sem credencial, sem rede saindo,
 * sem segredo para vazar.
 */

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { db } from './d1-client';
import type { Env, R2Bucket } from './env.d';
import { sanitizeImage, type ImageKind } from '@/lib/image-sanitize';

export interface MediaRecord {
  id: string;
  r2_key: string;
  content_type: string;
  size_bytes: number;
  orientation: number | null;
  collection: string;
  owner_id: string | null;
  caption_pt: string | null;
  caption_en: string | null;
  alt_pt: string | null;
  alt_en: string | null;
  taken_on: string | null;
  sort_order: number;
  published: number;
  created_at: string;
}

function bucket(): R2Bucket {
  const { env } = getCloudflareContext() as unknown as { env: Env };
  if (!env?.IMAGES) {
    throw new Error('Binding IMAGES (R2) indisponível. Confira o wrangler.toml.');
  }
  return env.IMAGES;
}

const EXT: Record<ImageKind, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * A chave do objeto é gerada aqui, nunca recebida do cliente.
 *
 * Nome de arquivo enviado por terceiro é entrada hostil: `../` escapa do
 * prefixo, unicode confunde a leitura, e um nome repetido sobrescreve foto
 * de outra viagem em silêncio. Gerando a chave, nada disso é possível — e
 * o nome original, que só serve para o humano se localizar, vira legenda.
 */
export function buildKey(collection: string, ownerId: string | null, kind: ImageKind): string {
  const safe = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 40);
  const rand = crypto.randomUUID();
  const scope = ownerId ? `${safe(collection)}/${safe(ownerId)}` : safe(collection);
  return `${scope}/${rand}.${EXT[kind]}`;
}

export interface UploadInput {
  bytes: Uint8Array;
  collection: string;
  ownerId?: string | null;
  captionPt?: string | null;
  captionEn?: string | null;
  altPt?: string | null;
  altEn?: string | null;
  takenOn?: string | null;
  sortOrder?: number;
}

/**
 * Higieniza, grava no R2 e registra no D1 — nessa ordem.
 *
 * Se a higienização recusar o arquivo, nada é gravado: o `sanitizeImage`
 * lança antes de qualquer escrita.
 */
export async function uploadMedia(input: UploadInput): Promise<MediaRecord> {
  const clean = sanitizeImage(input.bytes);
  const key = buildKey(input.collection, input.ownerId ?? null, clean.kind);

  await bucket().put(key, clean.bytes.buffer as ArrayBuffer, {
    httpMetadata: {
      contentType: clean.kind,
      // Imutável porque a chave é única por upload: trocar a foto gera outra
      // chave, então este objeto nunca muda de conteúdo.
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  const id = crypto.randomUUID();
  await db().query(
    `INSERT INTO media
       (id, r2_key, content_type, size_bytes, orientation, collection, owner_id,
        caption_pt, caption_en, alt_pt, alt_en, taken_on, sort_order, published)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0)`,
    [
      id,
      key,
      clean.kind,
      clean.bytes.length,
      clean.orientation ?? null,
      input.collection,
      input.ownerId ?? null,
      input.captionPt ?? null,
      input.captionEn ?? null,
      input.altPt ?? null,
      input.altEn ?? null,
      input.takenOn ?? null,
      input.sortOrder ?? 0,
    ]
  );

  const { results } = await db().query<MediaRecord>('SELECT * FROM media WHERE id = ?', [id]);
  return results[0];
}

export async function listMedia(collection?: string, ownerId?: string): Promise<MediaRecord[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (collection) { where.push('collection = ?'); params.push(collection); }
  if (ownerId) { where.push('owner_id = ?'); params.push(ownerId); }
  const sql = `SELECT * FROM media ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY sort_order ASC, created_at DESC`;
  const { results } = await db().query<MediaRecord>(sql, params);
  return results;
}

/** Só o que está publicado — o que a página pública consome. */
export async function listPublishedMedia(collection: string, ownerId?: string): Promise<MediaRecord[]> {
  return (await listMedia(collection, ownerId)).filter((m) => m.published === 1);
}

export async function getMedia(id: string): Promise<MediaRecord | null> {
  const { results } = await db().query<MediaRecord>('SELECT * FROM media WHERE id = ?', [id]);
  return results[0] ?? null;
}

/** Apaga o objeto e depois o registro — nesta ordem, para não deixar linha órfã apontando para o nada. */
export async function deleteMedia(id: string): Promise<boolean> {
  const record = await getMedia(id);
  if (!record) return false;
  await bucket().delete(record.r2_key);
  await db().query('DELETE FROM media WHERE id = ?', [id]);
  return true;
}

export async function updateMedia(
  id: string,
  fields: Partial<Pick<MediaRecord, 'caption_pt' | 'caption_en' | 'alt_pt' | 'alt_en' | 'taken_on' | 'sort_order' | 'published' | 'owner_id'>>
): Promise<MediaRecord | null> {
  const allowed = ['caption_pt', 'caption_en', 'alt_pt', 'alt_en', 'taken_on', 'sort_order', 'published', 'owner_id'] as const;
  const sets: string[] = [];
  const params: unknown[] = [];
  for (const k of allowed) {
    if (k in fields) { sets.push(`${k} = ?`); params.push(fields[k] ?? null); }
  }
  if (!sets.length) return getMedia(id);
  sets.push(`updated_at = datetime('now')`);
  params.push(id);
  await db().query(`UPDATE media SET ${sets.join(', ')} WHERE id = ?`, params);
  return getMedia(id);
}

/** Lê o objeto do bucket para a rota que serve a imagem. */
export async function readObject(key: string) {
  return bucket().get(key);
}
