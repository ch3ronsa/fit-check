import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Sparkles, Share2, Database } from 'lucide-react';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
    const steps = [
        { icon: <Camera className="w-6 h-6" />, text: "Upload your fit check photo" },
        { icon: <Sparkles className="w-6 h-6" />, text: "Get your Style Score (0-100)" },
        { icon: <Share2 className="w-6 h-6" />, text: "Share your look anywhere" },
        { icon: <Database className="w-6 h-6" />, text: "Mint as NFT on Base" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-[var(--card-bg)] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-800/50 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-base-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">B</span>
                            </div>
                            <h2 className="font-display font-bold text-2xl mb-2">
                                Welcome to <span className="text-base-blue">Fit Check</span>
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Rate your outfit & mint on Base
                            </p>
                        </div>

                        {/* Steps */}
                        <div className="space-y-3 mb-6">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-900/50 border border-gray-800/50"
                                >
                                    <div className="p-2 bg-base-blue/20 rounded-lg text-base-blue">
                                        {step.icon}
                                    </div>
                                    <span className="text-sm font-medium">{step.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={onClose}
                            className="w-full bg-base-blue hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-base-blue/30"
                        >
                            Get Started 🚀
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OnboardingModal;
