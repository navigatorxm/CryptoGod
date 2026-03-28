// ============================================
// Core Types for CryptoGod Dashboard
// ============================================

export type ChainId =
  | 1      // Ethereum Mainnet
  | 11155111 // Sepolia Testnet
  | 56     // BSC Mainnet
  | 97     // BSC Testnet
  | 137    // Polygon Mainnet
  | 80002  // Polygon Amoy Testnet
  | 43114  // Avalanche
  | 42161  // Arbitrum
  | 10     // Optimism
  | 'solana-mainnet'
  | 'solana-devnet'
  | 'tron-mainnet'
  | 'tron-shasta';

export type TokenStandard = 'ERC20' | 'BEP20' | 'TRC20' | 'SPL' | 'ERC777';
export type ContractStandard = 'ERC721' | 'ERC1155' | 'ERC777' | 'ERC20' | 'Governance' | 'Utility' | 'Custom';
export type NetworkName =
  | 'ethereum' | 'sepolia'
  | 'bsc' | 'bsc-testnet'
  | 'polygon' | 'polygon-amoy'
  | 'avalanche' | 'arbitrum' | 'optimism'
  | 'solana' | 'solana-devnet'
  | 'tron' | 'tron-shasta';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'dropped';
export type WalletType = 'metamask' | 'walletconnect' | 'phantom' | 'tronlink' | 'coinbase';

// ============================================
// Network/Chain Configuration
// ============================================

export interface NetworkConfig {
  id: ChainId;
  name: string;
  shortName: NetworkName;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  testnetRpcUrl?: string;
  explorerUrl: string;
  testnetExplorerUrl?: string;
  explorerApiUrl?: string;
  faucetUrl?: string;
  isTestnet: boolean;
  icon: string;
  color: string;
  isEVM: boolean;
  chainType: 'evm' | 'solana' | 'tron';
}

// ============================================
// Token Types
// ============================================

export interface TokenConfig {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  standard: TokenStandard;
  network: NetworkName;
  chainId: ChainId;
  logoUrl?: string;
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  features: TokenFeatures;
  taxConfig?: TaxConfig;
  createdAt: Date;
  deployedAt?: Date;
  contractAddress?: string;
  deploymentTxHash?: string;
  owner?: string;
}

export interface TokenFeatures {
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
  taxable: boolean;
  antiWhale: boolean;
  blacklist: boolean;
  maxWallet: boolean;
  reflection: boolean;
  autoLiquidity: boolean;
  deflation: boolean;
}

export interface TaxConfig {
  buyTax: number;
  sellTax: number;
  transferTax: number;
  liquidityFee: number;
  marketingFee: number;
  burnFee: number;
  reflectionFee: number;
  maxWalletPercent?: number;
  maxTransactionPercent?: number;
}

export interface TokenAllowance {
  owner: string;
  spender: string;
  amount: string;
  tokenAddress: string;
  network: NetworkName;
}

// ============================================
// Transaction Types
// ============================================

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed?: string;
  gasPrice?: string;
  gasFee?: string;
  blockNumber?: number;
  status: TransactionStatus;
  network: NetworkName;
  method?: string;
  timestamp: Date;
  confirmations?: number;
  data?: string;
  error?: string;
}

export interface GasEstimate {
  slow: { gasPrice: string; time: string; cost: string };
  standard: { gasPrice: string; time: string; cost: string };
  fast: { gasPrice: string; time: string; cost: string };
  instant: { gasPrice: string; time: string; cost: string };
  baseFee?: string;
  maxPriorityFee?: string;
}

// ============================================
// Smart Contract Types
// ============================================

export interface ContractConfig {
  id: string;
  name: string;
  symbol?: string;
  standard: ContractStandard;
  network: NetworkName;
  chainId: ChainId;
  features: ContractFeatures;
  constructorArgs: Record<string, string>;
  source?: string;
  abi?: ContractABI[];
  bytecode?: string;
  deployedAt?: Date;
  address?: string;
  txHash?: string;
  verified?: boolean;
  auditStatus?: 'pending' | 'passed' | 'failed' | 'not-audited';
}

export interface ContractFeatures {
  ownable: boolean;
  upgradeable: boolean;
  pausable: boolean;
  enumerable: boolean;
  uriStorage: boolean;
  burnable: boolean;
  royalties: boolean;
  reveal: boolean;
  whitelist: boolean;
  publicMint: boolean;
  freeMint: boolean;
  multiSig: boolean;
  timelocked: boolean;
}

export interface ContractABI {
  name?: string;
  type: 'function' | 'event' | 'constructor' | 'fallback' | 'receive' | 'error';
  inputs?: ABIParam[];
  outputs?: ABIParam[];
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  anonymous?: boolean;
}

export interface ABIParam {
  name: string;
  type: string;
  components?: ABIParam[];
  indexed?: boolean;
}

export interface ContractFunction {
  name: string;
  type: 'read' | 'write';
  inputs: ABIParam[];
  outputs?: ABIParam[];
  stateMutability: string;
  payable: boolean;
}

