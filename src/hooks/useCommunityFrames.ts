import { useState, useEffect, useCallback } from 'react';

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

const CACHE_KEY = 'fitcheck_community_frames';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheData {
    frames: CommunityFrame[];
    timestamp: number;
}

export function useCommunityFrames() {
    const [frames, setFrames] = useState<CommunityFrame[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFrames = useCallback(async (skipCache = false) => {
        // Check cache first
        if (!skipCache) {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const data: CacheData = JSON.parse(cached);
                    if (Date.now() - data.timestamp < CACHE_TTL) {
                        setFrames(data.frames);
                        return;
                    }
                }
            } catch {
                // Invalid cache, ignore
            }
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/frames');
            if (!response.ok) throw new Error('Failed to fetch frames');

            const data = await response.json();
            const fetched = data.frames || [];
            setFrames(fetched);

            // Cache the result
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                frames: fetched,
                timestamp: Date.now(),
            }));
        } catch (err) {
            console.error('Failed to fetch community frames:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFrames();
    }, [fetchFrames]);

    const uploadFrame = async (image: string, name: string, creator: { address?: string; name: string; fid?: number }) => {
        const response = await fetch('/api/frames', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image,
                name,
                creatorAddress: creator.address,
                creatorName: creator.name,
                creatorFid: creator.fid,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();

        // Refresh the list
        await fetchFrames(true);

        return data.frame as CommunityFrame;
    };

    return { frames, isLoading, error, uploadFrame, refresh: () => fetchFrames(true) };
}
