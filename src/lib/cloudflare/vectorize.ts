/**
 * Cloudflare Vectorize Client
 * Semantic search for blog posts using vector embeddings
 *
 * Flow:
 * 1. When a post is published → generate embedding → upsert to Vectorize index
 * 2. When user searches → generate query embedding → query Vectorize → return semantic matches
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const VECTORIZE_INDEX = process.env.CLOUDFLARE_VECTORIZE_INDEX || 'esper-posts';

const VECTORIZE_API = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/vectorize/v2/indexes/${VECTORIZE_INDEX}`;

interface VectorMetadata {
  slug: string;
  title: string;
  description: string;
  category: string;
  language: string;
  publishedAt: string;
}

interface VectorRecord {
  id: string;
  values: number[];
  metadata: VectorMetadata;
  namespace?: string;
}

interface VectorizeMatch {
  id: string;
  score: number;
  metadata?: VectorMetadata;
}

/**
 * Upsert post embeddings into Vectorize
 * Call this when a post is created or updated
 */
export async function upsertPostVector(
  slug: string,
  embedding: number[],
  metadata: VectorMetadata
): Promise<boolean> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.warn('Vectorize: Missing Cloudflare credentials');
    return false;
  }

  const vector: VectorRecord = {
    id: slug,
    values: embedding,
    metadata,
    namespace: metadata.language, // Separate PT-BR and EN vectors
  };

  try {
    const response = await fetch(`${VECTORIZE_API}/upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/x-ndjson',
      },
      body: JSON.stringify(vector),
    });

    if (!response.ok) {
      console.error('Vectorize upsert error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Vectorize upsert failed:', error);
    return false;
  }
}

/**
 * Query Vectorize for semantically similar posts
 */
export async function semanticSearch(
  queryEmbedding: number[],
  options?: {
    topK?: number;
    language?: string;
    minScore?: number;
  }
): Promise<VectorizeMatch[]> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    return [];
  }

  const body = {
    vector: queryEmbedding,
    topK: options?.topK || 5,
    returnMetadata: 'all',
    ...(options?.language && { namespace: options.language }),
  };

  try {
    const response = await fetch(`${VECTORIZE_API}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Vectorize query error:', await response.text());
      return [];
    }

    const data = await response.json() as { result: { matches: VectorizeMatch[] } };
    const matches = data.result?.matches || [];

    // Filter by minimum score if provided
    if (options?.minScore) {
      return matches.filter((m) => m.score >= (options.minScore ?? 0));
    }

    return matches;
  } catch (error) {
    console.error('Vectorize query failed:', error);
    return [];
  }
}

/**
 * Delete a post vector (when post is unpublished or deleted)
 */
export async function deletePostVector(slug: string): Promise<boolean> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) return false;

  try {
    const response = await fetch(`${VECTORIZE_API}/delete-by-ids`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: [slug] }),
    });

    return response.ok;
  } catch (error) {
    console.error('Vectorize delete failed:', error);
    return false;
  }
}

/**
 * Get related posts using semantic similarity
 */
export async function getRelatedPosts(
  currentSlug: string,
  queryEmbedding: number[],
  language: string,
  limit = 3
): Promise<VectorizeMatch[]> {
  const matches = await semanticSearch(queryEmbedding, {
    topK: limit + 1, // +1 to exclude current post
    language,
    minScore: 0.7, // Minimum 70% similarity
  });

  // Exclude current post from results
  return matches.filter((m) => m.id !== currentSlug).slice(0, limit);
}