// ============================================
// NFT Types
// ============================================

export interface NFTConfig {
  id: string;
  name: string;
  description: string;
  image?: string;
  animationUrl?: string;
  externalUrl?: string;
  attributes: NFTAttribute[];
  collectionId?: string;
  tokenId?: string;
  contractAddress?: string;
  network: NetworkName;
  standard: 'ERC721' | 'ERC1155';
  mintedAt?: Date;
  txHash?: string;
  ipfsHash?: string;
  metadataUri?: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_percentage' | 'boost_number' | 'date';
  max_value?: number;
}

export interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image?: string;
  bannerImage?: string;
  contractAddress?: string;
  network: NetworkName;
  standard: 'ERC721' | 'ERC1155';
  maxSupply: number;
  mintPrice: string;
  royaltyBps: number;
  royaltyRecipient: string;
  revealed: boolean;
  baseUri?: string;
  hiddenUri?: string;
  totalMinted: number;
  features: ContractFeatures;
  deployedAt?: Date;
}

export interface RoyaltyInfo {
  recipient: string;
  basisPoints: number;
  percentage: number;
}

// ============================================
// Testing Types
// ============================================

export interface TestEnvironment {
  id: string;
  name: string;
  network: NetworkName;
  status: 'running' | 'stopped' | 'error';
  accounts: TestAccount[];
  deployedContracts: DeployedContract[];
  transactions: Transaction[];
  blockNumber: number;
  gasLimit: number;
}

export interface TestAccount {
  address: string;
  privateKey: string;
  balance: string;
  label?: string;
}

export interface DeployedContract {
  address: string;
  name: string;
  abi: ContractABI[];
  bytecode: string;
  deployedAt: Date;
  txHash: string;
}

export interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration?: number;
  error?: string;
  assertions?: TestAssertion[];
}

export interface TestAssertion {
  description: string;
  passed: boolean;
  expected?: string;
  actual?: string;
}

// ============================================
// Security Types
// ============================================

export interface AttackVector {
  id: string;
  name: string;
  category: 'reentrancy' | 'flash-loan' | 'oracle' | 'access-control' | 'overflow' | 'front-running' | 'gas' | 'phishing';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  technicalDetails: string;
  vulnerableCode: string;
  secureCode: string;
  mitigations: string[];
  realWorldExamples: string[];
  affectedProtocols?: string[];
  lossAmount?: string;
  date?: string;
}

export interface SecurityChecklistItem {
  id: string;
  category: string;
  check: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  status: 'passed' | 'failed' | 'warning' | 'not-checked';
  recommendation?: string;
}

export interface ScamPattern {
  id: string;
  name: string;
  type: 'honeypot' | 'rug-pull' | 'pump-dump' | 'phishing' | 'fake-token' | 'drain';
  indicators: string[];
  contractPatterns: string[];
  warningSignals: string[];
  howToDetect: string;
  realExamples?: string[];
}

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsData {
  totalTransactions: number;
  totalGasSpent: string;
  totalTokensDeployed: number;
  totalContractsDeployed: number;
  totalNFTsMinted: number;
  networkDistribution: Record<NetworkName, number>;
  recentActivity: ActivityItem[];
  gasTrends: GasTrendPoint[];
}

export interface ActivityItem {
  id: string;
  type: 'token-deploy' | 'contract-deploy' | 'nft-mint' | 'transfer' | 'swap' | 'test';
  description: string;
  network: NetworkName;
  timestamp: Date;
  txHash?: string;
  value?: string;
}

export interface GasTrendPoint {
  timestamp: Date;
  gasPrice: number;
  network: NetworkName;
}

// ============================================
// Education Types
// ============================================

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'tokens' | 'nft' | 'defi' | 'security' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: TutorialStep[];
  prerequisites?: string[];
  tags: string[];
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  language?: string;
  interactiveComponent?: string;
  tip?: string;
  warning?: string;
}

export interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  language: 'solidity' | 'javascript' | 'typescript' | 'rust' | 'python';
  tags: string[];
  audited?: boolean;
}

// ============================================
// Wallet Types
// ============================================

export interface WalletState {
  connected: boolean;
  address?: string;
  chainId?: number;
  balance?: string;
  walletType?: WalletType;
  provider?: unknown;
}

// ============================================
// Mainnet Operations
// ============================================

export interface MultiSigWallet {
  id: string;
  address: string;
  network: NetworkName;
  owners: string[];
  threshold: number;
  pendingTransactions: MultiSigTransaction[];
  name?: string;
}

export interface MultiSigTransaction {
  id: string;
  to: string;
  value: string;
  data: string;
  confirmations: string[];
  executed: boolean;
  nonce: number;
}

export interface MonitoringAlert {
  id: string;
  type: 'large-transfer' | 'unusual-activity' | 'price-impact' | 'gas-spike' | 'contract-event';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  contractAddress?: string;
  network: NetworkName;
  timestamp: Date;
  acknowledged: boolean;
}
