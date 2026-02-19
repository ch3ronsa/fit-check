import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, sendRateLimitResponse } from './_lib/rateLimit';
import { setCorsHeaders } from './_lib/cors';

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

interface NeynarUser {
    fid: number;
    username: string;
    display_name: string;
    pfp_url?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limit: 15 requests per 60 seconds per IP
    if (!checkRateLimit(req, res, { limit: 15, windowSeconds: 60 })) {
        return sendRateLimitResponse(res);
    }

    const { fid } = req.query;

    if (!fid || typeof fid !== 'string') {
        return res.status(400).json({ error: 'Missing fid parameter' });
    }

    if (!NEYNAR_API_KEY) {
        return res.status(500).json({ error: 'Neynar API key not configured' });
    }

    try {
        const interactionMap = new Map<number, number>();

        // Fetch user's likes to find who they interact with most
        const likesRes = await fetch(
            `https://api.neynar.com/v2/farcaster/reactions/user?fid=${fid}&type=like&limit=100`,
            { headers: { 'api_key': NEYNAR_API_KEY } }
        );

        if (!likesRes.ok) {
            throw new Error(`Neynar API error: ${likesRes.status}`);
        }

        const likesData = await likesRes.json();

        // Count interactions with each author
        if (likesData.reactions) {
            likesData.reactions.forEach((reaction: any) => {
                if (reaction.cast?.author?.fid) {
                    const authorFid = reaction.cast.author.fid;
                    // Don't count self
                    if (authorFid !== parseInt(fid)) {
                        interactionMap.set(authorFid, (interactionMap.get(authorFid) || 0) + 1);
                    }
                }
            });
        }

        // Sort by interaction count and get top 5
        const topFids = Array.from(interactionMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([fid]) => fid);

        if (topFids.length === 0) {
            return res.status(200).json({ contacts: [] });
        }

        // Fetch user details for top contacts
        const usersRes = await fetch(
            `https://api.neynar.com/v2/farcaster/user/bulk?fids=${topFids.join(',')}`,
            { headers: { 'api_key': NEYNAR_API_KEY } }
        );

        if (!usersRes.ok) {
            throw new Error(`Neynar user fetch error: ${usersRes.status}`);
        }

        const usersData = await usersRes.json();

        const contacts = usersData.users?.map((user: NeynarUser) => ({
            fid: user.fid,
            username: user.username,
            displayName: user.display_name,
            pfpUrl: user.pfp_url,
        })) || [];

        return res.status(200).json({ contacts });
    } catch (error) {
        console.error('Top contacts error:', error);
        return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
}
