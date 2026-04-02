import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { formatEther } from 'viem';
import { toast } from 'sonner';
import { uploadToIPFS } from '../lib/pinata';
import { generateImageBlob, saveToHistory } from './useFitHistory';
import { playSuccessSound } from '../lib/utils';
import { showBrowserNotification } from '../lib/notifications';
import {
  CONTRACT_ADDRESS, CONTRACT_ABI,
  CONTRACT_V2_ADDRESS, CONTRACT_V2_ABI,
  DEFAULT_V2_MINT_FEE_WEI,
  IS_CONTRACT_V2_ENABLED,
} from '../constants';
import { useReadContract } from 'wagmi';

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

interface MintOptions {
  frameCreatorAddress?: string;
}

export const useMint = () => {
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isMinting, setIsMinting] = useState(false);
  const { data: contractMintFee } = useReadContract({
    address: CONTRACT_V2_ADDRESS,
    abi: CONTRACT_V2_ABI,
    functionName: 'mintFee',
    query: {
      enabled: IS_CONTRACT_V2_ENABLED,
    },
  });

  const mintFee = contractMintFee ?? DEFAULT_V2_MINT_FEE_WEI;
  const mintFeeEth = formatEther(mintFee);

  const handleMint = async (finalScore: number, finalMessage: string, options?: MintOptions) => {
    if (!isConnected || !address) {
      toast.warning('Please connect your wallet first!');
      return;
    }
    setIsMinting(true);

    try {
      const imageBlob = await generateImageBlob();
      if (!imageBlob) {
        toast.error('Could not generate image. Please try again.');
        setIsMinting(false);
        return;
      }

      let tokenURI = "ipfs://placeholder";
      try {
        const uploadResult = await uploadToIPFS(imageBlob, `fit-nft-${Date.now()}.png`);
        if (uploadResult.success && uploadResult.ipfsHash) {
          tokenURI = `ipfs://${uploadResult.ipfsHash}`;
        }
      } catch (uploadErr) {
        console.warn('IPFS upload failed:', uploadErr);
      }

      let hash: string;
      const validFrameCreatorAddress = options?.frameCreatorAddress && ADDRESS_PATTERN.test(options.frameCreatorAddress)
        ? options.frameCreatorAddress as `0x${string}`
        : undefined;

      // Use V2 contract with creator revenue sharing if available
      if (IS_CONTRACT_V2_ENABLED && validFrameCreatorAddress) {
        hash = await writeContractAsync({
          address: CONTRACT_V2_ADDRESS,
          abi: CONTRACT_V2_ABI,
          functionName: 'mintWithCreator',
          args: [address, tokenURI, validFrameCreatorAddress],
          value: mintFee,
        });
      } else if (IS_CONTRACT_V2_ENABLED) {
        // V2 free mint (no frame creator)
        hash = await writeContractAsync({
          address: CONTRACT_V2_ADDRESS,
          abi: CONTRACT_V2_ABI,
          functionName: 'safeMint',
          args: [address, tokenURI],
        });
      } else {
        // V1 fallback
        hash = await writeContractAsync({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'safeMint',
          args: [address, tokenURI],
        });
      }

      await saveToHistory(finalScore, finalMessage);
      playSuccessSound();
      showBrowserNotification('mint_success');
      toast.success(`Minted on Base! TX: ${hash.slice(0, 10)}...`);
    } catch (error: unknown) {
      console.error("Mint failed", error);
      const err = error as Error;
      if (err.message?.includes('rejected') || err.message?.includes('denied') || err.message?.includes('User denied')) {
        toast.info('Transaction cancelled');
      } else {
        toast.error(`Minting failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  return {
    isMinting,
    handleMint,
    isV2Enabled: IS_CONTRACT_V2_ENABLED,
    mintFeeEth,
  };
};
