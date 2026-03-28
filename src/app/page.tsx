'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Coins,
  Code2,
  FlaskConical,
  Image,
  BookOpen,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  ArrowUpRight,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Layers,
  Globe,
  BarChart3,
} from 'lucide-react';
import {
  useWalletStore,
  useAnalyticsStore,
  useTransactionStore,
  useTokenStore,
  useContractStore,
  useNFTStore,
} from '@/store';
import { formatTimeAgo, formatNumber } from '@/lib/utils/formatting';
import { NETWORKS } from '@/lib/constants/networks';

// ── Gas price fetcher (JSON-RPC, no CORS issues) ──────────────────────────────
async function fetchGwei(rpcUrl: string): Promise<number> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }),
    signal: AbortSignal.timeout(5000),
  });
  const json = await res.json();
  return parseInt(json.result, 16) / 1e9;
}

const GAS_SOURCES = [
  { name: 'Ethereum', rpc: 'https://eth.llamarpc.com',              fallback: 24.5 },
  { name: 'BSC',      rpc: 'https://bsc-dataseed1.binance.org',     fallback: 3.0  },
  { name: 'Polygon',  rpc: 'https://polygon-rpc.com',               fallback: 45.2 },
  { name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc',          fallback: 0.1  },
  { name: 'Optimism', rpc: 'https://mainnet.optimism.io',           fallback: 0.05 },
];

interface GasEntry { gwei: number; prev: number; }

const QUICK_ACTIONS = [
  { label: 'Create Token',    description: 'ERC20, BEP20, SPL, TRC20',  href: '/tokens',    icon: <Coins size={20} />,     color: '#7C3AED' },
  { label: 'Deploy Contract', description: 'ERC721, ERC1155, Custom',   href: '/contracts', icon: <Code2 size={20} />,     color: '#2563EB' },
  { label: 'Mint NFT',        description: 'Single or batch minting',   href: '/nft',       icon: <Image size={20} />,     color: '#EC4899' },
  { label: 'Run Tests',       description: 'Testnet environments',      href: '/testing',   icon: <FlaskConical size={20} />, color: '#10B981' },
  { label: 'Audit Contract',  description: 'Security analysis',         href: '/security',  icon: <ShieldAlert size={20} />, color: '#F59E0B' },
  { label: 'Learn Web3',      description: 'Tutorials & guides',        href: '/education', icon: <BookOpen size={20} />,  color: '#06B6D4' },
];

const MODULE_CARDS = [
  { title: 'Token Manager',     description: 'Deploy ERC20, BEP20, TRC20, SPL tokens with advanced tokenomics', href: '/tokens',    icon: <Coins size={24} />,      gradient: 'from-purple-600 to-blue-600',  statsKey: 'tokens',    features: ['Multi-chain support','Tax mechanics','Auto-liquidity','Reflection'] },
  { title: 'Contract Deployer', description: 'Deploy audited smart contracts with one click across 8+ networks', href: '/contracts', icon: <Code2 size={24} />,      gradient: 'from-blue-600 to-cyan-600',    statsKey: 'contracts', features: ['OpenZeppelin templates','Auto-verification','ABI interaction','Gas estimation'] },
  { title: 'NFT Studio',        description: 'Create, deploy, and manage NFT collections with marketplace integrations', href: '/nft', icon: <Image size={24} />,    gradient: 'from-pink-600 to-purple-600',  statsKey: 'nfts',      features: ['Batch minting','Reveal mechanism','Royalties (EIP-2981)','IPFS upload'] },
  { title: 'Test Environment',  description: 'Isolated testnet environments with faucets and debugging tools', href: '/testing',   icon: <FlaskConical size={24} />, gradient: 'from-green-600 to-teal-600',   statsKey: 'tests',     features: ['Hardhat fork','Step debugging','Gas profiling','Auto-testing'] },
  { title: 'Security Hub',      description: 'Attack vector education, scam detection, and contract auditing', href: '/security',  icon: <ShieldAlert size={24} />, gradient: 'from-red-600 to-orange-600',   statsKey: 'security',  features: ['Reentrancy guard','Flash loan analysis','Scam detection','Audit checklist'] },
  { title: 'Learn Web3',        description: 'Interactive tutorials, code templates, and step-by-step guides', href: '/education', icon: <BookOpen size={24} />,    gradient: 'from-cyan-600 to-blue-600',    statsKey: 'tutorials', features: ['Live code editor','DeFi protocols','Token standards','Best practices'] },
];

function ActivityTypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    'token-deploy':    <Coins size={14} className="text-purple-400" />,
    'nft-mint':        <Image size={14} className="text-pink-400" />,
    'contract-deploy': <Code2 size={14} className="text-blue-400" />,
    'transfer':        <ArrowUpRight size={14} className="text-green-400" />,
    'test':            <FlaskConical size={14} className="text-cyan-400" />,
  };
  return <>{icons[type] || <Activity size={14} className="text-muted-foreground" />}</>;
}

