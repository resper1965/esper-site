/**
 * In-memory sliding-window rate limiter.
 *
 * Suitable for single-instance Node.js (Next.js dev / single CF worker).
 * For multi-instance deployments, replace with Cloudflare Rate Limiting
 * or a KV/D1-backed implementation.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Auto-prune stale entries every 5 minutes to avoid memory leaks
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;
let lastPrune = Date.now();

function pruneStore(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;

  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > now - windowMs);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

interface RateLimitConfig {
  /** Time window in milliseconds (default: 15 min) */
  windowMs?: number;
  /** Max requests per window (default: 5) */
  maxAttempts?: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Remaining attempts in the current window */
  remaining: number;
  /** Seconds until the window resets for the oldest attempt */
  retryAfterSeconds: number;
}

/**
 * Check rate limit for a given key (typically client IP).
 *
 * Returns `{ allowed, remaining, retryAfterSeconds }`.
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const windowMs = config.windowMs ?? 15 * 60 * 1000; // 15 minutes
  const maxAttempts = config.maxAttempts ?? 5;
  const now = Date.now();

  pruneStore(windowMs);

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Drop timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > now - windowMs);

  if (entry.timestamps.length >= maxAttempts) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
    };
  }

  // Record this attempt
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: maxAttempts - entry.timestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Extract client IP from a Request (works with Next.js and Cloudflare).
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown';
}

// ── Preset configs ────────────────────────────────────────

/** Chat endpoint: 10 requests per minute */
export const CHAT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxAttempts: 10,
};

/** Login endpoint: 5 requests per minute */
export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxAttempts: 5,
};

/**
 * Reset all rate limit state. For testing only.
 */
export function _resetStore(): void {
  store.clear();
}
