import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    shareText: string;
    imageUrl: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareText, imageUrl }) => {
    const [copied, setCopied] = React.useState(false);

    const fullText = `${shareText}\n\n📸 ${imageUrl}`;

    const platforms = [
        {
            name: 'X / Twitter',
            icon: '𝕏',
            color: 'bg-black hover:bg-gray-800',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`,
        },
        {
            name: 'WhatsApp',
            icon: '💬',
            color: 'bg-[#25D366] hover:bg-[#20bd5a]',
            url: `https://wa.me/?text=${encodeURIComponent(fullText)}`,
        },
        {
            name: 'Telegram',
            icon: '✈️',
            color: 'bg-[#0088cc] hover:bg-[#0077b5]',
            url: `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(shareText)}`,
        },
        {
            name: 'Warpcast',
            icon: '🟣',
            color: 'bg-[#855DCD] hover:bg-[#7C52C7]',
            url: `https://warpcast.com/~/compose?text=${encodeURIComponent(fullText)}`,
        },
        {
            name: 'Facebook',
            icon: '📘',
            color: 'bg-[#1877F2] hover:bg-[#166FE5]',
            url: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(fullText)}`,
        },
        {
            name: 'Reddit',
            icon: '🤖',
            color: 'bg-[#FF4500] hover:bg-[#E03D00]',
            url: `https://reddit.com/submit?url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(shareText)}`,
        },
    ];

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleShare = (url: string) => {
        window.open(url, '_blank', 'width=600,height=400');
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
                        <div className="bg-gray-900/50 rounded-xl p-3 mb-4 text-center">
                            <p className="text-sm text-gray-400 truncate">📸 {imageUrl}</p>
                        </div>

                        {/* Platform Buttons */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {platforms.map((platform) => (
                                <button
                                    key={platform.name}
                                    onClick={() => handleShare(platform.url)}
                                    className={`${platform.color} text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all`}
                                >
                                    <span className="text-2xl">{platform.icon}</span>
                                    <span className="text-xs">{platform.name}</span>
                                </button>
                            ))}
                        </div>

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
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;
