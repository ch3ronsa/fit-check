import React from 'react';

interface IdentityToggleProps {
  displayName: string;
  showIdentity: boolean;
  onToggle: () => void;
}

const IdentityToggle: React.FC<IdentityToggleProps> = ({ displayName, showIdentity, onToggle }) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-base-blue text-lg">👤</span>
          <div>
            <p className="font-bold text-sm text-white">Signed by {displayName}</p>
            <p className="text-xs text-gray-400">Add your Basename to the photo</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${showIdentity ? 'bg-base-blue' : 'bg-gray-600'}`}
        >
          <div
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${showIdentity ? 'translate-x-6' : 'translate-x-0'}`}
          />
        </button>
      </div>
    </div>
  );
};

export default IdentityToggle;
