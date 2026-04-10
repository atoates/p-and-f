import "server-only";
import { NextRequest, NextResponse } from "next/server";

/**
 * Simple sliding-window in-memory rate limiter.
 *
 * Good enough for a single Railway instance behind one process. If we
 * ever scale to multiple instances we will need to swap this for
 * Upstash/Redis, because each process keeps its own counters.
 *
 * The bucket key is anything you want -- we default to the client IP so
 * that a single attacker burning through signups gets throttled, but
 * we can also key by email for login.
 */

type Bucket = {
  // Timestamps (ms) of hits inside the current window.
  hits: number[];
};

const buckets = new Map<string, Bucket>();

// Guard against unbounded memory growth if someone sprays us with
// unique keys. 10k distinct buckets is plenty for a hobby tier.
const MAX_BUCKETS = 10_000;

function getClientKey(request: NextRequest): string {
  // Railway / most PaaS hosts put the real client IP in x-forwarded-for.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // May be "client, proxy1, proxy2" -- take the first entry.
    return forwarded.split(",")[0]!.trim();
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  // Fallback: NextRequest does not expose a stable remote address in
  // all deployment targets, so we bucket everyone into one slot.
  return "unknown";
}

export type RateLimitOptions = {
  /** Maximum hits allowed in the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /**
   * Bucket key. Defaults to the client IP. Pass a custom key (e.g.
   * `ip:${email.toLowerCase()}`) to rate limit more specifically.
   */
  key?: string;
};

export type RateLimitResult = {
  allowed: boolean;
  /** Unix ms when the next hit would be allowed, if currently denied. */
  retryAfterMs: number;
  /** Hits remaining in the current window. */
  remaining: number;
};

/**
 * Record a hit and return whether it is allowed. Call this once per
 * incoming request you want to rate limit.
 */
export function rateLimit(
  request: NextRequest,
  namespace: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = `${namespace}:${options.key ?? getClientKey(request)}`;

  // Evict old buckets if we are full. Not a perfect LRU, but cheap.
  if (buckets.size > MAX_BUCKETS) {
    const cutoff = now - options.windowMs;
    for (const [k, b] of buckets) {
      if (b.hits.length === 0 || b.hits[b.hits.length - 1]! < cutoff) {
        buckets.delete(k);
      }
      if (buckets.size <= MAX_BUCKETS / 2) break;
    }
  }

  const bucket = buckets.get(key) ?? { hits: [] };
  const cutoff = now - options.windowMs;
  // Drop hits that have slid out of the window.
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= options.limit) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0]!;
    return {
      allowed: false,
      retryAfterMs: oldest + options.windowMs - now,
      remaining: 0,
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    retryAfterMs: 0,
    remaining: options.limit - bucket.hits.length,
  };
}

/**
 * Convenience helper that turns a denied result into the standard 429
 * response. Returns `null` if the request is allowed.
 */
export function rateLimitResponse(
  result: RateLimitResult
): NextResponse | null {
  if (result.allowed) return null;
  const retryAfterSeconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
  return NextResponse.json(
    {
      error: "Too many requests. Please slow down and try again later.",
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}

/**
 * Test-only helper. Clears all buckets so unit tests don't interact.
 */
export function __resetRateLimitForTests() {
  buckets.clear();
}
