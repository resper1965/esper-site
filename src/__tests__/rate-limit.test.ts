import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, _resetStore, CHAT_RATE_LIMIT, LOGIN_RATE_LIMIT } from '@/lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    _resetStore();
  });

  it('allows requests under the limit', () => {
    const result = checkRateLimit('192.168.1.1', CHAT_RATE_LIMIT);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });

  it('blocks after max CHAT requests', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('test-ip', CHAT_RATE_LIMIT);
    }
    const result = checkRateLimit('test-ip', CHAT_RATE_LIMIT);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('blocks after max LOGIN requests', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit('login-ip', LOGIN_RATE_LIMIT);
    }
    const result = checkRateLimit('login-ip', LOGIN_RATE_LIMIT);
    expect(result.allowed).toBe(false);
  });

  it('isolates keys from each other', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('ip-a', CHAT_RATE_LIMIT);
    }
    const result = checkRateLimit('ip-b', CHAT_RATE_LIMIT);
    expect(result.allowed).toBe(true);
  });
});
