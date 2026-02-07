import { useState } from 'react';
import { uploadToIPFS, shortenUrl } from '../lib/pinata';
import { generateImageBlob } from './useFitHistory';
import { FarcasterContact } from './useTopContacts';
import { APP_URL } from '../config';
import sdk from '@farcaster/frame-sdk';

export const useShare = () => {
  const [isUploading, setIsUploading] = useState(false);

  const handleShare = async (
    finalScore: number,
    finalMessage: string,
    selectedContacts: FarcasterContact[]
  ) => {
    setIsUploading(true);

    try {
      const imageBlob = await generateImageBlob();

      if (!imageBlob) {
        alert('Could not generate image. Please try again.');
        setIsUploading(false);
        return;
      }

      let imageUrl = APP_URL;
      try {
        const uploadResult = await uploadToIPFS(imageBlob, `fit-check-${Date.now()}.png`);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      } catch (uploadErr) {
        console.warn('IPFS upload failed, using fallback URL:', uploadErr);
      }

      const shortUrl = await shortenUrl(imageUrl);

      const mentions = selectedContacts.length > 0
        ? selectedContacts.map(c => `@${c.username}`).join(' ') + ' '
        : '';

      const shareText = `${mentions}Checking my fit on Base! 🔵 My Style Score: ${finalScore}/100. "${finalMessage}" Rate this look! 🛡️ #BaseFitCheck\n\n📸 ${shortUrl}`;

      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(imageUrl)}`;

      try {
        const context = await sdk.context;
        if (context) {
          await sdk.actions.openUrl(warpcastUrl);
        } else {
          window.open(warpcastUrl, '_blank');
        }
      } catch {
        window.open(warpcastUrl, '_blank');
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Could not share. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, handleShare };
};
