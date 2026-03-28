# CryptoGod Dashboard — Setup Guide

## Quick Start

```bash
# 1. Install dependencies (--legacy-peer-deps required due to wagmi/viem peer constraints)
npm install --legacy-peer-deps

# 2. Copy environment config
cp .env.example .env.local

# 3. Fill in your API keys in .env.local (see below) — optional, app works without them

# 4. Run development server
npm run dev

# Open http://localhost:3000
```

> **Windows note:** Run all commands from the project root (`D:\CryptoGod`). If you moved the folder, delete `package-lock.json` and re-run `npm install --legacy-peer-deps`.

> **If you see `Failed to load SWC binary`:** The native SWC binary needs to match your Node.js version. Run `npm install --legacy-peer-deps` again to fetch the correct binary.

> **If `tailwindcss-animate` error:** The plugin is not installed. The `tailwind.config.js` has `plugins: []` — no action needed.

## Required API Keys

Edit `.env.local` and add:

| Key | Where to Get | Required For |
|-----|------|------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | [cloud.walletconnect.com](https://cloud.walletconnect.com) | Wallet connections |
| `NEXT_PUBLIC_INFURA_PROJECT_ID` | [infura.io](https://infura.io) | Ethereum RPC |
| `ETHERSCAN_API_KEY` | [etherscan.io/apis](https://etherscan.io/apis) | Contract verification |
| `BSCSCAN_API_KEY` | [bscscan.com/apis](https://bscscan.com/apis) | BSC verification |
| `POLYGONSCAN_API_KEY` | [polygonscan.com/apis](https://polygonscan.com/apis) | Polygon verification |
| `NEXT_PUBLIC_PINATA_API_KEY` | [app.pinata.cloud](https://app.pinata.cloud) | IPFS/NFT metadata |
| `NEXT_PUBLIC_ALCHEMY_ETH_KEY` | [alchemy.com](https://alchemy.com) | Enhanced RPC |

## Architecture

```
e:/CryptoGod/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Main dashboard
│   │   ├── tokens/             # Token Manager
│   │   ├── contracts/          # Contract Deployer
│   │   ├── testing/            # Test Environment
│   │   ├── mainnet/            # Mainnet Operations
│   │   ├── nft/                # NFT Studio
│   │   ├── security/           # Security Hub
│   │   ├── education/          # Learning Center
│   │   ├── analytics/          # Analytics
│   │   ├── gas/                # Gas Optimizer
│   │   ├── settings/           # Settings
│   │   └── ... (more pages)
│   ├── components/
│   │   ├── layout/             # Sidebar, Header
│   │   └── tokens/             # Token-specific components
│   ├── lib/
│   │   ├── constants/          # Networks, ABIs, templates
│   │   ├── web3/               # Wallet connection utils
│   │   └── utils/              # Formatting helpers
│   ├── store/                  # Zustand state management
│   └── types/                  # TypeScript types
├── .env.example                # Environment variable template
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Module Status

| Module | Status | Notes |
|--------|--------|-------|
| Token Manager | ✅ Full | ERC20/BEP20/TRC20/SPL creation, mint/burn/pause/transfer |
| Contract Deployer | ✅ Full | ERC721/ERC1155/Multisig/DAO/Custom, auto-verify |
| Test Environment | ✅ Full | Hardhat/Foundry, step debugger, gas profiler |
| Mainnet Operations | ✅ Full | Multi-sig, emergency controls, monitoring |
| NFT Studio | ✅ Full | Single mint, collections, marketplace integration |
| Security Hub | ✅ Full | Attack vectors, audit checklist, scam detector |
| Learning Center | ✅ Full | Tutorials, code templates |
| Analytics | ✅ Full | Charts, gas tracking, deployment stats |
| Gas Optimizer | ✅ Full | Real-time prices, cost calculator, tips |
| DApp Builder | 🔜 v2.0 | Phase 2 roadmap |
| DEX Platform | 🔜 v2.0 | Phase 2 roadmap |
| DeFi Protocols | 🔜 v2.0 | Phase 2 roadmap |
| DAO Governance | 🔜 v2.0 | Phase 2 roadmap |

## Supported Networks

- Ethereum Mainnet + Sepolia Testnet
- BNB Smart Chain + BSC Testnet
- Polygon Mainnet + Amoy Testnet
- Avalanche C-Chain
- Arbitrum One
- Optimism
- Solana Mainnet + Devnet
- TRON Mainnet + Shasta Testnet

## Supported Wallets

- MetaMask
- Coinbase Wallet
- Phantom (Solana)
- TronLink
- WalletConnect v2 (any EVM wallet)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3 + custom dark theme
- **Web3:** Ethers.js v6 + wagmi v2 + viem v2
- **State:** Zustand (persisted to localStorage)
- **Charts:** Recharts
- **Code Highlighting:** react-syntax-highlighter
- **Forms:** react-hook-form + zod
- **Notifications:** react-hot-toast

## Development Commands

```bash
npm run dev        # Start dev server (port 3000)
npm run build      # Production build
npm run start      # Run production server
npm run lint       # ESLint check
npm run typecheck  # TypeScript check
```

## Phase 2 Development (v2.0 Roadmap)

Priority order based on complexity:

1. **DApp Builder** — React component library for common Web3 patterns
2. **DEX Platform** — Fork Uniswap v2, add custom fee tiers and UI
3. **DeFi Protocols** — Lending (Aave-like), yield aggregator (Yearn-like)
4. **DAO Governance** — OpenZeppelin Governor + Timelock + frontend voting UI

Estimated effort: 3-4 months per module for production quality.
