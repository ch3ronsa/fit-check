import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, ExternalLink } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareText: string;
    imageUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareText, imageUrl }) => {
    const [copied, setCopied] = React.useState(false);
    const [isSharing, setIsSharing] = React.useState(false);

    // App URL that includes embed metadata
    const appUrl = 'https://check-fit-two.vercel.app';
    // Full share text includes the image URL
    const shareTextWithLink = `${shareText}\n\n📸 ${imageUrl}`;
    const fullText = `${shareTextWithLink}\n\n${appUrl}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    // Share via Farcaster SDK (opens compose cast with embed)
    const handleFarcasterShare = async () => {
        setIsSharing(true);
        try {
            // Share text includes the image URL, and image is added as embed
            const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareTextWithLink)}&embeds[]=${encodeURIComponent(imageUrl)}`;

            // Check if we're in a Frame context
            const context = await sdk.context;
            if (context) {
                // Use SDK to open compose
                await sdk.actions.openUrl(shareUrl);
            } else {
                // Not in frame, open Warpcast directly
                window.open(shareUrl, '_blank');
            }
            onClose();
        } catch (err) {
            console.log('Farcaster share failed:', err);
            // Fallback to opening Warpcast in new tab
            window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareTextWithLink)}&embeds[]=${encodeURIComponent(imageUrl)}`, '_blank');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[var(--card-bg)] rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-800/50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-display font-bold text-xl">Share Your Fit</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Image Preview */}
                        <div className="bg-gray-900/50 rounded-xl p-3 mb-6 text-center">
                            <p className="text-xs text-gray-400 break-all">📸 {imageUrl}</p>
                        </div>

                        {/* Share to Feed Button (Primary) */}
                        <button
                            onClick={handleFarcasterShare}
                            disabled={isSharing}
                            className="w-full bg-[#855DCD] hover:bg-[#7C52C7] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20 mb-3 disabled:opacity-50"
                        >
                            {isSharing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <ExternalLink size={20} />
                                    Share to Feed
                                </>
                            )}
                        </button>

                        {/* Copy Button */}
                        <button
                            onClick={handleCopy}
                            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            {copied ? (
                                <>
                                    <Check size={20} className="text-green-400" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy size={20} />
                                    Copy Link & Text
                                </>
                            )}
                        </button>

                        {/* Info text */}
                        <p className="text-xs text-gray-500 text-center mt-4">
                            Your fit embed will appear in the post
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
