import { base } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { type Config } from 'wagmi';

// Project ID from WalletConnect Cloud
const projectId = '3fcc6bba6f1de962d911bb5b5c3dba68'; // Demo ID

export const config: Config = getDefaultConfig({
    appName: 'Base Fit Check Studio',
    projectId,
    chains: [base],
    ssr: false, // Vite is client-side
});
