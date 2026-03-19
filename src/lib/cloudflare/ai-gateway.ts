/**
 * Cloudflare AI Gateway Client
 * Routes all AI API calls through Cloudflare's AI Gateway for:
 * - Caching responses (cost reduction)
 * - Rate limiting
 * - Analytics & observability
 * - Fallback between providers
 *
 * Gateway URL format:
 * https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/{provider}/{endpoint}
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_AI_GATEWAY_ID = process.env.CLOUDFLARE_AI_GATEWAY_ID || 'esper-ai-gateway';

export const AI_GATEWAY_BASE = `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_AI_GATEWAY_ID}`;

/**
 * Build gateway URL for a specific AI provider
 */
export function getGatewayUrl(provider: 'anthropic' | 'google-ai-studio' | 'openai'): string {
  return `${AI_GATEWAY_BASE}/${provider}`;
}

/**
 * Anthropic via Cloudflare AI Gateway
 * Replace direct Anthropic API calls with gateway URL
 */
export function getAnthropicGatewayConfig() {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    // Fallback to direct Anthropic API if gateway not configured
    return {
      baseURL: 'https://api.anthropic.com',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    };
  }
  return {
    baseURL: `${AI_GATEWAY_BASE}/anthropic`,
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    defaultHeaders: {
      'cf-aig-cache-ttl': '3600', // Cache for 1 hour
      'cf-aig-skip-cache': 'false',
      'anthropic-version': '2023-06-01',
    },
  };
}

/**
 * Google Gemini via Cloudflare AI Gateway
 */
export function getGeminiGatewayConfig() {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    return {
      baseURL: 'https://generativelanguage.googleapis.com',
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    };
  }
  return {
    baseURL: `${AI_GATEWAY_BASE}/google-ai-studio`,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    defaultHeaders: {
      'cf-aig-cache-ttl': '1800',
    },
  };
}

/**
 * Workers AI - run models directly on Cloudflare edge
 * Used for embeddings (vectorization) and lightweight inference
 */
export async function runWorkersAI<T = unknown>(
  model: string,
  inputs: Record<string, unknown>,
  env?: { AI?: { run: (model: string, input: unknown) => Promise<T> } }
): Promise<T | null> {
  // If running on Cloudflare Workers, use the bound AI instance
  if (env?.AI) {
    return env.AI.run(model, inputs) as Promise<T>;
  }

  // Fallback: Call via REST API
  if (!CLOUDFLARE_ACCOUNT_ID) return null;

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!apiToken) return null;

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${model}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      }
    );

    if (!response.ok) {
      console.error('Workers AI error:', response.statusText);
      return null;
    }

    const data = await response.json() as { result: T };
    return data.result;
  } catch (error) {
    console.error('Workers AI fetch error:', error);
    return null;
  }
}

/**
 * Generate text embeddings for vectorization
 * Uses Cloudflare Workers AI @cf/baai/bge-base-en-v1.5
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const result = await runWorkersAI<{ data: number[][] }>(
    '@cf/baai/bge-base-en-v1.5',
    { text: [text] }
  );
  return result?.data?.[0] ?? null;
}

/**
 * Cloudflare AI Gateway analytics event
 * Log custom metadata to AI Gateway for observability
 */
export function buildGatewayHeaders(options?: {
  cacheKey?: string;
  cacheTtl?: number;
  skipCache?: boolean;
  metadata?: Record<string, string>;
}): HeadersInit {
  const headers: Record<string, string> = {};

  if (options?.cacheKey) {
    headers['cf-aig-cache-key'] = options.cacheKey;
  }
  if (options?.cacheTtl !== undefined) {
    headers['cf-aig-cache-ttl'] = String(options.cacheTtl);
  }
  if (options?.skipCache) {
    headers['cf-aig-skip-cache'] = 'true';
  }
  if (options?.metadata) {
    headers['cf-aig-metadata'] = JSON.stringify(options.metadata);
  }

  return headers;
}
