import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, sendRateLimitResponse } from './_lib/rateLimit';

const PINATA_JWT = process.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = 'https://blush-puny-sawfish-198.mypinata.cloud/ipfs';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://check-fit-two.vercel.app';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin || '';
    const corsOrigin = origin === ALLOWED_ORIGIN || origin.includes('localhost') ? origin : ALLOWED_ORIGIN;
    res.setHeader('Access-Control-Allow-Origin', corsOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limit: 10 uploads per minute per IP
    if (!checkRateLimit(req, res, { limit: 10, windowSeconds: 60 })) {
        return sendRateLimitResponse(res);
    }

    if (!PINATA_JWT) {
        return res.status(500).json({ error: 'Upload service not configured' });
    }

    try {
        const { image, filename } = req.body;

        if (!image || typeof image !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid image data' });
        }

        // Validate base64 image
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Max 5MB
        if (buffer.length > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image too large (max 5MB)' });
        }

        const safeName = (filename || `fit-check-${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '_');

        const blob = new Blob([buffer], { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', blob, safeName);

        const metadata = JSON.stringify({
            name: safeName,
            keyvalues: {
                app: 'base-fit-check',
                timestamp: Date.now().toString(),
            },
        });
        formData.append('pinataMetadata', metadata);
        formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${PINATA_JWT}` },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinata upload failed:', errorText);
            return res.status(500).json({ error: 'Upload failed' });
        }

        const data = await response.json();
        const ipfsHash = data.IpfsHash;

        return res.status(200).json({
            success: true,
            ipfsHash,
            url: `${PINATA_GATEWAY}/${ipfsHash}`,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Upload failed' });
    }
}
