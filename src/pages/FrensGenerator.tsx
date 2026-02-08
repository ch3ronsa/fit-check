import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Upload, Palette, Users, Zap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StyleProfile {
    archetype: string;
    colors: string[];
    category: string;
    suggestions: string[];
    styleTwin: {
        name: string;
        reason: string;
    };
    vibe: string;
}

const FrensGenerator: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photo, setPhoto] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [profile, setProfile] = useState<StyleProfile | null>(null);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            setPhoto(ev.target?.result as string);
            setProfile(null);
        };
        reader.readAsDataURL(file);
    };

    const analyzeStyle = async () => {
        if (!photo) return;

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/generate-frens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: photo }),
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data: StyleProfile = await response.json();
            setProfile(data);
        } catch (err) {
            console.error('Style analysis failed:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const reset = () => {
        setPhoto(null);
        setProfile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-24 animate-in fade-in slide-in-from-bottom-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-display font-bold text-2xl">Frens Generator</h1>
                        <p className="text-sm text-gray-400">AI Style Analysis & Matching</p>
                    </div>
                </div>

                {/* Upload Section */}
                {!photo && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-base-blue hover:bg-base-blue/5 transition-all"
                    >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                        <p className="font-bold text-lg mb-1">Upload Your Fit</p>
                        <p className="text-sm text-gray-400">Get AI-powered style analysis & find your style twin</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoSelect}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Photo Preview + Analyze Button */}
                {photo && !profile && (
                    <div className="space-y-4">
                        <div className="rounded-2xl overflow-hidden shadow-xl">
                            <img src={photo} alt="Your fit" className="w-full h-auto max-h-96 object-cover" />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={reset}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 transition-colors"
                            >
                                Change Photo
                            </button>
                            <button
                                onClick={analyzeStyle}
                                disabled={isAnalyzing}
                                className="flex-[2] py-3 px-4 rounded-xl bg-gradient-to-r from-base-blue to-neon-purple text-white font-bold disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(0,82,255,0.3)]"
                            >
                                {isAnalyzing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        Analyze My Style
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Results */}
                {profile && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Photo with Archetype Badge */}
                        <div className="relative rounded-2xl overflow-hidden shadow-xl">
                            <img src={photo!} alt="Your fit" className="w-full h-auto max-h-72 object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                <p className="text-xs uppercase tracking-wider text-gray-300 mb-1">{profile.category}</p>
                                <h2 className="font-display font-black text-2xl text-white">{profile.archetype}</h2>
                                <p className="text-sm text-gray-300 italic mt-1">"{profile.vibe}"</p>
                            </div>
                        </div>

                        {/* Color Palette */}
                        <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-gray-800/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Palette size={18} className="text-base-blue" />
                                <h3 className="font-bold">Your Color Palette</h3>
                            </div>
                            <div className="flex gap-3">
                                {profile.colors.map((color, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full h-16 rounded-xl shadow-inner border border-gray-700/50"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span className="text-xs font-mono text-gray-400">{color}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Style Twin */}
                        <div className="bg-gradient-to-r from-neon-purple/10 to-base-blue/10 rounded-2xl p-4 border border-neon-purple/20">
                            <div className="flex items-center gap-2 mb-3">
                                <Users size={18} className="text-neon-purple" />
                                <h3 className="font-bold">Your Style Twin</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-purple to-base-blue flex items-center justify-center text-2xl shrink-0">
                                    {profile.styleTwin.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{profile.styleTwin.name}</p>
                                    <p className="text-sm text-gray-400">{profile.styleTwin.reason}</p>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-gray-800/50">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap size={18} className="text-yellow-400" />
                                <h3 className="font-bold">Level Up Your Fit</h3>
                            </div>
                            <div className="space-y-3">
                                {profile.suggestions.map((suggestion, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-900/30">
                                        <span className="text-base-blue font-bold text-sm mt-0.5">{i + 1}.</span>
                                        <p className="text-sm text-gray-300">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Try Again */}
                        <button
                            onClick={reset}
                            className="w-full py-3 px-4 rounded-xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Try Another Fit
                        </button>
                    </div>
                )}

                {/* Info Card - shown when no photo */}
                {!photo && (
                    <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-base-blue/10 to-neon-purple/10 border border-base-blue/20">
                        <h3 className="font-bold text-base-blue mb-3 flex items-center gap-2">
                            <Sparkles size={16} />
                            What is Frens Generator?
                        </h3>
                        <ul className="text-sm text-gray-300 space-y-2">
                            <li className="flex items-start gap-2">
                                <Palette size={14} className="mt-1 shrink-0 text-pink-400" />
                                <span>Get your unique <strong>Style Archetype</strong> and color palette</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Users size={14} className="mt-1 shrink-0 text-purple-400" />
                                <span>Discover your <strong>Style Twin</strong> from pop culture</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Zap size={14} className="mt-1 shrink-0 text-yellow-400" />
                                <span>Get AI-powered <strong>outfit suggestions</strong> to level up</span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FrensGenerator;
