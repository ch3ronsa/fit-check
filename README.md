# Base Fit Check Studio

Base Fit Check Studio is a mobile-first social editor for the Base ecosystem. Users can upload an outfit photo, apply a frame and filter, get an AI-powered style score, share the result to Warpcast, and optionally mint the final image as an NFT on Base.

This repository is not just a front-end. It combines:

- a Vite + React client
- Vercel serverless API routes
- Hardhat contracts for NFT minting
- local persistence for fit history

## What The App Does

The main studio flow lives at `/`:

1. Upload a photo
2. Pick one of the built-in frames or an installed community frame
3. Apply one of the image filters
4. Run the "hype" flow to get a score and message
5. Download, share, or mint the result

Around that core flow, the app also includes:

- a profile page with fit history saved in IndexedDB
- a Farcaster-aware sharing flow with top-contact tagging
- an AI "Frens Generator" that creates a style archetype and suggestions
- a community frame marketplace backed by Pinata metadata
- an optional V2 mint flow with creator revenue sharing

## Key Features

- 25 built-in frames plus installable community frames
- 13 client-side filters
- AI style scoring and hype copy via `/api/analyze-style`
- AI style profile generation via `/api/generate-frens`
- Warpcast share flow with optional Farcaster mentions
- Wallet connect and Base minting with `wagmi` + `RainbowKit`
- Basename / ENS and Farcaster identity display
- Community frame publishing and usage tracking
- Creator earnings withdrawal when V2 is enabled
- Browser-side fit history stored with `idb`

## Stack

- Front-end: React 19, TypeScript, Vite, React Router, Tailwind CSS
- Web3: wagmi, viem, RainbowKit, Base
- Social: Farcaster Frame SDK, Neynar
- Storage: Pinata IPFS, IndexedDB
- AI: OpenAI vision calls through Vercel functions
- Contracts: Hardhat, OpenZeppelin
- Monitoring: Sentry
- Testing: Vitest, Testing Library

## Project Layout

```text
api/         Vercel serverless routes for AI, IPFS, health, frames, and contacts
contracts/   Solidity contracts for V1 and V2 NFT mint flows
scripts/     Hardhat deployment scripts
src/         React app, hooks, pages, components, and client utilities
public/      Static assets, built-in frames, icons, and cover art
```

## Routes

### App routes

- `/` - main fit-check studio
- `/profile` - saved fits, streaks, creator rewards
- `/frens` - AI style profile generator
- `/frames` - built-in and community frame marketplace
- `/frames/create` - publish a new community frame
- `/help` - in-app usage guide

### API routes

- `/api/analyze-style` - score an uploaded fit image
- `/api/generate-frens` - return a style archetype, palette, and suggestions
- `/api/upload` - upload rendered fit images to Pinata
- `/api/frames` - list frames, publish frames, and track installs / mints
- `/api/top-contacts` - fetch the user's top Farcaster contacts via Neynar
- `/api/health` - report external service readiness

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

Create a `.env` file from `.env.example`, then start the client:

```bash
npm run dev
```

### Important local-dev note

`npm run dev` starts the Vite front-end only. Features that call `/api/*` depend on the Vercel functions in `api/`, so the easiest way to test the full experience is to deploy on Vercel or run the project with a Vercel-compatible local workflow.

Client-only work such as layout, frame selection, and filter UI can still be developed with plain Vite.

## Environment Variables

Some features are optional. Missing keys usually disable a feature or trigger a fallback instead of crashing the app.

| Variable | Used for | Required |
| --- | --- | --- |
| `PRIVATE_KEY` | Hardhat deployer wallet | Only for contract deployment |
| `BASESCAN_API_KEY` | Contract verification | Only for deployment / verification |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect / RainbowKit | Recommended for wallet UX |
| `VITE_FARCASTER_APP_ID` | Farcaster app configuration | Optional |
| `VITE_APP_URL` | Share links and canonical app URL | Recommended |
| `VITE_PINATA_GATEWAY` | Public IPFS gateway for rendered assets | Recommended |
| `VITE_SENTRY_DSN` | Front-end error reporting | Optional |
| `VITE_CONTRACT_ADDRESS` | Override V1 mint contract address | Optional |
| `VITE_CONTRACT_V2_ADDRESS` | Enable V2 minting and creator rewards | Optional |
| `VITE_CONTRACT_V2_MINT_FEE_WEI` | Fallback V2 mint fee | Optional |
| `VITE_PINATA_JWT` | Server-side Pinata auth for uploads and frame storage | Required for uploads and marketplace publishing |
| `OPENAI_API_KEY` | AI scoring and style analysis | Optional, app falls back to canned results |
| `NEYNAR_API_KEY` | Farcaster top-contact lookup | Optional, tagging flow is limited without it |
| `ALLOWED_ORIGIN` | API CORS control | Recommended for deployment |

### Naming quirk

`VITE_PINATA_JWT` is used by the serverless functions even though it has a `VITE_` prefix. Keep the current name unless you also update the API code and deployment configuration.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite client |
| `npm run build` | Type-check and build the app |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite |

## Smart Contracts

### `contracts/FitCheckNFT.sol`

V1 contract with a simple `safeMint(address to, string uri)` flow.

### `contracts/FitCheckNFTV2.sol`

V2 contract adds:

- paid minting with `mintWithCreator`
- creator revenue sharing
- creator withdrawal flow
- platform earnings accounting
- ERC-2981 royalties

Deploy with Hardhat:

```bash
npx hardhat run scripts/deploy.cjs --network base
npx hardhat run scripts/deployV2.cjs --network base
```

## Behavior With Missing Services

- No `OPENAI_API_KEY`: score and style-profile APIs return fallback content
- No `NEYNAR_API_KEY`: top-contact tagging is unavailable
- No `VITE_PINATA_JWT`: uploads and community-frame publishing fail
- No `VITE_CONTRACT_V2_ADDRESS`: the app falls back to the live V1 contract path

## Testing

The repository already includes Vitest coverage for config, constants, filters, frame marketplace behavior, profile rewards, and mint routing.

Run:

```bash
npm test
```

## Summary

If you open this repo expecting a single-page "fit score" toy, it will look confusing. In practice it is a small full-stack Base app: editor, social sharing flow, AI helpers, frame marketplace, and NFT minting all living in one codebase.
