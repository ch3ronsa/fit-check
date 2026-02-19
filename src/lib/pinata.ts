// Pinata IPFS Upload Service (via server-side API)

import { PINATA_GATEWAY } from '../config';

export interface UploadResult {
    success: boolean;
    ipfsHash?: string;
    url?: string;
    error?: string;
}

/**
 * Upload an image blob to IPFS via server-side API.
 * The Pinata JWT is kept server-side only for security.
 */
export const uploadToIPFS = async (blob: Blob, filename?: string): Promise<UploadResult> => {
    try {
        // Convert blob to base64
        const base64 = await blobToBase64(blob);

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: base64,
                filename: filename || `fit-check-${Date.now()}.png`,
            }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return { success: false, error: data.error || 'Upload failed' };
        }

        const data = await response.json();
        return {
            success: data.success,
            ipfsHash: data.ipfsHash,
            url: data.url,
        };
    } catch (error) {
        console.error('IPFS upload error:', error);
        return { success: false, error: 'Upload failed' };
    }
};

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Generate a shareable URL for a fit check image
 */
export const getShareableUrl = (ipfsHash: string): string => {
    return `${PINATA_GATEWAY}/${ipfsHash}`;
};

/**
 * Shorten a URL using TinyURL API
 */
export const shortenUrl = async (url: string): Promise<string> => {
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        if (response.ok) {
            const shortUrl = await response.text();
            return shortUrl;
        }
    } catch (error) {
        console.error('URL shortening failed:', error);
    }
    return url;
};
