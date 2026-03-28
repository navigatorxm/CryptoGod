import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  TokenConfig,
  Transaction,
  ContractConfig,
  NFTCollection,
  NFTConfig,
  MonitoringAlert,
  NetworkName,
  WalletState,
  TestEnvironment,
  AnalyticsData,
  ActivityItem,
} from '@/types';

// ============================================
// Wallet Store
// ============================================
interface WalletStore extends WalletState {
  setWallet: (wallet: Partial<WalletState>) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      connected: false,
      address: undefined,
      chainId: undefined,
      balance: undefined,
      walletType: undefined,
      provider: undefined,

      setWallet: (wallet) => set((state) => ({ ...state, ...wallet })),
      disconnect: () =>
        set({
          connected: false,
          address: undefined,
          chainId: undefined,
          balance: undefined,
          walletType: undefined,
          provider: undefined,
        }),
    }),
    {
      name: 'cryptogod-wallet',
      partialize: (state) => ({
        connected: state.connected,
        address: state.address,
        chainId: state.chainId,
        walletType: state.walletType,
      }),
    }
  )
);

// ============================================
// Token Store
// ============================================
interface TokenStore {
  tokens: TokenConfig[];
  selectedToken: TokenConfig | null;
  addToken: (token: TokenConfig) => void;
  updateToken: (id: string, updates: Partial<TokenConfig>) => void;
  removeToken: (id: string) => void;
  selectToken: (token: TokenConfig | null) => void;
}

export const useTokenStore = create<TokenStore>()(
  persist(
    (set) => ({
      tokens: [],
      selectedToken: null,

      addToken: (token) =>
        set((state) => ({ tokens: [token, ...state.tokens] })),

      updateToken: (id, updates) =>
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      removeToken: (id) =>
        set((state) => ({
          tokens: state.tokens.filter((t) => t.id !== id),
          selectedToken:
            state.selectedToken?.id === id ? null : state.selectedToken,
        })),

      selectToken: (token) => set({ selectedToken: token }),
    }),
    { name: 'cryptogod-tokens' }
  )
);

// ============================================
// Transaction Store
// ============================================
interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
  getByNetwork: (network: NetworkName) => Transaction[];
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions].slice(0, 200), // keep last 200
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),

      clearTransactions: () => set({ transactions: [] }),

      getByNetwork: (network) =>
        get().transactions.filter((tx) => tx.network === network),
    }),
    { name: 'cryptogod-transactions' }
  )
);

// ============================================
// Contract Store
// ============================================
interface ContractStore {
  contracts: ContractConfig[];
  selectedContract: ContractConfig | null;
  addContract: (contract: ContractConfig) => void;
  updateContract: (id: string, updates: Partial<ContractConfig>) => void;
  removeContract: (id: string) => void;
  selectContract: (contract: ContractConfig | null) => void;
}

export const useContractStore = create<ContractStore>()(
  persist(
    (set) => ({
      contracts: [],
      selectedContract: null,

      addContract: (contract) =>
        set((state) => ({ contracts: [contract, ...state.contracts] })),

      updateContract: (id, updates) =>
        set((state) => ({
          contracts: state.contracts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      removeContract: (id) =>
        set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== id),
          selectedContract:
            state.selectedContract?.id === id ? null : state.selectedContract,
        })),

      selectContract: (contract) => set({ selectedContract: contract }),
    }),
    { name: 'cryptogod-contracts' }
  )
);

// ============================================
// NFT Store
// ============================================
interface NFTStore {
  collections: NFTCollection[];
  nfts: NFTConfig[];
  addCollection: (collection: NFTCollection) => void;
  updateCollection: (id: string, updates: Partial<NFTCollection>) => void;
  addNFT: (nft: NFTConfig) => void;
  updateNFT: (id: string, updates: Partial<NFTConfig>) => void;
}

export const useNFTStore = create<NFTStore>()(
  persist(
    (set) => ({
      collections: [],
      nfts: [],

      addCollection: (collection) =>
        set((state) => ({ collections: [collection, ...state.collections] })),

      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      addNFT: (nft) =>
        set((state) => ({ nfts: [nft, ...state.nfts] })),

      updateNFT: (id, updates) =>
        set((state) => ({
          nfts: state.nfts.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
        })),
    }),
    { name: 'cryptogod-nfts' }
  )
);

// ============================================
// Alert Store
// ============================================
interface AlertStore {
  alerts: MonitoringAlert[];
  unreadCount: number;
  addAlert: (alert: MonitoringAlert) => void;
  acknowledgeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertStore>()(
  persist(
    (set) => ({
      alerts: [],
      unreadCount: 0,

      addAlert: (alert) =>
        set((state) => ({
          alerts: [alert, ...state.alerts].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        })),

      acknowledgeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, acknowledged: true } : a
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
    }),
    { name: 'cryptogod-alerts' }
  )
);

// ============================================
// UI Store
// ============================================
interface UIStore {
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  activeNetwork: NetworkName;
  showTestnets: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveNetwork: (network: NetworkName) => void;
  setShowTestnets: (show: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'dark',
      activeNetwork: 'ethereum',
      showTestnets: true,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setActiveNetwork: (network) => set({ activeNetwork: network }),
      setShowTestnets: (show) => set({ showTestnets: show }),
    }),
    { name: 'cryptogod-ui' }
  )
);

// ============================================
// Testing Store
// ============================================
interface TestingStore {
  environments: TestEnvironment[];
  activeEnvironmentId: string | null;
  addEnvironment: (env: TestEnvironment) => void;
  updateEnvironment: (id: string, updates: Partial<TestEnvironment>) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnvironment: (id: string | null) => void;
}

export const useTestingStore = create<TestingStore>()(
  persist(
    (set) => ({
      environments: [],
      activeEnvironmentId: null,

      addEnvironment: (env) =>
        set((state) => ({ environments: [env, ...state.environments] })),

      updateEnvironment: (id, updates) =>
        set((state) => ({
          environments: state.environments.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      removeEnvironment: (id) =>
        set((state) => ({
          environments: state.environments.filter((e) => e.id !== id),
          activeEnvironmentId:
            state.activeEnvironmentId === id ? null : state.activeEnvironmentId,
        })),

      setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),
    }),
    { name: 'cryptogod-testing' }
  )
);

// ============================================
// Analytics Store
// ============================================
interface AnalyticsStore {
  data: AnalyticsData;
  recentActivity: ActivityItem[];
  addActivity: (item: ActivityItem) => void;
  incrementStat: (
    stat: keyof Pick<
      AnalyticsData,
      | 'totalTransactions'
      | 'totalTokensDeployed'
      | 'totalContractsDeployed'
      | 'totalNFTsMinted'
    >
  ) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      data: {
        totalTransactions: 0,
        totalGasSpent: '0',
        totalTokensDeployed: 0,
        totalContractsDeployed: 0,
        totalNFTsMinted: 0,
        networkDistribution: {} as Record<NetworkName, number>,
        recentActivity: [],
        gasTrends: [],
      },
      recentActivity: [],

      addActivity: (item) =>
        set((state) => ({
          recentActivity: [item, ...state.recentActivity].slice(0, 50),
          data: {
            ...state.data,
            recentActivity: [item, ...state.data.recentActivity].slice(0, 50),
          },
        })),

      incrementStat: (stat) =>
        set((state) => ({
          data: {
            ...state.data,
            [stat]: (state.data[stat] as number) + 1,
          },
        })),
    }),
    { name: 'cryptogod-analytics' }
  )
);
