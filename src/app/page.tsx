'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  Code2,
  FlaskConical,
  Server,
  Image,
  BookOpen,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Layers,
  Globe,
  BarChart3,
} from 'lucide-react';
import { useWalletStore, useAnalyticsStore, useTransactionStore, useAlertStore } from '@/store';
import { formatAddress, formatTimeAgo, formatNumber } from '@/lib/utils/formatting';
import { NETWORKS } from '@/lib/constants/networks';

// ============================================
// Mock data for initial demo
// ============================================
const MOCK_STATS = {
  totalTxs: 1247,
  totalTokens: 23,
  totalContracts: 47,
  totalNFTs: 892,
  gasSpent: '2.847 ETH',
  networksUsed: 8,
};

const MOCK_RECENT_ACTIVITY = [
  { id: '1', type: 'token-deploy', label: 'ERC20 Token Deployed', network: 'ethereum', hash: '0xabc123...def456', time: new Date(Date.now() - 120000), status: 'confirmed' },
  { id: '2', type: 'nft-mint', label: 'NFT Collection: CryptoPunks v2', network: 'polygon', hash: '0xdef789...abc012', time: new Date(Date.now() - 300000), status: 'confirmed' },
  { id: '3', type: 'contract-deploy', label: 'ERC721 Contract', network: 'bsc', hash: '0x123abc...789def', time: new Date(Date.now() - 600000), status: 'pending' },
  { id: '4', type: 'transfer', label: 'Token Transfer: 50,000 USDT', network: 'ethereum', hash: '0x456def...321abc', time: new Date(Date.now() - 900000), status: 'confirmed' },
  { id: '5', type: 'test', label: 'Reentrancy Test Suite', network: 'sepolia', hash: null, time: new Date(Date.now() - 1800000), status: 'passed' },
];

const MOCK_GAS_PRICES: Record<string, { gwei: number; trend: 'up' | 'down' }> = {
  Ethereum: { gwei: 24.5, trend: 'down' },
  BSC: { gwei: 3.0, trend: 'up' },
  Polygon: { gwei: 45.2, trend: 'down' },
  Arbitrum: { gwei: 0.1, trend: 'down' },
  Optimism: { gwei: 0.05, trend: 'up' },
};

const QUICK_ACTIONS = [
  { label: 'Create Token', description: 'ERC20, BEP20, SPL, TRC20', href: '/tokens', icon: <Coins size={20} />, color: '#7C3AED' },
  { label: 'Deploy Contract', description: 'ERC721, ERC1155, Custom', href: '/contracts', icon: <Code2 size={20} />, color: '#2563EB' },
  { label: 'Mint NFT', description: 'Single or batch minting', href: '/nft', icon: <Image size={20} />, color: '#EC4899' },
  { label: 'Run Tests', description: 'Testnet environments', href: '/testing', icon: <FlaskConical size={20} />, color: '#10B981' },
  { label: 'Audit Contract', description: 'Security analysis', href: '/security', icon: <ShieldAlert size={20} />, color: '#F59E0B' },
  { label: 'Learn Web3', description: 'Tutorials & guides', href: '/education', icon: <BookOpen size={20} />, color: '#06B6D4' },
];

const MODULE_CARDS = [
  {
    title: 'Token Manager',
    description: 'Deploy ERC20, BEP20, TRC20, SPL tokens with advanced tokenomics',
    href: '/tokens',
    icon: <Coins size={24} />,
    gradient: 'from-purple-600 to-blue-600',
    stats: { label: 'Tokens Deployed', value: '23' },
    features: ['Multi-chain support', 'Tax mechanics', 'Auto-liquidity', 'Reflection'],
  },
  {
    title: 'Contract Deployer',
    description: 'Deploy audited smart contracts with one click across 8+ networks',
    href: '/contracts',
    icon: <Code2 size={24} />,
    gradient: 'from-blue-600 to-cyan-600',
    stats: { label: 'Contracts Live', value: '47' },
    features: ['OpenZeppelin templates', 'Auto-verification', 'ABI interaction', 'Gas estimation'],
  },
  {
    title: 'NFT Studio',
    description: 'Create, deploy, and manage NFT collections with marketplace integrations',
    href: '/nft',
    icon: <Image size={24} />,
    gradient: 'from-pink-600 to-purple-600',
    stats: { label: 'NFTs Minted', value: '892' },
    features: ['Batch minting', 'Reveal mechanism', 'Royalties (EIP-2981)', 'IPFS upload'],
  },
  {
    title: 'Test Environment',
    description: 'Isolated testnet environments with faucets and debugging tools',
    href: '/testing',
    icon: <FlaskConical size={24} />,
    gradient: 'from-green-600 to-teal-600',
    stats: { label: 'Tests Passed', value: '156' },
    features: ['Hardhat fork', 'Step debugging', 'Gas profiling', 'Auto-testing'],
  },
  {
    title: 'Security Hub',
    description: 'Attack vector education, scam detection, and contract auditing',
    href: '/security',
    icon: <ShieldAlert size={24} />,
    gradient: 'from-red-600 to-orange-600',
    stats: { label: 'Vulnerabilities', value: '24 patterns' },
    features: ['Reentrancy guard', 'Flash loan analysis', 'Scam detection', 'Audit checklist'],
  },
  {
    title: 'Learn Web3',
    description: 'Interactive tutorials, code templates, and step-by-step guides',
    href: '/education',
    icon: <BookOpen size={24} />,
    gradient: 'from-cyan-600 to-blue-600',
    stats: { label: 'Tutorials', value: '48' },
    features: ['Live code editor', 'DeFi protocols', 'Token standards', 'Best practices'],
  },
];

