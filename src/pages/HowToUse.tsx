import React from 'react';
import { Upload, Sparkles, Share2, Database, ArrowLeft } from 'lucide-react';

interface HowToUseProps {
    onBack: () => void;
}

const HowToUse: React.FC<HowToUseProps> = ({ onBack }) => {
    const steps = [
        {
            icon: <Upload className="w-8 h-8 text-base-blue" />,
            title: "1. Upload & Frame",
            description: "Upload your best fit check photo. Use the touch controls to pan, zoom, and rotate your image to fit perfectly within one of our exclusive frames."
        },
        {
            icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
            title: "2. Get Rated",
            description: "Click 'Rate My Photo' to let our Hype Engine analyze your drip. You'll get a unique Style Score (0-100) and a hype comment."
        },
        {
            icon: <Share2 className="w-8 h-8 text-purple-500" />,
            title: "3. Share on Farcaster",
            description: "Love your look? Share it directly to Warpcast with one click. Show off your score to your followers!"
        },
        {
            icon: <Database className="w-8 h-8 text-green-500" />,
            title: "4. Mint on Base",
            description: "Immortalize your fit by minting it as an NFT on the Base blockchain. Your style history lives forever on-chain."
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-24 animate-in fade-in slide-in-from-bottom-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="font-display font-bold text-2xl">How to Use</h1>
                </div>

                {/* Steps */}
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-[var(--card-bg)] p-6 rounded-2xl border border-gray-800/50 shadow-lg flex gap-4 items-start">
                            <div className="p-3 bg-gray-900/50 rounded-xl shrink-0">
                                {step.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pro Tip */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-base-blue/10 to-purple-500/10 border border-base-blue/20">
                    <h3 className="font-bold text-base-blue mb-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        Pro Tip
                    </h3>
                    <p className="text-sm text-gray-300">
                        Maintain a daily streak to unlock special celebration effects! Check your profile to see your history and stats.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HowToUse;
