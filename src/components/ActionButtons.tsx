import React from 'react';
import { Download, Share2, Sparkles, Database } from 'lucide-react';
import { FarcasterContact } from '../hooks/useTopContacts';

interface ActionButtonsProps {
  photo: File | null;
  finalScore: number | null;
  isMinting: boolean;
  isUploading: boolean;
  topContacts: FarcasterContact[];
  selectedContacts: FarcasterContact[];
  onFinalize: () => void;
  onDownload: (format: 'square' | 'story') => void;
  onShare: () => void;
  onMint: () => void;
  onToggleContact: (contact: FarcasterContact) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  photo,
  finalScore,
  isMinting,
  isUploading,
  topContacts,
  selectedContacts,
  onFinalize,
  onDownload,
  onShare,
  onMint,
  onToggleContact,
}) => {
  return (
    <div className="mt-8 space-y-4">
      {!finalScore ? (
        <button
          onClick={onFinalize}
          disabled={!photo}
          className={`w-full py-4 rounded-xl font-bold font-display text-xl flex items-center justify-center gap-2 transition-all ${photo
            ? 'bg-gradient-to-r from-base-blue to-neon-blue text-white shadow-[0_0_20px_rgba(0,82,255,0.5)] hover:scale-[1.02]'
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
        >
          <Sparkles className={photo ? 'animate-spin-slow' : ''} />
          {photo ? 'RATE MY PHOTO' : 'Upload Photo First'}
        </button>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex gap-2">
              <button
                onClick={() => onDownload('square')}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Download size={18} />
                Square
              </button>
              <button
                onClick={() => onDownload('story')}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
              >
                <Download size={18} />
                Story
              </button>
            </div>
          </div>

          {/* Tag Friends Section */}
          {topContacts.length > 0 && (
            <div className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-2">🏷️ Tag friends (tap to select):</p>
              <div className="flex flex-wrap gap-2">
                {topContacts.map((contact) => {
                  const isSelected = selectedContacts.some(c => c.fid === contact.fid);
                  return (
                    <button
                      key={contact.fid}
                      onClick={() => onToggleContact(contact)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${isSelected
                        ? 'bg-base-blue text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      @{contact.username}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Share button */}
          <button
            onClick={onShare}
            disabled={isUploading}
            className="w-full bg-[#855DCD] hover:bg-[#7C52C7] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(133,93,205,0.4)] disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Share2 size={20} />
                Share{selectedContacts.length > 0 ? ` (with ${selectedContacts.length} tags)` : ''}
              </>
            )}
          </button>

          {/* Mint Button */}
          <button
            onClick={onMint}
            disabled={isMinting}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.01]"
          >
            {isMinting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Database size={20} />}
            {isMinting ? 'Minting on Base...' : 'Save On-Chain (Mint NFT)'}
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
