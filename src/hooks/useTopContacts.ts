import { useQuery } from '@tanstack/react-query';
import sdk from '@farcaster/frame-sdk';

export interface FarcasterContact {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl?: string;
}

async function getFarcasterFid(): Promise<number | null> {
    try {
        const context = await sdk.context;
        return context?.user?.fid ?? null;
    } catch {
        return null;
    }
}

async function fetchTopContacts(): Promise<FarcasterContact[]> {
    const fid = await getFarcasterFid();
    if (!fid) return [];

    const response = await fetch(`/api/top-contacts?fid=${fid}`);
    if (!response.ok) throw new Error('Failed to fetch contacts');

    const data = await response.json();
    return data.contacts || [];
}

export function useTopContacts() {
    const { data: contacts = [], isLoading, error } = useQuery({
        queryKey: ['top-contacts'],
        queryFn: fetchTopContacts,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    });

    return { contacts, isLoading, error: error?.message || null };
}
