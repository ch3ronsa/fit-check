import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit, sendRateLimitResponse } from './_lib/rateLimit';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are a style advisor AI for "Base Fit Check Studio", a Web3 fashion social app on Base blockchain.

Given an outfit photo, analyze the style and provide:
1. A "Style Profile" with a fun archetype name (e.g. "Cyberpunk Minimalist", "Streetwear Royalty", "Dark Academia Vibes")
2. The dominant color palette (3 hex colors from the outfit)
3. A style category (one of: streetwear, casual, formal, sporty, avant-garde, minimalist, bohemian, techwear)
4. 3 outfit/accessory suggestions that would complement this look
5. A fun "style twin" - a fictional or pop culture character who matches this vibe

Respond ONLY with valid JSON in this exact format:
{
  "archetype": "Streetwear Royalty",
  "colors": ["#1a1a1a", "#0052FF", "#ffffff"],
  "category": "streetwear",
  "suggestions": [
    "Add chunky silver chains for extra drip",
    "Try oversized sunglasses to complete the look",
    "A bucket hat would elevate this fit to legendary"
  ],
  "styleTwin": {
    "name": "A$AP Rocky",
    "reason": "Bold color blocking with effortless confidence"
  },
  "vibe": "Main character energy with a based twist"
}

Rules:
- Keep suggestions fun, specific, and actionable
- Use Gen-Z/Web3 culture language
- Be encouraging and hype, never negative
- Colors should be actual hex codes from the visible outfit
- Style twin can be any well-known figure, fictional character, or anime character
- Vibe should be a short catchy phrase (max 50 chars)`;

interface FrensRequest {
    image: string;
}

interface StyleSuggestion {
    archetype: string;
    colors: string[];
    category: string;
    suggestions: string[];
    styleTwin: {
        name: string;
        reason: string;
    };
    vibe: string;
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
        return res.status(200).json(generateFallback());
    }

    try {
        const { image } = req.body as FrensRequest;

        if (!image) {
            return res.status(400).json({ error: 'Missing image data' });
        }

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
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Analyze this outfit and create a style profile. Respond with JSON only.' },
                            { type: 'image_url', image_url: { url: imageData, detail: 'low' } },
                        ],
                    },
                ],
                max_tokens: 300,
                temperature: 0.9,
            }),
        });

        if (!response.ok) {
            console.error('OpenAI API error:', await response.text());
            return res.status(200).json(generateFallback());
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
            return res.status(200).json(generateFallback());
        }

        const parsed = JSON.parse(content) as StyleSuggestion;

        // Validate and sanitize
        const result: StyleSuggestion = {
            archetype: (parsed.archetype || 'Style Explorer').slice(0, 40),
            colors: Array.isArray(parsed.colors) ? parsed.colors.slice(0, 3) : ['#0052FF', '#8B5CF6', '#F59E0B'],
            category: parsed.category || 'casual',
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3).map(s => s.slice(0, 100)) : FALLBACK_SUGGESTIONS,
            styleTwin: {
                name: (parsed.styleTwin?.name || 'Neo from The Matrix').slice(0, 30),
                reason: (parsed.styleTwin?.reason || 'Iconic and unforgettable').slice(0, 60),
            },
            vibe: (parsed.vibe || 'Main character energy').slice(0, 50),
        };

        return res.status(200).json(result);
    } catch (error) {
        console.error('Frens generator error:', error);
        return res.status(200).json(generateFallback());
    }
}

const FALLBACK_SUGGESTIONS = [
    'Add statement accessories for extra personality',
    'Try layering to add depth to this look',
    'A bold watch or bracelet would complete this fit',
];

const FALLBACK_ARCHETYPES = [
    { archetype: 'Based Trendsetter', vibe: 'Main character energy fr fr' },
    { archetype: 'Crypto Couture King', vibe: 'Drip so hard the chain validates itself' },
    { archetype: 'Streetwear Sage', vibe: 'Effortlessly cool, permanently based' },
    { archetype: 'Digital Fashion Icon', vibe: 'Built different, dressed different' },
    { archetype: 'Neon Minimalist', vibe: 'Less is more, but make it glow' },
];

const FALLBACK_TWINS = [
    { name: 'Neo from The Matrix', reason: 'Iconic style with a digital edge' },
    { name: 'Spike Spiegel', reason: 'Effortless cool with endless swagger' },
    { name: 'Rihanna', reason: 'Bold, fearless, and always ahead of the curve' },
    { name: 'Tyler the Creator', reason: 'Color-blocking genius with no limits' },
    { name: 'Levi Ackerman', reason: 'Clean lines, sharp fit, zero wasted moves' },
];

function generateFallback(): StyleSuggestion {
    const pick = FALLBACK_ARCHETYPES[Math.floor(Math.random() * FALLBACK_ARCHETYPES.length)];
    const twin = FALLBACK_TWINS[Math.floor(Math.random() * FALLBACK_TWINS.length)];

    return {
        archetype: pick.archetype,
        colors: ['#0052FF', '#8B5CF6', '#F59E0B'],
        category: 'streetwear',
        suggestions: FALLBACK_SUGGESTIONS,
        styleTwin: twin,
        vibe: pick.vibe,
    };
}
