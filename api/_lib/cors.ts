import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://check-fit-two.vercel.app';

/**
 * Set CORS headers on the response.
 * Allows the configured origin and localhost for development.
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
    const origin = req.headers.origin || '';
    const isAllowed =
        origin === ALLOWED_ORIGIN ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:');

    res.setHeader('Access-Control-Allow-Origin', isAllowed ? origin : ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
