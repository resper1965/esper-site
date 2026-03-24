/**
 * Storage module — R2 replacement for supabase/storage.ts
 *
 * Identical exports: uploadPostImage, deletePostImage, listPostImages,
 * getPostImageUrl.
 *
 * R2 runs at the edge (Workers). For local dev we use the REST API.
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET || 'esper-images';
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

// ── Public API ────────────────────────────────────────────

/**
 * Upload an image to R2
 */
export async function uploadPostImage(
  file: Buffer | ArrayBuffer | Uint8Array,
  filename: string,
  contentType: string = 'image/png'
): Promise<string | null> {
  try {
    // Use S3-compatible API via REST
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${encodeURIComponent(filename)}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': contentType,
      },
      body: file as unknown as BodyInit,
    });

    if (!response.ok) {
      console.error('❌ R2 upload error:', await response.text());
      return null;
    }

    const publicUrl = getPostImageUrl(filename);
    console.log('✅ Image uploaded:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Upload exception:', error);
    return null;
  }
}

/**
 * Delete an image from R2
 */
export async function deletePostImage(filename: string): Promise<boolean> {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${encodeURIComponent(filename)}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('❌ R2 delete error:', await response.text());
      return false;
    }

    console.log('✅ Image deleted:', filename);
    return true;
  } catch (error) {
    console.error('❌ Delete exception:', error);
    return false;
  }
}

/**
 * List all images in the bucket
 */
export async function listPostImages(): Promise<{ name: string; size?: number; uploaded?: string }[]> {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error('❌ R2 list error:', await response.text());
      return [];
    }

    const data = await response.json() as {
      result: { objects?: { key: string; size: number; uploaded: string }[] };
    };

    return (data.result?.objects || []).map((obj) => ({
      name: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
    }));
  } catch (error) {
    console.error('❌ List exception:', error);
    return [];
  }
}

/**
 * Get public URL for an image in R2
 */
export function getPostImageUrl(filename: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${filename}`;
  }
  // Fallback: custom domain or R2 public endpoint
  return `https://${R2_BUCKET_NAME}.${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${filename}`;
}
