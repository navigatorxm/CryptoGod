'use client';

import { useState } from 'react';
import {
  Coins,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Flame,
  Pause,
  Play,
  RefreshCw,
  Copy,
  ExternalLink,
  Settings,
  TrendingUp,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { TokenConfig, NetworkName, TokenStandard } from '@/types';
import { useTokenStore, useWalletStore } from '@/store';
import { formatAddress, formatNumber, formatTimeAgo } from '@/lib/utils/formatting';
import { NETWORKS } from '@/lib/constants/networks';
import { ERC20_TEMPLATE } from '@/lib/constants/abis';
import TokenCreationForm from '@/components/tokens/TokenCreationForm';
import TokenFunctions from '@/components/tokens/TokenFunctions';
import TransactionMonitor from '@/components/tokens/TransactionMonitor';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const STANDARD_COLORS: Record<string, string> = {
  ERC20: '#627EEA',
  BEP20: '#F3BA2F',
  TRC20: '#FF0013',
  SPL: '#9945FF',
  ERC777: '#06B6D4',
};

const MOCK_TOKENS: TokenConfig[] = [
  {
    id: '1',
    name: 'DemoToken',
    symbol: 'DEMO',
    decimals: 18,
    totalSupply: '1000000000',
    standard: 'ERC20',
    network: 'ethereum',
    chainId: 1,
    features: { mintable: true, burnable: true, pausable: true, taxable: false, antiWhale: false, blacklist: false, maxWallet: false, reflection: false, autoLiquidity: false, deflation: false },
    createdAt: new Date(Date.now() - 86400000 * 3),
    deployedAt: new Date(Date.now() - 86400000 * 3),
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    deploymentTxHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    owner: '0xUserAddress1234567890',
  },
  {
    id: '2',
    name: 'BNB Reward Token',
    symbol: 'BRT',
    decimals: 18,
    totalSupply: '500000000',
    standard: 'BEP20',
    network: 'bsc',
    chainId: 56,
    features: { mintable: false, burnable: true, pausable: true, taxable: true, antiWhale: true, blacklist: true, maxWallet: true, reflection: true, autoLiquidity: true, deflation: false },
    taxConfig: { buyTax: 5, sellTax: 8, transferTax: 2, liquidityFee: 2, marketingFee: 3, burnFee: 1, reflectionFee: 2, maxWalletPercent: 2, maxTransactionPercent: 0.5 },
    createdAt: new Date(Date.now() - 86400000 * 7),
    deployedAt: new Date(Date.now() - 86400000 * 7),
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    deploymentTxHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01',
    owner: '0xUserAddress1234567890',
  },
];

type TabType = 'tokens' | 'create' | 'transactions';

export default function TokensPage() {
  const [activeTab, setActiveTab] = useState<TabType>('tokens');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStandard, setFilterStandard] = useState<TokenStandard | 'ALL'>('ALL');
  const [filterNetwork, setFilterNetwork] = useState<NetworkName | 'ALL'>('ALL');
  const [selectedToken, setSelectedToken] = useState<TokenConfig | null>(null);
  const [showFunctions, setShowFunctions] = useState(false);

  const { tokens: storeTokens, addToken } = useTokenStore();
  const { connected } = useWalletStore();

  const allTokens = [...MOCK_TOKENS, ...storeTokens];

  const filteredTokens = allTokens.filter((token) => {
    const matchSearch =
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.contractAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStandard = filterStandard === 'ALL' || token.standard === filterStandard;
    const matchNetwork = filterNetwork === 'ALL' || token.network === filterNetwork;
    return matchSearch && matchStandard && matchNetwork;
  });

  const handleTokenCreated = (token: TokenConfig) => {
    addToken(token);
    setActiveTab('tokens');
    toast.success(`Token ${token.symbol} created successfully!`);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied!');
  };

  const getNetworkInfo = (network: string) => NETWORKS[network];

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Coins className="text-purple-400" size={24} />
            Token Manager
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create and manage tokens across ERC20, BEP20, TRC20, SPL, and Polygon
          </p>
        </div>
        <button
          onClick={() => setActiveTab('create')}
          className="btn-primary"
        >
          <Plus size={16} />
          Create Token
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Tokens', value: allTokens.length, icon: <Coins size={16} />, color: 'text-purple-400' },
          { label: 'EVM Tokens', value: allTokens.filter(t => ['ERC20', 'BEP20', 'ERC777'].includes(t.standard)).length, icon: <TrendingUp size={16} />, color: 'text-blue-400' },
          { label: 'Deployed', value: allTokens.filter(t => t.contractAddress).length, icon: <CheckCircle2 size={16} />, color: 'text-green-400' },
          { label: 'With Taxes', value: allTokens.filter(t => t.features.taxable).length, icon: <Zap size={16} />, color: 'text-yellow-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
              {stat.icon}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['tokens', 'create', 'transactions'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button capitalize ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'tokens' ? 'My Tokens' : tab === 'create' ? '+ Create Token' : 'Transactions'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'tokens' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tokens, addresses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="crypto-input pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={filterStandard}
              onChange={(e) => setFilterStandard(e.target.value as TokenStandard | 'ALL')}
              className="crypto-input h-9 text-sm w-32"
            >
              <option value="ALL">All Standards</option>
              <option value="ERC20">ERC20</option>
              <option value="BEP20">BEP20</option>
              <option value="TRC20">TRC20</option>
              <option value="SPL">SPL</option>
              <option value="ERC777">ERC777</option>
            </select>
            <select
              value={filterNetwork}
              onChange={(e) => setFilterNetwork(e.target.value as NetworkName | 'ALL')}
              className="crypto-input h-9 text-sm w-36"
            >
              <option value="ALL">All Networks</option>
              {Object.values(NETWORKS).map(n => (
                <option key={n.shortName} value={n.shortName}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* Token List */}
          {filteredTokens.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Coins size={40} className="mx-auto text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground">No tokens found. Create your first token!</p>
              <button onClick={() => setActiveTab('create')} className="btn-primary mt-4">
                <Plus size={14} />
                Create Token
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTokens.map((token) => {
                const network = getNetworkInfo(token.network);
                const isSelected = selectedToken?.id === token.id;
                return (
                  <div key={token.id} className="glass-card overflow-hidden">
                    {/* Token Header */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => setSelectedToken(isSelected ? null : token)}
                    >
                      {/* Token Icon */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${STANDARD_COLORS[token.standard] || '#7C3AED'}, #2563EB)` }}
                      >
                        {token.symbol.slice(0, 2)}
                      </div>

                      {/* Token Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{token.name}</span>
                          <span className="text-xs text-muted-foreground">({token.symbol})</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: `${STANDARD_COLORS[token.standard]}25`, color: STANDARD_COLORS[token.standard] }}
                          >
                            {token.standard}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                          {token.contractAddress && (
                            <>
                              <span className="font-mono">{formatAddress(token.contractAddress)}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCopyAddress(token.contractAddress!); }}
                                className="hover:text-purple-400 transition-colors"
                              >
                                <Copy size={11} />
                              </button>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {network && <span style={{ color: network.color }}>{network.icon}</span>}
                            {network?.name}
                          </span>
                          <span>•</span>
                          <span>{formatTimeAgo(token.createdAt)}</span>
                        </div>
                      </div>

                      {/* Token Stats */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Supply</div>
                          <div className="font-mono text-sm font-semibold">
                            {formatNumber(parseFloat(token.totalSupply))} {token.symbol}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Decimals</div>
                          <div className="font-semibold text-sm">{token.decimals}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Status</div>
                          <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                            <CheckCircle2 size={11} />
                            Deployed
                          </div>
                        </div>
                      </div>

                      {/* Feature Badges */}
                      <div className="hidden lg:flex items-center gap-1">
                        {token.features.mintable && <span className="badge badge-blue text-[9px]">MINT</span>}
                        {token.features.burnable && <span className="badge badge-red text-[9px]">BURN</span>}
                        {token.features.pausable && <span className="badge badge-yellow text-[9px]">PAUSE</span>}
                        {token.features.taxable && <span className="badge badge-purple text-[9px]">TAX</span>}
                        {token.features.reflection && <span className="badge badge-cyan text-[9px]">REFLECT</span>}
                      </div>

                      {/* Expand toggle */}
                      <div className="text-muted-foreground">
                        {isSelected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expanded Token Functions */}
                    {isSelected && (
                      <div className="border-t border-white/5">
                        <TokenFunctions token={token} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <TokenCreationForm onCreated={handleTokenCreated} onCancel={() => setActiveTab('tokens')} />
      )}

      {activeTab === 'transactions' && (
        <TransactionMonitor />
      )}
    </div>
  );
}
