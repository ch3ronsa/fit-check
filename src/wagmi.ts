import { base } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
    coinbaseWallet,
    walletConnectWallet,
    metaMaskWallet,
    rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';

import { WALLETCONNECT_PROJECT_ID } from './config';

const projectId = WALLETCONNECT_PROJECT_ID;

export const hasWalletConnectProjectId = (walletConnectProjectId = projectId) =>
    walletConnectProjectId.trim().length > 0;

const recommendedWallets = hasWalletConnectProjectId()
    ? [
        coinbaseWallet,
        walletConnectWallet,
        metaMaskWallet,
        rainbowWallet,
    ]
    : [coinbaseWallet];

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: recommendedWallets,
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
