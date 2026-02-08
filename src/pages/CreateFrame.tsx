import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Image, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserIdentity } from '../hooks/useUserIdentity';
import { useCommunityFrames } from '../hooks/useCommunityFrames';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const CreateFrame: React.FC = () => {
    const navigate = useNavigate();
    const identity = useUserIdentity();
    const { uploadFrame } = useCommunityFrames();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [preview, setPreview] = useState<string | null>(null);
    const [frameName, setFrameName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // Validate file type
        if (!file.type.startsWith('image/png')) {
            setError('Only PNG files are accepted. Frame must have transparent background.');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File too large. Maximum size is 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;

            // Validate it's actually a PNG with transparency (basic check)
            const img = new window.Image();
            img.onload = () => {
                // Check aspect ratio (should be roughly square)
                const ratio = img.width / img.height;
                if (ratio < 0.8 || ratio > 1.2) {
                    setError('Frame should be roughly square (1:1 aspect ratio).');
                    return;
                }
                setPreview(result);
            };
            img.src = result;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!preview || !frameName.trim()) return;

        setIsUploading(true);
        setError(null);

        try {
            await uploadFrame(preview, frameName.trim(), {
                address: identity?.address,
                name: identity?.displayName || 'Anonymous',
                fid: identity?.farcaster?.fid,
            });

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-24 animate-in fade-in">
                <div className="max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                        <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="font-display font-bold text-2xl mb-2">Frame Published!</h2>
                    <p className="text-gray-400 mb-6">Your frame is now available in the marketplace for everyone to use.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/frames')}
                            className="px-6 py-3 rounded-xl bg-base-blue text-white font-bold hover:bg-base-blue/80 transition-colors"
                        >
                            View Marketplace
                        </button>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setPreview(null);
                                setFrameName('');
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-bold hover:bg-gray-800 transition-colors"
                        >
                            Create Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-4 pb-24 animate-in fade-in slide-in-from-bottom-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/frames')}
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="font-display font-bold text-2xl">Create Frame</h1>
                        <p className="text-sm text-gray-400">Design a frame for the community</p>
                    </div>
                </div>

                {/* Guidelines */}
                <div className="bg-base-blue/10 border border-base-blue/20 rounded-2xl p-4 mb-6">
                    <h3 className="font-bold text-sm text-base-blue mb-2">Frame Guidelines</h3>
                    <ul className="text-xs text-gray-300 space-y-1">
                        <li>- PNG format with transparent background</li>
                        <li>- Square aspect ratio (1:1)</li>
                        <li>- Max file size: 2MB</li>
                        <li>- Leave center area open for the photo</li>
                        <li>- Frame border/overlay around edges works best</li>
                    </ul>
                </div>

                {/* Upload Area */}
                {!preview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-600 rounded-2xl p-12 text-center cursor-pointer hover:border-base-blue hover:bg-base-blue/5 transition-all mb-6"
                    >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                        <p className="font-bold text-lg mb-1">Upload Frame PNG</p>
                        <p className="text-sm text-gray-400">Transparent PNG, square, max 2MB</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="mb-6">
                        {/* Preview */}
                        <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-gray-800/50 mb-4">
                            <p className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                <Image size={16} />
                                Preview
                            </p>
                            <div className="aspect-square bg-gray-900 rounded-xl overflow-hidden relative">
                                {/* Checkerboard pattern to show transparency */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                                        backgroundSize: '20px 20px',
                                        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                                    }}
                                />
                                <img
                                    src={preview}
                                    alt="Frame preview"
                                    className="w-full h-full object-contain relative z-10"
                                />
                            </div>
                        </div>

                        {/* Frame Name */}
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-400 mb-2 block">Frame Name</label>
                            <input
                                type="text"
                                value={frameName}
                                onChange={(e) => setFrameName(e.target.value.slice(0, 30))}
                                placeholder="e.g. Neon Glow, Pixel Border..."
                                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-base-blue focus:outline-none transition-colors"
                                maxLength={30}
                            />
                            <p className="text-xs text-gray-500 mt-1 text-right">{frameName.length}/30</p>
                        </div>

                        {/* Creator Info */}
                        <div className="bg-[var(--card-bg)] rounded-xl p-3 border border-gray-800/50 mb-4">
                            <p className="text-xs text-gray-500 mb-1">Publishing as</p>
                            <p className="font-medium">{identity?.displayName || 'Anonymous'}</p>
                        </div>

                        {/* Change Photo */}
                        <button
                            onClick={() => {
                                setPreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-sm text-gray-400 hover:text-white transition-colors mb-4"
                        >
                            Change image
                        </button>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                {preview && (
                    <button
                        onClick={handleSubmit}
                        disabled={isUploading || !frameName.trim()}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-base-blue to-neon-purple text-white font-bold text-lg disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(0,82,255,0.3)]"
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Uploading to IPFS...
                            </span>
                        ) : (
                            'Publish Frame'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CreateFrame;
