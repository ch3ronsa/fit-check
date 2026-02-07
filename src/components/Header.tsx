import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogoClick: () => void;
  identityDisplayName?: string | null;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleDarkMode, onLogoClick, identityDisplayName }) => {
  return (
    <header className="p-4 flex justify-between items-center border-b border-gray-800/50 bg-[var(--bg-primary)]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={onLogoClick}>
        <img src="/icon.png" alt="Fit Check" className="w-8 h-8 rounded-lg" />
        <h1 className="font-display font-bold text-xl tracking-tighter">FIT CHECK <span className="text-base-blue">STUDIO</span></h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
        </button>

        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none' as const,
                    userSelect: 'none' as const,
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="bg-base-blue hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                      >
                        Connect
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <button
                      onClick={openAccountModal}
                      className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-xl transition-colors"
                    >
                      {account.ensAvatar ? (
                        <img src={account.ensAvatar} alt="" className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-base-blue to-purple-500" />
                      )}
                      <span className="font-bold text-sm text-white">
                        {identityDisplayName || account.displayName}
                      </span>
                    </button>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
};

export default Header;
