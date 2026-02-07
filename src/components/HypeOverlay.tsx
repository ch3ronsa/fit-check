import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

interface HypeOverlayProps {
    show: boolean;
    onComplete: (score: number, message: string) => void;
}

const FALLBACK_MESSAGES = [
    "This fit locks the blockchain!",
    "CEO vibes only. Respect!",
    "Mirror cracked, too much charisma!",
    "You are the new King/Queen of Base.",
    "Satoshi would give his wallet for this.",
    "WAGMI energy detected!",
    "Straight to the moon!",
    "This fit is based fr fr",
    "Drip level: immeasurable",
];

function generateFallback(): { score: number; message: string } {
    const score = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
    const message = FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
    return { score, message };
}

async function captureCanvasAsBase64(): Promise<string | null> {
    const element = document.getElementById('fit-check-canvas');
    if (!element) return null;

    try {
        const canvas = await html2canvas(element, {
            scale: 1, // Low res for AI analysis (saves bandwidth)
            useCORS: true,
            allowTaint: false,
            backgroundColor: null,
            logging: false,
        });
        return canvas.toDataURL('image/jpeg', 0.5); // Low quality for API
    } catch {
        return null;
    }
}

async function analyzeWithAI(imageBase64: string): Promise<{ score: number; message: string }> {
    const response = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64 }),
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

const HypeOverlay: React.FC<HypeOverlayProps> = ({ show, onComplete }) => {
    const [score, setScore] = useState(0);
    const [isAnalysing, setIsAnalysing] = useState(true);

    useEffect(() => {
        if (!show) return;

        let cancelled = false;
        setIsAnalysing(true);

        const analyze = async () => {
            let result: { score: number; message: string };

            try {
                const imageBase64 = await captureCanvasAsBase64();
                if (cancelled) return;

                if (imageBase64) {
                    result = await analyzeWithAI(imageBase64);
                } else {
                    result = generateFallback();
                }
            } catch {
                result = generateFallback();
            }

            if (cancelled) return;

            setScore(result.score);
            setIsAnalysing(false);
            onComplete(result.score, result.message);
        };

        analyze();

        return () => { cancelled = true; };
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
