import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, X } from 'lucide-react';

const WalletConnect: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();
    const [showModal, setShowModal] = useState(false);

    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (isConnected && address) {
        return (
            <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 bg-base-black/50 border border-base-blue/30 px-4 py-2 rounded-full text-sm font-mono text-base-blue hover:bg-base-blue/10 transition-colors"
            >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                {formatAddress(address)}
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-base-blue text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-base-blue/20"
            >
                <Wallet size={16} />
                Connect Wallet
            </button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[var(--card-bg)] border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-4 text-center">Connect Wallet</h2>

                        <div className="space-y-3">
                            <div className="space-y-3">
                                {/* Base App Wallet (Coinbase Smart Wallet) */}
                                <button
                                    onClick={() => {
                                        const connector = connectors.find(c => c.id === 'coinbaseWalletSDK');
                                        if (connector) connect({ connector });
                                        setShowModal(false);
                                    }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700 transition-all border border-gray-700 hover:border-base-blue group"
                                >
                                    <span className="font-medium">Base App Wallet</span>
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <div className="w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </button>

                                {/* Coinbase Wallet */}
                                <button
                                    onClick={() => {
                                        const connector = connectors.find(c => c.id === 'coinbaseWalletSDK');
                                        if (connector) connect({ connector });
                                        setShowModal(false);
                                    }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700 transition-all border border-gray-700 hover:border-base-blue group"
                                >
                                    <span className="font-medium">Coinbase Wallet</span>
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Wallet size={18} className="text-white" />
                                    </div>
                                </button>

                                {/* Farcaster Wallet (Injected) */}
                                <button
                                    onClick={() => {
                                        const connector = connectors.find(c => c.id === 'injected');
                                        if (connector) connect({ connector });
                                        setShowModal(false);
                                    }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-800/50 hover:bg-gray-700 transition-all border border-gray-700 hover:border-base-blue group"
                                >
                                    <span className="font-medium">Farcaster Wallet</span>
                                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                        <Wallet size={18} className="text-white" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WalletConnect;
