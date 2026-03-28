# CryptoGod Dashboard

A professional crypto development platform for token creation, smart contract deployment, NFT minting, DeFi analytics, and multi-wallet management — built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Token Creator** — Deploy ERC20/BEP20/TRC20/SPL tokens with configurable features (mint, burn, tax, anti-whale, reflection)
- **Contract Deployer** — Deploy ERC721, ERC1155, MultiSig, DAO Governor, Timelock contracts with auto-verification
- **NFT Studio** — Mint and manage NFT collections with IPFS metadata storage
- **DeFi Analytics** — Real-time gas tracking, transaction history, and network activity
- **Security Toolkit** — Smart contract audit checklists, attack vector explorer, scam pattern detection
- **Testnet Environment** — Isolated test environments with funded accounts
- **Multi-Wallet Support** — MetaMask, Coinbase Wallet, Phantom (Solana), TronLink
- **Multi-Chain** — Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, Solana, Tron

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
git clone https://github.com/navigatorxm/CryptoGod.git
cd CryptoGod
npm install
```

### Environment Setup

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | Get from [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `NEXT_PUBLIC_ETHEREUM_RPC` | No | Defaults to `https://eth.llamarpc.com` |
| `ETHERSCAN_API_KEY` | No | For contract verification |
| `NEXT_PUBLIC_PINATA_API_KEY` | No | For NFT IPFS storage |
| `NEXT_PUBLIC_INFURA_PROJECT_ID` | No | For Infura RPC access |
| `NEXT_PUBLIC_ALCHEMY_ETH_KEY` | No | For Alchemy RPC access |

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |

## Deployment

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/navigatorxm/CryptoGod)

1. Connect your GitHub repo to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy

### Manual

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── tokens/           # Token creation wizard
│   ├── contracts/        # Contract deployer
│   ├── nft/              # NFT studio
│   ├── defi/             # DeFi analytics
│   ├── security/         # Security toolkit
│   ├── testing/          # Testnet environment
│   ├── settings/         # App settings
│   └── ...               # 15+ additional pages
├── components/
│   ├── layout/           # Header, Sidebar
│   └── tokens/           # Token creation components
├── lib/
│   ├── constants/        # Network configs, ABIs
│   ├── utils/            # Formatting helpers
│   └── web3/             # Wallet connection logic
├── store/                # Zustand state management
└── types/                # TypeScript type definitions
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand with persistence
- **Web3:** Ethers.js v6, Wagmi v2, RainbowKit
- **Charts:** Recharts
- **UI:** Radix UI, Lucide React, Framer Motion

## CI/CD

GitHub Actions runs lint, typecheck, and build on every push and pull request to `main`. See [.github/workflows/ci.yml](.github/workflows/ci.yml).

## License

MIT
