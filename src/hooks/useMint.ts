import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { uploadToIPFS } from '../lib/pinata';
import { generateImageBlob, saveToHistory } from './useFitHistory';
import { playSuccessSound } from '../lib/utils';
import { showBrowserNotification } from '../lib/notifications';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants';

export const useMint = () => {
  const { isConnected, address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = async (finalScore: number, finalMessage: string) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet first!");
      return;
    }
    setIsMinting(true);

    try {
      const imageBlob = await generateImageBlob();
      if (!imageBlob) {
        alert("Could not generate image. Please try again.");
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

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'safeMint',
        args: [address, tokenURI],
      });

      await saveToHistory(finalScore, finalMessage);
      playSuccessSound();
      showBrowserNotification('mint_success');
      alert(`Successfully Minted on Base! 🔵\nTX: ${hash}`);
    } catch (error: unknown) {
      console.error("Mint failed", error);
      const err = error as Error;
      if (err.message?.includes('rejected') || err.message?.includes('denied') || err.message?.includes('User denied')) {
        // User rejected transaction
      } else {
        alert(`Minting failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsMinting(false);
    }
  };

  return { isMinting, handleMint };
};
