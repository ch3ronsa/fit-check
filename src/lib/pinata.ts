// Pinata IPFS Upload Service

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export interface UploadResult {
    success: boolean;
    ipfsHash?: string;
    url?: string;
    error?: string;
}

/**
 * Upload an image blob to Pinata IPFS
 */
export const uploadToIPFS = async (blob: Blob, filename?: string): Promise<UploadResult> => {
    if (!PINATA_JWT) {
        console.error('Pinata JWT not configured');
        return { success: false, error: 'Upload service not configured' };
    }

    try {
        const formData = new FormData();
        const file = new File([blob], filename || `fit-check-${Date.now()}.png`, { type: 'image/png' });
        formData.append('file', file);

        // Add metadata
        const metadata = JSON.stringify({
            name: filename || `fit-check-${Date.now()}`,
            keyvalues: {
                app: 'base-fit-check',
                timestamp: Date.now().toString(),
            }
        });
        formData.append('pinataMetadata', metadata);

        // Upload options
        const options = JSON.stringify({
            cidVersion: 1,
        });
        formData.append('pinataOptions', options);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Pinata upload failed:', errorText);
            return { success: false, error: 'Upload failed' };
        }

        const data = await response.json();
        const ipfsHash = data.IpfsHash;
        const url = `${PINATA_GATEWAY}/${ipfsHash}`;

        return {
            success: true,
            ipfsHash,
            url,
        };
    } catch (error) {
        console.error('IPFS upload error:', error);
        return { success: false, error: 'Upload failed' };
    }
};

/**
 * Generate a shareable URL for a fit check image
 */
export const getShareableUrl = (ipfsHash: string): string => {
    // Option 1: Pinata gateway
    return `${PINATA_GATEWAY}/${ipfsHash}`;

    // Option 2: If you want a custom domain later:
    // return `https://check-fit-two.vercel.app/fit/${ipfsHash}`;
};
