import React, { useState } from 'react';
import { ArrowLeft, Plus, TrendingUp, Users, RefreshCw, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCommunityFrames, CommunityFrame } from '../hooks/useCommunityFrames';
import { FRAMES } from '../data/frames';

type TabFilter = 'all' | 'og' | 'community' | 'trending';

const FrameMarketplace: React.FC = () => {
    const navigate = useNavigate();
    const { frames: communityFrames, isLoading, refresh } = useCommunityFrames();
    const [activeTab, setActiveTab] = useState<TabFilter>('all');
    const [installedFrames, setInstalledFrames] = useState<Set<string>>(() => {
        try {
            const saved = localStorage.getItem('fitcheck_installed_frames');
            return saved ? new Set(JSON.parse(saved)) : new Set();
        } catch {
            return new Set();
        }
    });

    const ogFrames = FRAMES.filter(f => f.path !== null);

    const toggleInstall = (frameId: string) => {
        setInstalledFrames(prev => {
            const next = new Set(prev);
            if (next.has(frameId)) {
                next.delete(frameId);
            } else {
                next.add(frameId);
            }
            localStorage.setItem('fitcheck_installed_frames', JSON.stringify([...next]));
            return next;
        });
    };

    const trendingFrames = communityFrames.filter(f => f.uses >= 10);
    const regularCommunity = communityFrames.filter(f => f.uses < 10);

    const tabs: { id: TabFilter; label: string; icon: React.ReactNode; count: number }[] = [
        { id: 'all', label: 'All', icon: null, count: ogFrames.length + communityFrames.length },
        { id: 'og', label: 'OG', icon: null, count: ogFrames.length },
        { id: 'community', label: 'Community', icon: <Users size={14} />, count: regularCommunity.length },
        { id: 'trending', label: 'Trending', icon: <TrendingUp size={14} />, count: trendingFrames.length },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-24 animate-in fade-in slide-in-from-bottom-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="font-display font-bold text-2xl">Frame Market</h1>
                            <p className="text-sm text-gray-400">{ogFrames.length + communityFrames.length} frames available</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => refresh()}
                            className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => navigate('/frames/create')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-base-blue text-white text-sm font-bold hover:bg-base-blue/80 transition-colors"
                        >
                            <Plus size={16} />
                            Create
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                activeTab === tab.id
                                    ? 'bg-base-blue text-white'
                                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className="text-xs opacity-70">({tab.count})</span>
                        </button>
                    ))}
                </div>

                {/* OG Frames Section */}
                {(activeTab === 'all' || activeTab === 'og') && ogFrames.length > 0 && (
                    <div className="mb-8">
                        {activeTab === 'all' && (
                            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                                OG Frames
                                <span className="text-xs bg-base-blue/20 text-base-blue px-2 py-0.5 rounded-full">Built-in</span>
                            </h2>
                        )}
                        <div className="grid grid-cols-3 gap-3">
                            {ogFrames.map(frame => (
                                <div
                                    key={frame.id}
                                    className="bg-[var(--card-bg)] rounded-xl border border-gray-800/50 overflow-hidden"
                                >
                                    <div className="aspect-square bg-gray-900 p-2">
                                        <img
                                            src={frame.path!}
                                            alt={frame.name}
                                            className="w-full h-full object-contain"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <p className="text-xs font-medium truncate">{frame.name}</p>
                                        <p className="text-[10px] text-gray-500">OG Collection</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Section */}
                {(activeTab === 'all' || activeTab === 'trending') && trendingFrames.length > 0 && (
                    <div className="mb-8">
                        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <TrendingUp size={18} className="text-orange-400" />
                            Trending
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {trendingFrames.map(frame => (
                                <CommunityFrameCard
                                    key={frame.id}
                                    frame={frame}
                                    isInstalled={installedFrames.has(frame.id)}
                                    onToggle={() => toggleInstall(frame.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Community Section */}
                {(activeTab === 'all' || activeTab === 'community') && (
                    <div className="mb-8">
                        {activeTab === 'all' && (
                            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <Users size={18} className="text-purple-400" />
                                Community
                            </h2>
                        )}
                        {regularCommunity.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {regularCommunity.map(frame => (
                                    <CommunityFrameCard
                                        key={frame.id}
                                        frame={frame}
                                        isInstalled={installedFrames.has(frame.id)}
                                        onToggle={() => toggleInstall(frame.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-[var(--card-bg)] rounded-2xl border border-dashed border-gray-700">
                                <Users className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                                <p className="text-gray-400 font-medium">No community frames yet</p>
                                <p className="text-sm text-gray-500 mt-1">Be the first to create one!</p>
                                <button
                                    onClick={() => navigate('/frames/create')}
                                    className="mt-4 px-4 py-2 rounded-xl bg-base-blue text-white text-sm font-bold hover:bg-base-blue/80 transition-colors"
                                >
                                    Create Frame
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading */}
                {isLoading && communityFrames.length === 0 && (
                    <div className="text-center py-12">
                        <RefreshCw className="w-8 h-8 mx-auto mb-3 text-gray-500 animate-spin" />
                        <p className="text-gray-400">Loading community frames...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Community Frame Card Component
const CommunityFrameCard: React.FC<{
    frame: CommunityFrame;
    isInstalled: boolean;
    onToggle: () => void;
}> = ({ frame, isInstalled, onToggle }) => {
    return (
        <div className="bg-[var(--card-bg)] rounded-xl border border-gray-800/50 overflow-hidden group">
            <div className="aspect-square bg-gray-900 p-2 relative">
                <img
                    src={frame.url}
                    alt={frame.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                />
                {/* Install/Remove overlay on hover */}
                <button
                    onClick={onToggle}
                    className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                        isInstalled
                            ? 'bg-green-500/20 opacity-100'
                            : 'bg-black/50 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    {isInstalled ? (
                        <div className="bg-green-500 rounded-full p-1.5">
                            <Check size={16} className="text-white" />
                        </div>
                    ) : (
                        <div className="bg-base-blue rounded-full p-1.5">
                            <Plus size={16} className="text-white" />
                        </div>
                    )}
                </button>
            </div>
            <div className="p-2">
                <p className="text-xs font-medium truncate">{frame.name}</p>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[10px] text-gray-500 truncate">by {frame.creator.name}</p>
                    {frame.uses > 0 && (
                        <span className="text-[10px] text-gray-500">{frame.uses} uses</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FrameMarketplace;