function StatusIcon({ status }: { status: string }) {
  if (status === 'confirmed' || status === 'passed') return <CheckCircle2 size={14} className="text-green-400" />;
  if (status === 'pending' || status === 'running') return <Clock size={14} className="text-yellow-400 animate-pulse" />;
  if (status === 'failed') return <XCircle size={14} className="text-red-400" />;
  return <AlertCircle size={14} className="text-muted-foreground" />;
}

function ActivityTypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    'token-deploy': <Coins size={14} className="text-purple-400" />,
    'nft-mint': <Image size={14} className="text-pink-400" />,
    'contract-deploy': <Code2 size={14} className="text-blue-400" />,
    'transfer': <ArrowUpRight size={14} className="text-green-400" />,
    'test': <FlaskConical size={14} className="text-cyan-400" />,
  };
  return icons[type] || <Activity size={14} className="text-muted-foreground" />;
}

export default function DashboardPage() {
  const { connected, address } = useWalletStore();
  const { data: analytics } = useAnalyticsStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Web3 Command Center</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All-in-one blockchain development, deployment, and management platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="btn-secondary h-9 text-xs"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          {!connected && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-yellow-400 border border-yellow-500/30 bg-yellow-500/10">
              <AlertCircle size={14} />
              Connect wallet to unlock all features
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Transactions', value: formatNumber(MOCK_STATS.totalTxs), icon: <Activity size={16} />, color: 'text-purple-400', change: '+12%' },
          { label: 'Tokens Deployed', value: MOCK_STATS.totalTokens, icon: <Coins size={16} />, color: 'text-blue-400', change: '+3' },
          { label: 'Contracts Live', value: MOCK_STATS.totalContracts, icon: <Code2 size={16} />, color: 'text-cyan-400', change: '+7' },
          { label: 'NFTs Minted', value: formatNumber(MOCK_STATS.totalNFTs), icon: <Image size={16} />, color: 'text-pink-400', change: '+124' },
          { label: 'Gas Spent', value: MOCK_STATS.gasSpent, icon: <Zap size={16} />, color: 'text-yellow-400', change: null },
          { label: 'Networks Used', value: MOCK_STATS.networksUsed, icon: <Globe size={16} />, color: 'text-green-400', change: null },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
              {stat.icon}
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change && (
              <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp size={10} />
                {stat.change} this week
              </div>
            )}
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
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
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

        {/* Recent Activity */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Activity size={16} className="text-blue-400" />
              Recent Activity
            </h2>
            <Link href="/activity" className="text-xs text-purple-400 hover:text-purple-300">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_RECENT_ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <ActivityTypeIcon type={item.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{item.label}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground capitalize">{item.network}</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">{formatTimeAgo(item.time)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <StatusIcon status={item.status} />
                  {item.hash && (
                    <ExternalLink size={11} className="text-muted-foreground hover:text-purple-400 cursor-pointer" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gas Prices */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" />
              Live Gas Prices
            </h2>
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-indicator" />
              Live
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(MOCK_GAS_PRICES).map(([network, data]) => (
              <div key={network} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{network}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{data.gwei} Gwei</span>
                  {data.trend === 'up' ? (
                    <TrendingUp size={12} className="text-red-400" />
                  ) : (
                    <TrendingDown size={12} className="text-green-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link href="/gas" className="btn-secondary w-full mt-4 text-xs h-8 justify-center">
            Gas Optimizer
          </Link>
        </div>
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          Platform Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MODULE_CARDS.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="glass-card p-5 group hover:border-white/10 transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${module.gradient} text-white group-hover:scale-110 transition-transform duration-300`}
                >
                  {module.icon}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{module.stats.label}</div>
                  <div className="text-lg font-bold">{module.stats.value}</div>
                </div>
              </div>

              <h3 className="font-bold text-base mb-1 group-hover:text-purple-300 transition-colors">
                {module.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {module.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {module.features.map((feature) => (
                  <span key={feature} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/5">
                    {feature}
                  </span>
                ))}
              </div>
            </Link>
          ))}
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
        <p className="text-sm text-muted-foreground mb-4">
          Advanced DeFi tooling, DApp builder, DEX platform, and DAO governance system.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'DApp Builder', icon: <Globe size={16} />, desc: 'Visual DApp creator with frontend integration' },
            { label: 'DEX Platform', icon: <BarChart3 size={16} />, desc: 'AMM-based decentralized exchange' },
            { label: 'DeFi Protocols', icon: <TrendingUp size={16} />, desc: 'Lending, borrowing, yield farming' },
            { label: 'DAO Governance', icon: <Layers size={16} />, desc: 'Proposal, voting, and execution systems' },
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
