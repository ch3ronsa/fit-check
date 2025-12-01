import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HypeOverlayProps {
    show: boolean;
    onComplete: (score: number, message: string) => void;
}

const HYPE_MESSAGES = [
    "🔥 This fit locks the blockchain!",
    "CEO vibes only. Respect!",
    "Mirror cracked, too much charisma!",
    "You are the new King/Queen of Base.",
    "Satoshi would give his wallet for this.",
    "I rate 10/10. What do you think? 👇",
    "Is this fit bearish or bullish?",
    "WAGMI energy detected! 🚀",
    "Straight to the moon! 🌕"
];

const HypeOverlay: React.FC<HypeOverlayProps> = ({ show, onComplete }) => {
    const [score, setScore] = useState(0);
    const [isAnalysing, setIsAnalysing] = useState(true);

    useEffect(() => {
        if (show) {
            setIsAnalysing(true);
            // Simulate analysis
            const timer = setTimeout(() => {
                const randomScore = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
                const randomMessage = HYPE_MESSAGES[Math.floor(Math.random() * HYPE_MESSAGES.length)];

                setScore(randomScore);
                setIsAnalysing(false);
                onComplete(randomScore, randomMessage);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4">
            <AnimatePresence>
                {isAnalysing ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-base-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-neon-blue font-display font-bold text-xl animate-pulse">Analyzing Drip...</p>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Score Badge - Minimal */}
                        <motion.div
                            id="style-score-badge"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute top-4 right-4 z-20"
                        >
                            <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-300 tracking-wider">SCORE</span>
                                <span className="text-xl font-black font-display text-base-blue">{score}</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HypeOverlay;
