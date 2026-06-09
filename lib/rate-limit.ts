/**
 * Lightweight in-memory rate limiter.
 * Works within a single Node.js process — adequate for small-scale deployments.
 * For multi-instance/edge deployments, replace with Upstash Redis or Vercel KV.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();

// Prune expired entries every 5 minutes to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, win] of store.entries()) {
    if (now > win.resetAt) store.delete(key);
  }
}, 5 * 60 * 1_000);

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param identifier  Unique key (e.g. user_id or IP)
 * @param maxRequests Max requests per window
 * @param windowMs    Window duration in milliseconds
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
