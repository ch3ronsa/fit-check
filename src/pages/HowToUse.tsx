import React from 'react';
import { Upload, Sparkles, Share2, Database, ArrowLeft, Palette, Users, User, Image } from 'lucide-react';

interface HowToUseProps {
    onBack: () => void;
}

const HowToUse: React.FC<HowToUseProps> = ({ onBack }) => {
    const steps = [
        {
            icon: <Upload className="w-8 h-8 text-base-blue" />,
            title: "1. Upload Your Photo",
            description: "Tap the upload area to select your best fit check photo. Use touch controls to pan, zoom, and position your image perfectly."
        },
        {
            icon: <Image className="w-8 h-8 text-pink-400" />,
            title: "2. Choose Frame",
            description: "Browse 25+ exclusive digital frames. Each frame gives your photo a unique look - from minimalist to bold designs."
        },
        {
            icon: <Palette className="w-8 h-8 text-purple-400" />,
            title: "3. Apply Filter",
            description: "Choose from 5 professional filters: Original, B&W, Vintage, Contrast, or Cyber. Find the perfect vibe for your fit!"
        },
        {
            icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
            title: "4. Get Your Score",
            description: "Click 'RATE MY PHOTO' to let our Hype Engine analyze your drip. You'll receive a Style Score (0-100) and a unique hype comment!"
        },
        {
            icon: <User className="w-8 h-8 text-cyan-400" />,
            title: "5. Add Your Identity",
            description: "If connected, toggle to add your Basename or Farcaster name as a signature on your photo. Show the world who's got style!"
        },
        {
            icon: <Users className="w-8 h-8 text-orange-400" />,
            title: "6. Tag Friends",
            description: "Select your top Farcaster contacts to tag when sharing. Powered by Neynar, we show the people you interact with most."
        },
        {
            icon: <Share2 className="w-8 h-8 text-purple-500" />,
            title: "7. Share to Warpcast",
            description: "One-click share to Warpcast. Your fit, score, and image link are automatically composed. Let your followers rate your look!"
        },
        {
            icon: <Database className="w-8 h-8 text-green-500" />,
            title: "8. Mint on Base",
            description: "Immortalize your fit by minting it as an NFT on the Base blockchain. Your style history lives forever on-chain!"
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
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={index} className="bg-[var(--card-bg)] p-5 rounded-2xl border border-gray-800/50 shadow-lg flex gap-4 items-start">
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

                {/* Features */}
                <div className="mt-8 p-5 rounded-2xl bg-gray-800/30 border border-gray-700/50">
                    <h3 className="font-bold text-lg mb-4">✨ Features</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-base-blue">🖼️</span>
                            <span>25+ Frames</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-base-blue">🎨</span>
                            <span>5 Filters</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-base-blue">📊</span>
                            <span>Style Scores</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-base-blue">🏷️</span>
                            <span>Friend Tagging</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-base-blue">🔗</span>
                            <span>NFT Minting</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-base-blue">🟣</span>
                            <span>Warpcast Native</span>
                        </div>
                    </div>
                </div>

                {/* Pro Tip */}
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-base-blue/10 to-purple-500/10 border border-base-blue/20">
                    <h3 className="font-bold text-base-blue mb-2 flex items-center gap-2">
                        <Sparkles size={16} />
                        Pro Tips
                    </h3>
                    <ul className="text-sm text-gray-300 space-y-2">
                        <li>• Maintain a daily streak for special celebration effects!</li>
                        <li>• Check your Profile to see your mint history and stats</li>
                        <li>• Tag friends to boost engagement on your posts</li>
                        <li>• Try different frame + filter combos for unique looks</li>
                    </ul>
                </div>

                {/* Social */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Built with ❤️ for the Base ecosystem</p>
                    <p className="mt-1">Powered by Farcaster Frame v2</p>
                </div>
            </div>
        </div>
    );
};

export default HowToUse;
