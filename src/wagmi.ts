import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'

// ...

export const config = createConfig({
    chains: [base],
    connectors: [
        injected(),
        coinbaseWallet({ appName: 'Base Fit Check Studio' }),
    ],
    // ...
    transports: {
        [base.id]: http(),
    },
})
