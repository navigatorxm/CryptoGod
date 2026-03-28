declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NEXT_PUBLIC_APP_NAME?: string;
    NEXT_PUBLIC_APP_URL?: string;

    // WalletConnect
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?: string;

    // RPC Endpoints
    NEXT_PUBLIC_ETHEREUM_RPC?: string;
    NEXT_PUBLIC_ETHEREUM_TESTNET_RPC?: string;
    NEXT_PUBLIC_BSC_RPC?: string;
    NEXT_PUBLIC_BSC_TESTNET_RPC?: string;
    NEXT_PUBLIC_POLYGON_RPC?: string;
    NEXT_PUBLIC_POLYGON_TESTNET_RPC?: string;
    NEXT_PUBLIC_AVALANCHE_RPC?: string;
    NEXT_PUBLIC_ARBITRUM_RPC?: string;
    NEXT_PUBLIC_OPTIMISM_RPC?: string;
    NEXT_PUBLIC_SOLANA_RPC?: string;
    NEXT_PUBLIC_SOLANA_DEVNET_RPC?: string;

    // Block Explorer API Keys
    ETHERSCAN_API_KEY?: string;
    BSCSCAN_API_KEY?: string;
    POLYGONSCAN_API_KEY?: string;
    ARBISCAN_API_KEY?: string;
    SNOWTRACE_API_KEY?: string;

    // IPFS / Pinata
    NEXT_PUBLIC_PINATA_API_KEY?: string;
    PINATA_SECRET_API_KEY?: string;
    NEXT_PUBLIC_IPFS_GATEWAY?: string;

    // Infura / Alchemy
    NEXT_PUBLIC_INFURA_PROJECT_ID?: string;
    NEXT_PUBLIC_ALCHEMY_ETH_KEY?: string;
    NEXT_PUBLIC_ALCHEMY_POLYGON_KEY?: string;

    // Analytics
    NEXT_PUBLIC_ANALYTICS_ID?: string;

    // Master Admin Wallets
    NEXT_PUBLIC_ADMIN_WALLET?: string;
    NEXT_PUBLIC_ADMIN_WALLET_2?: string;

    // Feature Flags
    NEXT_PUBLIC_ENABLE_MAINNET?: string;
    NEXT_PUBLIC_ENABLE_TESTNET?: string;
    NEXT_PUBLIC_DEMO_MODE?: string;
  }
}