export default function DashboardPage() {
  const { connected, address, chainId, balance } = useWalletStore();
  const { data: analytics, recentActivity }      = useAnalyticsStore();
  const { transactions }                          = useTransactionStore();
  const { tokens }                                = useTokenStore();
  const { contracts }                             = useContractStore();
  const { collections }                           = useNFTStore();

  const [gasData, setGasData]   = useState<Record<string, GasEntry>>({});
  const [refreshing, setRefreshing] = useState(false);
  const prevGas = useRef<Record<string, number>>({});

  const currentNetwork = Object.values(NETWORKS).find(n => n.id === chainId);

  // ── Live gas prices ──────────────────────────────────────────────────────
  const loadGas = async () => {
    const entries = await Promise.all(
      GAS_SOURCES.map(async (src) => {
        try {
          const gwei = parseFloat((await fetchGwei(src.rpc)).toFixed(2));
          return [src.name, { gwei, prev: prevGas.current[src.name] ?? gwei }] as const;
        } catch {
          const fallback = gasData[src.name]?.gwei ?? src.fallback;
          return [src.name, { gwei: fallback, prev: prevGas.current[src.name] ?? fallback }] as const;
        }
      })
    );
    const next = Object.fromEntries(entries);
    prevGas.current = Object.fromEntries(entries.map(([k, v]) => [k, v.gwei]));
    setGasData(next);
  };

  useEffect(() => {
    loadGas();
    const id = setInterval(loadGas, 30_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGas();
    setRefreshing(false);
  };

  // ── Real metrics ─────────────────────────────────────────────────────────
  const totalTokens    = tokens.length    || analytics.totalTokensDeployed;
  const totalContracts = contracts.length || analytics.totalContractsDeployed;
  const totalNFTs      = collections.reduce((a, c) => a + c.totalMinted, 0) || analytics.totalNFTsMinted;
  const totalTxs       = transactions.length || analytics.totalTransactions;
  const networksUsed   = new Set([
    ...tokens.map(t => t.network),
    ...contracts.map(c => c.network),
  ]).size || (connected ? 1 : 0);

  const walletBalance = balance
    ? `${parseFloat(balance).toFixed(4)} ${currentNetwork?.symbol || 'ETH'}`
    : '—';

  // ── Module card stat values ───────────────────────────────────────────────
  const moduleStats: Record<string, { label: string; value: string | number }> = {
    tokens:    { label: 'Tokens Deployed',  value: totalTokens    },
    contracts: { label: 'Contracts Live',   value: totalContracts },
    nfts:      { label: 'NFTs Minted',      value: totalNFTs      },
    tests:     { label: 'Tests Passed',     value: analytics.totalTransactions > 0 ? '—' : '0' },
    security:  { label: 'Vulnerabilities',  value: '24 patterns'  },
    tutorials: { label: 'Tutorials',        value: '48'           },
  };

  // ── Activity feed: use real store data, fall back to empty state ──────────
  const activityFeed = recentActivity.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">Web3 Command Center</h1>
          <p className="text-muted-foreground mt-1 text-sm hidden sm:block">
            All-in-one blockchain development, deployment, and management platform
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleRefresh} className="btn-secondary h-9 text-xs">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {!connected && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm text-yellow-400 border border-yellow-500/30 bg-yellow-500/10">
              <AlertCircle size={14} />
              <span className="hidden sm:inline">Connect wallet to unlock all features</span>
              <span className="sm:hidden">Connect wallet</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics — real data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Transactions', value: totalTxs > 0 ? formatNumber(totalTxs) : '0',           icon: <Activity size={16} />, color: 'text-purple-400' },
          { label: 'Tokens Deployed',    value: totalTokens,                                            icon: <Coins size={16} />,    color: 'text-blue-400'   },
          { label: 'Contracts Live',     value: totalContracts,                                         icon: <Code2 size={16} />,    color: 'text-cyan-400'   },
          { label: 'NFTs Minted',        value: totalNFTs > 0 ? formatNumber(totalNFTs) : '0',          icon: <Image size={16} />,    color: 'text-pink-400'   },
          { label: 'Wallet Balance',     value: walletBalance,                                          icon: <Zap size={16} />,      color: 'text-yellow-400' },
          { label: 'Networks Used',      value: networksUsed,                                           icon: <Globe size={16} />,    color: 'text-green-400'  },
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4 text-sm flex items-center gap-2">
            <Zap size={16} className="text-purple-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col gap-2 p-3 rounded-lg transition-all duration-200 group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ background: `${action.color}25`, color: action.color }}
                >
                  {action.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold">{action.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{action.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity — real store data */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              Recent Activity
            </h2>
            <Link href="/activity" className="text-xs text-purple-400 hover:text-purple-300">View all</Link>
          </div>
          {activityFeed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-xs text-muted-foreground">No activity yet.</p>
              <p className="text-[10px] text-muted-foreground mt-1">Deploy a token or contract to see activity here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityFeed.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <ActivityTypeIcon type={item.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{item.description}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground capitalize">{item.network}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{formatTimeAgo(new Date(item.timestamp))}</span>
                    </div>
                  </div>
                  {item.txHash && (
                    <ExternalLink size={11} className="text-muted-foreground hover:text-purple-400 cursor-pointer flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Gas Prices */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              Live Gas Prices
            </h2>
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-indicator" />
              Live · 30s
            </span>
          </div>
          <div className="space-y-3">
            {GAS_SOURCES.map(({ name, fallback }) => {
              const entry = gasData[name];
              const gwei  = entry?.gwei ?? fallback;
              const trend = entry ? (entry.gwei > entry.prev ? 'up' : 'down') : 'down';
              return (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{gwei} Gwei</span>
                    {trend === 'up'
                      ? <TrendingUp size={12} className="text-red-400" />
                      : <TrendingDown size={12} className="text-green-400" />}
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/gas" className="btn-secondary w-full mt-4 text-xs h-8 justify-center">
            Gas Optimizer
          </Link>
        </div>
      </div>

      {/* Platform Module Cards */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          Platform Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MODULE_CARDS.map((module) => {
            const stat = moduleStats[module.statsKey];
            return (
              <Link
                key={module.href}
                href={module.href}
                className="glass-card p-5 group hover:border-white/10 transition-all duration-300"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${module.gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
                    {module.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className="text-lg font-bold">{stat.value}</div>
                  </div>
                </div>
                <h3 className="font-bold text-base mb-1 group-hover:text-purple-300 transition-colors">{module.title}</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{module.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {module.features.map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/5">{f}</span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Phase 2 Preview */}
      <div className="glass-card p-5 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Version 2.0 — Roadmap
          </span>
        </div>
        <h2 className="text-lg font-bold mb-2">Phase 2 Features Coming Soon</h2>
        <p className="text-sm text-muted-foreground mb-4">Advanced DeFi tooling, DApp builder, DEX platform, and DAO governance system.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'DApp Builder',    icon: <Globe size={16} />,      desc: 'Visual DApp creator with frontend integration' },
            { label: 'DEX Platform',    icon: <BarChart3 size={16} />,  desc: 'AMM-based decentralized exchange' },
            { label: 'DeFi Protocols',  icon: <TrendingUp size={16} />, desc: 'Lending, borrowing, yield farming' },
            { label: 'DAO Governance',  icon: <Layers size={16} />,     desc: 'Proposal, voting, and execution systems' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 opacity-75">
              <div className="flex items-center gap-2 mb-1.5 text-purple-400">
                {item.icon}
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
