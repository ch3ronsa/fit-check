import { useMemo, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { toast } from 'sonner';
import {
    CONTRACT_V2_ABI,
    CONTRACT_V2_ADDRESS,
    IS_CONTRACT_V2_ENABLED,
} from '../constants';

export function useCreatorRewards() {
    const { address, isConnected } = useAccount();
    const { writeContractAsync } = useWriteContract();
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const { data: creatorEarnings = 0n, refetch: refetchEarnings } = useReadContract({
        address: CONTRACT_V2_ADDRESS,
        abi: CONTRACT_V2_ABI,
        functionName: 'creatorEarnings',
        args: [address as `0x${string}`],
        query: {
            enabled: IS_CONTRACT_V2_ENABLED && isConnected && !!address,
        },
    });

    const { data: creatorShareBps = 0n } = useReadContract({
        address: CONTRACT_V2_ADDRESS,
        abi: CONTRACT_V2_ABI,
        functionName: 'creatorShareBps',
        query: {
            enabled: IS_CONTRACT_V2_ENABLED,
        },
    });

    const earningsEth = useMemo(() => formatEther(creatorEarnings), [creatorEarnings]);

    const withdrawEarnings = async () => {
        if (!IS_CONTRACT_V2_ENABLED) {
            toast.info('Creator rewards are not enabled yet.');
            return;
        }

        if (!isConnected || !address) {
            toast.warning('Connect your wallet to withdraw creator earnings.');
            return;
        }

        if (creatorEarnings <= 0n) {
            toast.info('No creator earnings available yet.');
            return;
        }

        setIsWithdrawing(true);
        try {
            const hash = await writeContractAsync({
                address: CONTRACT_V2_ADDRESS,
                abi: CONTRACT_V2_ABI,
                functionName: 'withdrawCreatorEarnings',
            });

            await refetchEarnings();
            toast.success(`Creator payout sent. TX: ${hash.slice(0, 10)}...`);
        } catch (error) {
            const err = error as Error;
            if (err.message?.includes('rejected') || err.message?.includes('denied') || err.message?.includes('User denied')) {
                toast.info('Withdrawal cancelled');
            } else {
                toast.error(`Withdrawal failed: ${err.message || 'Unknown error'}`);
            }
        } finally {
            setIsWithdrawing(false);
        }
    };

    return {
        isV2Enabled: IS_CONTRACT_V2_ENABLED,
        creatorEarnings,
        earningsEth,
        creatorShareBps: Number(creatorShareBps),
        isWithdrawing,
        canWithdraw: creatorEarnings > 0n,
        withdrawEarnings,
    };
}
