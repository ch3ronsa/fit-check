import React, { useState, useRef } from 'react';
import { Upload, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface FrameEditorProps {
    selectedFrame: string | null;
    onPhotoUpload: (file: File) => void;
    children?: React.ReactNode;
    filterStyle?: string;
    identityName?: string | null;
    showIdentity?: boolean;
}

const FrameEditor: React.FC<FrameEditorProps> = ({ selectedFrame, onPhotoUpload, children, filterStyle = 'none', identityName, showIdentity }) => {
    const [image, setImage] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            onPhotoUpload(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                // Reset transformations
                setScale(1);
                setRotation(0);
                setPosition({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragStart({ x: clientX - position.x, y: clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setPosition({
            x: clientX - dragStart.x,
            y: clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto">
            {/* Editor Container */}
            <div
                id="fit-check-canvas"
                className="relative w-full aspect-square bg-base-black overflow-hidden rounded-xl border-2 border-base-blue shadow-[0_0_20px_rgba(0,82,255,0.3)]"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
            >
                {/* User Photo Layer */}
                {image && (
                    <div
                        className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                            filter: filterStyle,
                        }}
                    >
                        <img
                            src={image}
                            alt="User Upload"
                            className="max-w-none max-h-none object-cover"
                            style={{ width: '100%', height: '100%' }}
                            draggable={false}
                        />
                    </div>
                )}

                {/* Frame Overlay Layer */}
                {selectedFrame && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <img
                            src={selectedFrame}
                            alt="Frame Overlay"
                            className="w-full h-full object-contain"
                        />
                    </div>
                )}

                {/* Identity Overlay */}
                {showIdentity && identityName && (
                    <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                        <p className="font-display font-bold text-white text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                            {identityName}
                        </p>
                    </div>
                )}

                {/* Overlays (Hype Score, etc) */}
                {children}

                {/* Upload Placeholder - Clickable */}
                {!image && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center z-0 text-base-blue cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 mb-2 animate-bounce" />
                        <p className="font-display font-bold">Upload Your Fit</p>
                        <p className="text-xs text-gray-400 mt-1">Tap to select photo</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-4 w-full grid grid-cols-4 gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="col-span-4 bg-base-blue hover:bg-blue-600 text-white py-3 rounded-lg font-bold font-display flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                    <Upload size={20} />
                    {image ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                {image && (
                    <>
                        <button onClick={() => setRotation(r => r - 90)} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700"><RotateCw size={20} /></button>
                        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700"><ZoomOut size={20} /></button>
                        <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700"><ZoomIn size={20} /></button>
                        <button onClick={() => { setScale(1); setRotation(0); setPosition({ x: 0, y: 0 }); }} className="p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 text-xs">Reset</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default FrameEditor;
