import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// TODO: Replace with actual Project ID from WalletConnect Cloud
// TODO: Replace with actual Project ID from WalletConnect Cloud
const projectId = '3fcc6bba6f1de962d911bb5b5c3dba68'; // Demo ID

export const config = createConfig({
    chains: [base],
    connectors: [
        injected(),
        walletConnect({ projectId }),
    ],
    transports: {
        [base.id]: http(),
    },
})
