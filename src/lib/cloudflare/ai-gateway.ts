/**
 * Cloudflare AI Gateway Client
 *
 * Centralizes Cloudflare AI access for:
 * - AI Gateway analytics/caching
 * - Workers AI text generation (Llama)
 * - Embeddings for Vectorize
 */

const DEFAULT_GATEWAY_ID = 'esper-ai-gateway';

export type WorkersAITextModel =
  | '@cf/meta/llama-3.1-8b-instruct-fast'
  | '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CloudflareAIConfig {
  accountId: string;
  apiToken: string;
  gatewayId: string;
}

interface WorkersAITextResponse {
  response?: string;
  result?: {
    response?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

async function getSettingValue(key: string): Promise<string | null> {
  try {
    const { getSetting } = await import('../settings');
    return await getSetting(key);
  } catch {
    return null;
  }
}

async function getCloudflareAIConfig(): Promise<CloudflareAIConfig> {
  const accountId =
    (await getSettingValue('CLOUDFLARE_ACCOUNT_ID')) ||
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    '';
  const apiToken =
    (await getSettingValue('CLOUDFLARE_API_TOKEN')) ||
    process.env.CLOUDFLARE_API_TOKEN ||
    '';
  const gatewayId =
    (await getSettingValue('CLOUDFLARE_AI_GATEWAY_ID')) ||
    process.env.CLOUDFLARE_AI_GATEWAY_ID ||
    DEFAULT_GATEWAY_ID;

  return { accountId, apiToken, gatewayId };
}

export async function getAIGatewayBase(): Promise<string> {
  const { accountId, gatewayId } = await getCloudflareAIConfig();
  return `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}`;
}

/**
 * Build gateway URL for a specific AI provider
 */
export function getGatewayUrl(provider: 'anthropic' | 'google-ai-studio' | 'openai'): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
  const gatewayId = process.env.CLOUDFLARE_AI_GATEWAY_ID || DEFAULT_GATEWAY_ID;

  if (!accountId) {
    return provider;
  }

  return `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/${provider}`;
}

/**
 * Anthropic via Cloudflare AI Gateway
 * Replace direct Anthropic API calls with gateway URL
 */
export function getAnthropicGatewayConfig() {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    // Fallback to direct Anthropic API if gateway not configured
    return {
      baseURL: 'https://api.anthropic.com',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    };
  }
  return {
    baseURL: `https://gateway.ai.cloudflare.com/v1/${process.env.CLOUDFLARE_ACCOUNT_ID}/${process.env.CLOUDFLARE_AI_GATEWAY_ID || DEFAULT_GATEWAY_ID}/anthropic`,
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
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
    return {
      baseURL: 'https://generativelanguage.googleapis.com',
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    };
  }
  return {
    baseURL: `https://gateway.ai.cloudflare.com/v1/${process.env.CLOUDFLARE_ACCOUNT_ID}/${process.env.CLOUDFLARE_AI_GATEWAY_ID || DEFAULT_GATEWAY_ID}/google-ai-studio`,
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
  const { accountId, apiToken, gatewayId } = await getCloudflareAIConfig();
  if (!accountId || !apiToken) return null;

  const endpoint = gatewayId
    ? `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/workers-ai/${model}`
    : `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    });

    if (!response.ok) {
      console.error('Workers AI error:', response.statusText);
      return null;
    }

    const data = await response.json() as { result?: T } | T;
    if (typeof data === 'object' && data !== null && 'result' in data) {
      return data.result ?? null;
    }
    return data as T;
  } catch (error) {
    console.error('Workers AI fetch error:', error);
    return null;
  }
}

export async function generateChatCompletion(options: {
  messages: ChatMessage[];
  model?: WorkersAITextModel;
  temperature?: number;
  maxTokens?: number;
  env?: { AI?: { run: (model: string, input: unknown) => Promise<WorkersAITextResponse> } };
}): Promise<{
  text: string;
  model: WorkersAITextModel;
  usage?: {
    input: number;
    output: number;
    total: number;
  };
}> {
  const model = options.model || '@cf/meta/llama-3.1-8b-instruct-fast';
  const result = await runWorkersAI<WorkersAITextResponse>(
    model,
    {
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    },
    options.env
  );

  const responseText =
    result?.response ||
    result?.result?.response ||
    '';

  if (!responseText) {
    throw new Error('Workers AI returned an empty response');
  }

  const usage = result?.usage || result?.result?.usage;

  return {
    text: responseText,
    model,
    usage: usage
      ? {
          input: usage.prompt_tokens ?? 0,
          output: usage.completion_tokens ?? 0,
          total: usage.total_tokens ?? 0,
        }
      : undefined,
  };
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
