import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Simple in-memory rate limiter for Vercel Serverless Functions.
 * Uses a global Map with TTL cleanup.
 * Note: Each serverless instance has its own memory, so this is
 * per-instance rate limiting (still effective for burst protection).
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60 seconds
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetAt) {
            rateLimitStore.delete(key);
        }
    }
}, 60_000);

interface RateLimitConfig {
    /** Max requests per window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
    limit: 10,
    windowSeconds: 60,
};

/**
 * Get client identifier from request.
 * Uses x-forwarded-for (Vercel sets this), falls back to x-real-ip.
 */
function getClientId(req: VercelRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded?.split(',')[0]?.trim();
    return ip || req.headers['x-real-ip'] as string || 'unknown';
}

/**
 * Check rate limit for a request.
 * Returns true if request is allowed, false if rate limited.
 * Sets appropriate headers on the response.
 */
export function checkRateLimit(
    req: VercelRequest,
    res: VercelResponse,
    config: RateLimitConfig = DEFAULT_CONFIG,
): boolean {
    const clientId = getClientId(req);
    const key = `${req.url}:${clientId}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        entry = {
            count: 0,
            resetAt: now + config.windowSeconds * 1000,
        };
        rateLimitStore.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, config.limit - entry.count);
    res.setHeader('X-RateLimit-Limit', config.limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());

    if (entry.count > config.limit) {
        return false;
    }

    return true;
}

/**
 * Send a 429 Too Many Requests response.
 */
export function sendRateLimitResponse(res: VercelResponse): void {
    res.status(429).json({
        error: 'Too many requests. Please try again later.',
    });
}
