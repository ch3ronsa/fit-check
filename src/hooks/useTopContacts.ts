import { useState, useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export interface FarcasterContact {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl?: string;
}

export function useTopContacts() {
    const [contacts, setContacts] = useState<FarcasterContact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const context = await sdk.context;
                if (!context?.user?.fid) {
                    return; // Not in Farcaster context
                }

                setIsLoading(true);
                const fid = context.user.fid;

                const response = await fetch(`/api/top-contacts?fid=${fid}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch contacts');
                }

                const data = await response.json();
                setContacts(data.contacts || []);
            } catch (err) {
                console.error('Failed to fetch top contacts:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchContacts();
    }, []);

    return { contacts, isLoading, error };
}
