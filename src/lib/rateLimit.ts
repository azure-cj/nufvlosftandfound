/**
 * In-memory sliding-window rate limiter.
 *
 * NOTE: This works correctly for single-instance deployments (e.g. a single Node.js process,
 * one Vercel Fluid compute instance). If you run multiple concurrent instances or serverless
 * replicas, upgrade to a shared store (e.g. Upstash Redis via @upstash/ratelimit) so limits
 * are enforced globally across all instances.
 */

type Window = { timestamps: number[] };

const store = new Map<string, Window>();

// Prune stale entries periodically to avoid unbounded memory growth
setInterval(
  () => {
    const now = Date.now();
    for (const [key, win] of store.entries()) {
      if (win.timestamps.length === 0 || now - win.timestamps[win.timestamps.length - 1]! > 60_000) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

/**
 * Check and record a rate-limit hit for the given key.
 *
 * @param key      Unique identifier for the rate-limit bucket (e.g. "login:<ip>")
 * @param limit    Maximum number of allowed requests in the window
 * @param windowMs Window duration in milliseconds
 * @returns { allowed: boolean; remaining: number; resetMs: number }
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  const win = store.get(key) ?? { timestamps: [] };
  // Evict timestamps outside the current window
  win.timestamps = win.timestamps.filter((t) => t > cutoff);

  if (win.timestamps.length >= limit) {
    const oldestInWindow = win.timestamps[0]!;
    const resetMs = oldestInWindow + windowMs - now;
    store.set(key, win);
    return { allowed: false, remaining: 0, resetMs };
  }

  win.timestamps.push(now);
  store.set(key, win);

  return { allowed: true, remaining: limit - win.timestamps.length, resetMs: 0 };
}

/**
 * Extract the best available client IP from a request.
 * Falls back to 'unknown' when behind a non-standard proxy.
 */
export function getClientIp(request: Request): string {
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip',
    'true-client-ip',
  ] as const;

  for (const header of headers) {
    const value = (request.headers as Headers).get(header);
    if (value) {
      return value.split(',')[0]!.trim();
    }
  }

  return 'unknown';
}
