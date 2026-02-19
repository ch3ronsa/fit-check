import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, sendRateLimitResponse } from './_lib/rateLimit';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are a fun, hype fashion critic for a Web3 social app called "Base Fit Check Studio".
Users upload outfit photos to get rated.

Your job:
1. Analyze the outfit/photo for style, color coordination, creativity, confidence, and overall vibe.
2. Give a score from 60 to 100 (be generous but honest - most outfits should score 75-95).
3. Give a short, fun hype message (1 sentence, max 60 characters). Use Gen-Z/crypto culture slang.

Respond ONLY with valid JSON in this exact format:
{"score": 87, "message": "This fit hits different fr fr"}

Rules for scoring:
- 90-100: Exceptional, creative, standout outfit
- 80-89: Great style, well put together
- 70-79: Solid look, room for improvement
- 60-69: Basic but still decent

Rules for messages:
- Keep it fun and encouraging
- Use web3/crypto slang sometimes (WAGMI, based, bullish, etc.)
- Never be mean or negative
- Max 60 characters`;

interface AnalyzeRequest {
    image: string; // base64 encoded image
}

interface AnalyzeResponse {
    score: number;
    message: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limit: 5 requests per 60 seconds per IP
    if (!checkRateLimit(req, res, { limit: 5, windowSeconds: 60 })) {
        return sendRateLimitResponse(res);
    }

    if (!OPENAI_API_KEY) {
        // Fallback to random score if API key not configured
        return res.status(200).json(generateFallbackScore());
    }

    try {
        const { image } = req.body as AnalyzeRequest;

        if (!image) {
            return res.status(400).json({ error: 'Missing image data' });
        }

        // Ensure the image has the data URL prefix
        const imageData = image.startsWith('data:')
            ? image
            : `data:image/jpeg;base64,${image}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Rate this outfit photo. Respond with JSON only.',
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageData,
                                    detail: 'low', // Use low detail to save tokens
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 100,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', errorText);
            return res.status(200).json(generateFallbackScore());
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
            return res.status(200).json(generateFallbackScore());
        }

        // Parse the JSON response
        const parsed = JSON.parse(content) as AnalyzeResponse;

        // Validate and clamp score
        const score = Math.min(100, Math.max(60, Math.round(parsed.score || 85)));
        const message = (parsed.message || '').slice(0, 60) || getFallbackMessage();

        return res.status(200).json({ score, message });
    } catch (error) {
        console.error('Style analysis error:', error);
        return res.status(200).json(generateFallbackScore());
    }
}

// Fallback when AI is unavailable
function generateFallbackScore(): AnalyzeResponse {
    const score = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
    return { score, message: getFallbackMessage() };
}

const FALLBACK_MESSAGES = [
    "This fit locks the blockchain!",
    "CEO vibes only. Respect!",
    "Mirror cracked, too much charisma!",
    "You are the new King/Queen of Base.",
    "Satoshi would give his wallet for this.",
    "WAGMI energy detected!",
    "Straight to the moon!",
    "This fit is based fr fr",
    "Drip level: immeasurable",
];

function getFallbackMessage(): string {
    return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
}
