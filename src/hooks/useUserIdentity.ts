import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { base } from 'wagmi/chains';
import { useMemo, useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export const useUserIdentity = () => {
    const { address, isConnected } = useAccount();
    const [farcasterUser, setFarcasterUser] = useState<{ username?: string; pfpUrl?: string; fid?: number } | null>(null);

    // Fetch Farcaster Context
    useEffect(() => {
        const loadContext = async () => {
            try {
                const context = await sdk.context;
                if (context?.user) {
                    setFarcasterUser({
                        username: context.user.username,
                        pfpUrl: context.user.pfpUrl,
                        fid: context.user.fid
                    });
                }
            } catch (err) {
                console.warn("Farcaster context not loaded:", err);
            }
        };
        loadContext();
    }, []);

    // Fetch Basename (ENS on Base)
    // We prioritize Base chain for Basenames
    const { data: ensName } = useEnsName({
        address,
        chainId: base.id,
    });

    const { data: ensAvatar } = useEnsAvatar({
        name: ensName ?? undefined,
        chainId: base.id,
        query: {
            enabled: !!ensName,
        }
    });

    const identity = useMemo(() => {
        // Priority: Basename -> Farcaster Username -> Friendly fallback (NO 0x addresses per Base guidelines)
        const displayName = ensName || farcasterUser?.username || (isConnected ? 'Based User' : null);

        // Priority: ENS Avatar -> Farcaster PFP -> Default Blockie (in UI)
        const avatar = ensAvatar || farcasterUser?.pfpUrl || null;

        return {
            address,
            name: ensName || farcasterUser?.username || null,
            displayName,
            avatar,
            farcaster: farcasterUser,
            isConnected: isConnected || !!farcasterUser,
            source: ensName ? 'basename' : (farcasterUser ? 'farcaster' : 'wallet')
        };
    }, [address, ensName, ensAvatar, isConnected, farcasterUser]);

    return identity;
};
