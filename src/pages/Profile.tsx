import React, { useEffect, useState } from 'react';
import { ArrowLeft, Share2, Flame, Calendar, CheckCircle2 } from 'lucide-react';
import { useAccount, useEnsName, useEnsAvatar } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

interface SavedFit {
    id: string;
    image: string;
    score: number;
    date: string;
    message: string;
}

interface ProfileProps {
    onBack: () => void;
}

import { useUserIdentity } from '../hooks/useUserIdentity';

// ... (keep interface definitions)

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
    const identity = useUserIdentity();
    const { address } = useAccount(); // Keep for address check if needed, but identity has it too

    const [fits, setFits] = useState<SavedFit[]>([]);
    const [streak, setStreak] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);

    // ... (keep logic for streak calculation)

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-20 relative overflow-hidden">
            {/* ... (keep Celebration Overlay) ... */}

            <div className="max-w-lg mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    {/* ... (keep header content) ... */}
                </div>

                {/* Profile Card */}
                <div className="bg-[var(--card-bg)] rounded-2xl p-6 mb-8 shadow-lg border border-gray-800/20 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <div className="w-32 h-32 bg-base-blue rounded-full blur-3xl"></div>
                    </div>

                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-base-blue to-neon-purple p-1 relative z-10">
                        <img
                            src={identity?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${identity?.address || 'default'}`}
                            alt="Avatar"
                            className="w-full h-full rounded-full bg-black object-cover"
                        />
                    </div>
                    <div className="relative z-10">
                        <h2 className="font-bold text-xl">{identity?.displayName || 'Guest User'}</h2>
                        <div className="flex items-center gap-2 mt-1 text-sm text-base-blue font-medium">
                            <CheckCircle2 size={14} />
                            {identity?.source === 'farcaster' ? 'Farcaster Connected' : (identity?.source === 'basename' ? 'Basename Verified' : 'Wallet Connected')}
                        </div>
                    </div>
                </div>

                {/* Streak Banner */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl p-4 mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500 rounded-full text-white animate-bounce">
                            <Flame size={24} fill="currentColor" />
                        </div>
                        <div>
                            <p className="font-bold text-orange-500 text-lg">
                                {streak > 0 ? `${streak} Day Streak!` : "Start your streak!"}
                            </p>
                            <p className="text-xs font-medium opacity-80">
                                {streak > 0 ? "You've slayed your day! 🔥" : "Do a fit check today to ignite the flame."}
                            </p>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-orange-500 font-display">
                        {streak}
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Calendar size={18} />
                    History
                </h3>

                {fits.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-xl">No fits saved yet.</p>
                        <p className="text-sm mt-2">Go create some drip! 💧</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {fits.map((fit) => (
                            <div key={fit.id} className="bg-[var(--card-bg)] rounded-2xl overflow-hidden shadow-lg border border-gray-800/20">
                                <div className="bg-gray-900/50 p-3 border-b border-gray-800 flex justify-between items-center">
                                    <span className="font-mono font-bold text-lg text-gray-300">
                                        {new Date(fit.date.includes('/') ? Number(fit.id) : fit.date).toLocaleDateString()}
                                    </span>
                                    <span className="bg-base-blue text-white text-xs font-bold px-2 py-1 rounded-full">
                                        SCORE: {fit.score}
                                    </span>
                                </div>
                                <img src={fit.image} alt="Fit" className="w-full h-auto" />
                                <div className="p-4 flex justify-between items-center">
                                    <p className="text-sm font-medium opacity-80 truncate max-w-[200px] italic">"{fit.message}"</p>
                                    <button
                                        onClick={() => handleShare(fit)}
                                        className="p-2 bg-base-blue/10 text-base-blue rounded-full hover:bg-base-blue/20 transition-colors"
                                    >
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Debug Info */}
                <div className="mt-8 p-4 bg-black/20 rounded-lg text-xs font-mono text-gray-500 text-center">
                    <p>Debug Info:</p>
                    <p>Total Fits: {fits.length}</p>
                    <p>Streak: {streak}</p>
                    <p>Last Active: {fits.length > 0 ? new Date(fits[0].date.includes('/') ? Number(fits[0].id) : fits[0].date).toLocaleString() : 'N/A'}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
