import { base } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    coinbaseWallet,
    walletConnectWallet,
    metaMaskWallet,
    rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';

// Project ID from WalletConnect Cloud
const projectId = '3fcc6bba6f1de962d911bb5b5c3dba68'; // Demo ID

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                coinbaseWallet,
                walletConnectWallet,
                metaMaskWallet,
                rainbowWallet,
            ],
        },
    ],
    {
        appName: 'Base Fit Check Studio',
        projectId,
    }
);

export const config = createConfig({
    connectors,
    chains: [base],
    transports: {
        [base.id]: http(),
    },
    // SSR false not needed in createConfig, handled by Vite params mostly or wagmi logic
});
