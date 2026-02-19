import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, sendRateLimitResponse } from './_lib/rateLimit';
import { setCorsHeaders } from './_lib/cors';

const PINATA_JWT = process.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = 'https://blush-puny-sawfish-198.mypinata.cloud/ipfs';

interface PinataPin {
    ipfs_pin_hash: string;
    date_pinned: string;
    metadata?: {
        name?: string;
        keyvalues?: {
            creatorAddress?: string;
            creatorName?: string;
            creatorFid?: string;
            uses?: string;
        };
    };
}

export interface CommunityFrame {
    id: string;
    name: string;
    ipfsHash: string;
    url: string;
    creator: {
        address?: string;
        name: string;
        fid?: number;
    };
    category: 'community' | 'trending';
    uses: number;
    createdAt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Rate limit: GET 30/min, POST 3/min per IP
    const limit = req.method === 'POST' ? 3 : 30;
    if (!checkRateLimit(req, res, { limit, windowSeconds: 60 })) {
        return sendRateLimitResponse(res);
    }

    if (req.method === 'GET') {
        return handleList(req, res);
    }

    if (req.method === 'POST') {
        return handleUpload(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}

// List community frames from Pinata
async function handleList(_req: VercelRequest, res: VercelResponse) {
    if (!PINATA_JWT) {
        return res.status(200).json({ frames: [] });
    }

    try {
        // Query Pinata for files with community-frame metadata
        const response = await fetch(
            'https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues][app]={"value":"base-fit-check-frame","op":"eq"}&pageLimit=50',
            {
                headers: { 'Authorization': `Bearer ${PINATA_JWT}` },
            }
        );

        if (!response.ok) {
            console.error('Pinata list error:', await response.text());
            return res.status(200).json({ frames: [] });
        }

        const data = await response.json();

        const frames: CommunityFrame[] = (data.rows || []).map((pin: PinataPin) => ({
            id: pin.ipfs_pin_hash,
            name: pin.metadata?.name || 'Community Frame',
            ipfsHash: pin.ipfs_pin_hash,
            url: `${PINATA_GATEWAY}/${pin.ipfs_pin_hash}`,
            creator: {
                address: pin.metadata?.keyvalues?.creatorAddress || undefined,
                name: pin.metadata?.keyvalues?.creatorName || 'Anonymous',
                fid: pin.metadata?.keyvalues?.creatorFid ? Number(pin.metadata.keyvalues.creatorFid) : undefined,
            },
            category: (pin.metadata?.keyvalues?.uses || 0) >= 10 ? 'trending' : 'community',
            uses: Number(pin.metadata?.keyvalues?.uses || 0),
            createdAt: pin.date_pinned || new Date().toISOString(),
        }));

        // Sort by uses (trending first), then by date
        frames.sort((a, b) => b.uses - a.uses || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return res.status(200).json({ frames });
    } catch (error) {
        console.error('Frame list error:', error);
        return res.status(200).json({ frames: [] });
    }
}

// Upload a new community frame to Pinata
async function handleUpload(req: VercelRequest, res: VercelResponse) {
    if (!PINATA_JWT) {
        return res.status(500).json({ error: 'Upload service not configured' });
    }

    try {
        const { image, name, creatorAddress, creatorName, creatorFid } = req.body;

        if (!image || typeof image !== 'string' || !name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Missing image or name' });
        }

        // Validate name length and sanitize
        const sanitizedName = name.trim().slice(0, 30);
        if (sanitizedName.length === 0) {
            return res.status(400).json({ error: 'Name cannot be empty' });
        }

        // Validate creator address if provided (Ethereum address format)
        if (creatorAddress && !/^0x[a-fA-F0-9]{40}$/.test(creatorAddress)) {
            return res.status(400).json({ error: 'Invalid creator address' });
        }

        // Convert base64 to buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Validate file size (max 2MB)
        if (buffer.length > 2 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image too large (max 2MB)' });
        }

        // Create form data for Pinata
        const blob = new Blob([buffer], { type: 'image/png' });
        const formData = new FormData();
        formData.append('file', blob, `frame-${Date.now()}.png`);

        const metadata = JSON.stringify({
            name: sanitizedName,
            keyvalues: {
                app: 'base-fit-check-frame',
                creatorAddress: creatorAddress || '',
                creatorName: creatorName || 'Anonymous',
                creatorFid: creatorFid?.toString() || '',
                uses: '0',
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
            console.error('Pinata upload error:', await response.text());
            return res.status(500).json({ error: 'Upload failed' });
        }

        const data = await response.json();
        const ipfsHash = data.IpfsHash;

        const frame: CommunityFrame = {
            id: ipfsHash,
            name: sanitizedName,
            ipfsHash,
            url: `${PINATA_GATEWAY}/${ipfsHash}`,
            creator: {
                address: creatorAddress,
                name: creatorName || 'Anonymous',
                fid: creatorFid,
            },
            category: 'community',
            uses: 0,
            createdAt: new Date().toISOString(),
        };

        return res.status(200).json({ frame });
    } catch (error) {
        console.error('Frame upload error:', error);
        return res.status(500).json({ error: 'Upload failed' });
    }
}
