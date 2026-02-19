import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
    const checks: Record<string, 'ok' | 'missing'> = {
        openai: process.env.OPENAI_API_KEY ? 'ok' : 'missing',
        neynar: process.env.NEYNAR_API_KEY ? 'ok' : 'missing',
        pinata: process.env.VITE_PINATA_JWT ? 'ok' : 'missing',
    };

    const allOk = Object.values(checks).every(v => v === 'ok');

    res.status(allOk ? 200 : 503).json({
        status: allOk ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        services: checks,
    });
}
