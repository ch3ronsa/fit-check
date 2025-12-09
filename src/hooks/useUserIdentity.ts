import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { base } from 'wagmi/chains';
import { useMemo } from 'react';

export const useUserIdentity = () => {
    const { address, isConnected } = useAccount();

    // Fetch Basename (ENS on Base)
    // We prioritize Base chain for Basenames
    const { data: ensName } = useEnsName({
        address,
        chainId: base.id, // Explicitly check on Base for Basenames
    });

    const { data: ensAvatar } = useEnsAvatar({
        name: ensName!,
        chainId: base.id,
        enabled: !!ensName,
    });

    const identity = useMemo(() => {
        if (!isConnected || !address) return null;

        return {
            address,
            name: ensName || null,
            displayName: ensName || `${address.slice(0, 6)}...${address.slice(-4)}`,
            avatar: ensAvatar || null,
        };
    }, [address, ensName, ensAvatar, isConnected]);

    return identity;
};
