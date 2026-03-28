'use client';

import { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Copy,
  Search,
  Filter,
  Download,
  RefreshCw,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  GitCommit,
  Globe,
  Cpu,
  Eye,
} from 'lucide-react';
import { formatAddress, formatTimeAgo, formatNumber } from '@/lib/utils/formatting';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ============================================
// Types
// ============================================
type DeploymentStatus = 'success' | 'failed' | 'pending' | 'replaced';
type EnvType = 'mainnet' | 'testnet' | 'local';

interface DeploymentRecord {
  id: string;
  name: string;
  type: 'ERC20' | 'ERC721' | 'ERC1155' | 'Multisig' | 'Governance' | 'DeFi' | 'Custom' | 'Proxy' | 'Implementation';
  network: string;
  chainId: number | string;
  environment: EnvType;
  address: string;
  deployer: string;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  gasCostEth: string;
  gasCostUsd: string;
  status: DeploymentStatus;
  verified: boolean;
  isProxy: boolean;
  implementationAddress?: string;
  version: string;
  commitHash?: string;
  branch?: string;
  auditStatus: 'audited' | 'pending-audit' | 'unaudited';
  tags: string[];
  deployedAt: Date;
  deployedBy: string;
  notes?: string;
  abi?: string;
}

// ============================================
// Mock Data — Production-grade registry example
// ============================================
const MOCK_DEPLOYMENTS: DeploymentRecord[] = [
  {
    id: '1',
    name: 'ClientToken ERC20',
    type: 'ERC20',
    network: 'Ethereum',
    chainId: 1,
    environment: 'mainnet',
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    deployer: '0xDeployer123...456',
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc12',
    blockNumber: 19847523,
    gasUsed: '1,247,893',
    gasCostEth: '0.0412 ETH',
    gasCostUsd: '$142.18',
    status: 'success',
    verified: true,
    isProxy: false,
    version: 'v1.2.0',
    commitHash: 'a4f2c3e',
    branch: 'main',
    auditStatus: 'audited',
    tags: ['token', 'client-acme', 'production'],
    deployedAt: new Date(Date.now() - 86400000 * 5),
    deployedBy: 'alice@company.com',
    notes: 'Initial deployment for Acme Corp token',
  },
  {
    id: '2',
    name: 'CryptoApes NFT (Proxy)',
    type: 'Proxy',
    network: 'Polygon',
    chainId: 137,
    environment: 'mainnet',
    address: '0x58807baD0B376efc12F5AD304f9e0eb38e253e4f',
    deployer: '0xDeployer123...456',
    txHash: '0xdef456abc789def456abc789def456abc789def456abc789def456abc789def45',
    blockNumber: 55731290,
    gasUsed: '2,108,421',
    gasCostEth: '0.0089 ETH',
    gasCostUsd: '$8.91',
    status: 'success',
    verified: true,
    isProxy: true,
    implementationAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    version: 'v2.1.0',
    commitHash: 'c7d8e9f',
    branch: 'main',
    auditStatus: 'audited',
    tags: ['nft', 'client-xyz', 'upgradeable', 'production'],
    deployedAt: new Date(Date.now() - 86400000 * 10),
    deployedBy: 'bob@company.com',
  },
  {
    id: '3',
    name: 'YieldVault DeFi',
    type: 'DeFi',
    network: 'BSC',
    chainId: 56,
    environment: 'mainnet',
    address: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    deployer: '0xDeployer789...012',
    txHash: '0x789ghi012jkl789ghi012jkl789ghi012jkl789ghi012jkl789ghi012jkl789g',
    blockNumber: 38921045,
    gasUsed: '890,234',
    gasCostEth: '0.0023 ETH',
    gasCostUsd: '$4.12',
    status: 'success',
    verified: true,
    isProxy: false,
    version: 'v1.0.0',
    commitHash: 'f1e2d3c',
    branch: 'release/v1',
    auditStatus: 'pending-audit',
    tags: ['defi', 'staking', 'client-defi-labs'],
    deployedAt: new Date(Date.now() - 86400000 * 2),
    deployedBy: 'charlie@company.com',
    notes: 'Awaiting Certik audit completion',
  },
  {
    id: '4',
    name: 'DAO Governor',
    type: 'Governance',
    network: 'Ethereum',
    chainId: 1,
    environment: 'mainnet',
    address: '',
    deployer: '0xDeployer123...456',
    txHash: '',
    blockNumber: 0,
    gasUsed: '0',
    gasCostEth: '—',
    gasCostUsd: '—',
    status: 'failed',
    verified: false,
    isProxy: false,
    version: 'v1.0.0',
    commitHash: 'b2c3d4e',
    branch: 'feature/dao',
    auditStatus: 'unaudited',
    tags: ['governance', 'dao'],
    deployedAt: new Date(Date.now() - 3600000),
    deployedBy: 'alice@company.com',
    notes: 'Gas estimation failed — constructor args need review',
  },
  {
    id: '5',
    name: 'MultiSig Wallet 3-of-5',
    type: 'Multisig',
    network: 'Arbitrum',
    chainId: 42161,
    environment: 'mainnet',
    address: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    deployer: '0xDeployer789...012',
    txHash: '0xccc111ddd222eee333fff444aaa555bbb666ccc777ddd888eee999fff000aaa1',
    blockNumber: 201847123,
    gasUsed: '435,127',
    gasCostEth: '0.0001 ETH',
    gasCostUsd: '$0.34',
    status: 'success',
    verified: true,
    isProxy: false,
    version: 'v1.1.2',
    commitHash: 'e5f6g7h',
    branch: 'main',
    auditStatus: 'audited',
    tags: ['multisig', 'treasury', 'internal'],
    deployedAt: new Date(Date.now() - 86400000 * 30),
    deployedBy: 'bob@company.com',
  },
  {
    id: '6',
    name: 'ClientToken ERC20 (Sepolia)',
    type: 'ERC20',
    network: 'Sepolia',
    chainId: 11155111,
    environment: 'testnet',
    address: '0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    deployer: '0xDeployer123...456',
    txHash: '0xddd444eee555fff666aaa777bbb888ccc999ddd000eee111fff222aaa333bbb4',
    blockNumber: 5847123,
    gasUsed: '1,247,893',
    gasCostEth: '0.0412 ETH',
    gasCostUsd: '—',
    status: 'success',
    verified: true,
    isProxy: false,
    version: 'v1.2.0',
    commitHash: 'a4f2c3e',
    branch: 'main',
    auditStatus: 'unaudited',
    tags: ['token', 'client-acme', 'testing'],
    deployedAt: new Date(Date.now() - 86400000 * 6),
    deployedBy: 'alice@company.com',
  },
];

const NETWORK_COLORS: Record<string, string> = {
  Ethereum: 'text-blue-400 bg-blue-400/10',
  Polygon: 'text-purple-400 bg-purple-400/10',
  BSC: 'text-yellow-400 bg-yellow-400/10',
  Arbitrum: 'text-cyan-400 bg-cyan-400/10',
  Optimism: 'text-red-400 bg-red-400/10',
  Avalanche: 'text-orange-400 bg-orange-400/10',
  Sepolia: 'text-blue-300 bg-blue-300/10',
  'BSC Testnet': 'text-yellow-300 bg-yellow-300/10',
};

const TYPE_COLORS: Record<string, string> = {
  ERC20: 'text-green-400 bg-green-400/10',
  ERC721: 'text-pink-400 bg-pink-400/10',
  ERC1155: 'text-pink-300 bg-pink-300/10',
  Proxy: 'text-cyan-400 bg-cyan-400/10',
  Implementation: 'text-cyan-300 bg-cyan-300/10',
  Multisig: 'text-orange-400 bg-orange-400/10',
  Governance: 'text-purple-400 bg-purple-400/10',
  DeFi: 'text-yellow-400 bg-yellow-400/10',
  Custom: 'text-gray-400 bg-gray-400/10',
};

export default function DeploymentsPage() {
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState<'all' | EnvType>('all');
  const [networkFilter, setNetworkFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DeploymentStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'deployedAt' | 'network' | 'name'>('deployedAt');
  const [sortAsc, setSortAsc] = useState(false);

  const networks = ['all', ...Array.from(new Set(MOCK_DEPLOYMENTS.map(d => d.network)))];

  const filtered = MOCK_DEPLOYMENTS
    .filter(d => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q) ||
        d.tags.some(t => t.includes(q)) ||
        d.deployedBy.includes(q) ||
        (d.commitHash || '').includes(q);
      const matchEnv = envFilter === 'all' || d.environment === envFilter;
      const matchNet = networkFilter === 'all' || d.network === networkFilter;
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchEnv && matchNet && matchStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'deployedAt') cmp = a.deployedAt.getTime() - b.deployedAt.getTime();
      if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      if (sortField === 'network') cmp = a.network.localeCompare(b.network);
      return sortAsc ? cmp : -cmp;
    });

  const stats = {
    total: MOCK_DEPLOYMENTS.length,
    mainnet: MOCK_DEPLOYMENTS.filter(d => d.environment === 'mainnet').length,
    success: MOCK_DEPLOYMENTS.filter(d => d.status === 'success').length,
    verified: MOCK_DEPLOYMENTS.filter(d => d.verified).length,
    audited: MOCK_DEPLOYMENTS.filter(d => d.auditStatus === 'audited').length,
    totalGasUsd: '$155.55',
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const getExplorerUrl = (d: DeploymentRecord) => {
    const explorers: Record<number | string, string> = {
      1: 'https://etherscan.io',
      11155111: 'https://sepolia.etherscan.io',
      56: 'https://bscscan.com',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io',
    };
    const base = explorers[d.chainId] || 'https://etherscan.io';
    return d.address ? `${base}/address/${d.address}` : '';
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <GitBranch className="text-cyan-400" size={24} />
            Deployment Registry
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Canonical multi-chain contract address book — every deployment, every environment, full audit trail
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.success('Registry exported to JSON')}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <Download size={14} />
            Export JSON
          </button>
          <button
            onClick={() => toast.success('Registry synced')}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Sync from CI
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Deployments', value: stats.total, color: 'text-foreground' },
          { label: 'Mainnet', value: stats.mainnet, color: 'text-purple-400' },
          { label: 'Successful', value: stats.success, color: 'text-green-400' },
          { label: 'Verified', value: stats.verified, color: 'text-blue-400' },
          { label: 'Audited', value: stats.audited, color: 'text-yellow-400' },
          { label: 'Total Gas Cost', value: stats.totalGasUsd, color: 'text-orange-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="crypto-input pl-8 h-9 text-sm w-full"
              placeholder="Search by name, address, tag, commit hash..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              className="crypto-input h-9 text-sm pr-8"
              value={envFilter}
              onChange={e => setEnvFilter(e.target.value as typeof envFilter)}
            >
              <option value="all">All Envs</option>
              <option value="mainnet">Mainnet</option>
              <option value="testnet">Testnet</option>
              <option value="local">Local</option>
            </select>
            <select
              className="crypto-input h-9 text-sm pr-8"
              value={networkFilter}
              onChange={e => setNetworkFilter(e.target.value)}
            >
              {networks.map(n => (
                <option key={n} value={n}>{n === 'all' ? 'All Networks' : n}</option>
              ))}
            </select>
            <select
              className="crypto-input h-9 text-sm pr-8"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} of {MOCK_DEPLOYMENTS.length} records
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {[
                  { label: 'Contract', field: 'name' as const },
                  { label: 'Network', field: 'network' as const },
                  { label: 'Address', field: null },
                  { label: 'Version / Commit', field: null },
                  { label: 'Environment', field: null },
                  { label: 'Audit', field: null },
                  { label: 'Gas Cost', field: null },
                  { label: 'Deployed', field: 'deployedAt' as const },
                  { label: 'Status', field: null },
                  { label: '', field: null },
                ].map(col => (
                  <th
                    key={col.label}
                    className={`px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${col.field ? 'cursor-pointer hover:text-foreground' : ''}`}
                    onClick={() => col.field && toggleSort(col.field)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.field && sortField === col.field && (
                        sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <>
                  <tr
                    key={d.id}
                    className="border-b border-border/30 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                  >
                    {/* Contract Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_COLORS[d.type] || 'text-gray-400 bg-gray-400/10'}`}
                        >
                          {d.type}
                        </span>
                        <div>
                          <div className="font-semibold text-foreground">{d.name}</div>
                          <div className="text-xs text-muted-foreground">{d.deployedBy}</div>
                        </div>
                        {d.isProxy && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-400 font-medium">
                            PROXY
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Network */}
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${NETWORK_COLORS[d.network] || 'text-gray-400 bg-gray-400/10'}`}>
                        {d.network}
                      </span>
                    </td>

                    {/* Address */}
                    <td className="px-4 py-3">
                      {d.address ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-purple-300">
                            {formatAddress(d.address)}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); copy(d.address, 'Address'); }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy size={11} />
                          </button>
                          {getExplorerUrl(d) && (
                            <a
                              href={getExplorerUrl(d)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-muted-foreground hover:text-blue-400"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                          {d.verified && (
                            <span title="Verified on-chain" className="text-green-400">
                              <Shield size={11} />
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>

                    {/* Version / Commit */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                          {d.version}
                        </span>
                        {d.commitHash && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                            <GitCommit size={10} />
                            {d.commitHash}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Environment */}
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        d.environment === 'mainnet' ? 'bg-red-500/20 text-red-300' :
                        d.environment === 'testnet' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {d.environment}
                      </span>
                    </td>

                    {/* Audit */}
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        d.auditStatus === 'audited' ? 'bg-green-500/20 text-green-300' :
                        d.auditStatus === 'pending-audit' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {d.auditStatus === 'audited' ? '✓ Audited' :
                         d.auditStatus === 'pending-audit' ? '⏳ Pending' : '— Unaudited'}
                      </span>
                    </td>

                    {/* Gas */}
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="text-yellow-400 font-mono">{d.gasCostUsd}</div>
                        <div className="text-muted-foreground">{d.gasCostEth}</div>
                      </div>
                    </td>

                    {/* Deployed */}
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div>{formatTimeAgo(d.deployedAt)}</div>
                        {d.blockNumber > 0 && (
                          <div className="text-muted-foreground">block #{formatNumber(d.blockNumber)}</div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      {d.status === 'success' && <CheckCircle2 size={15} className="text-green-400" />}
                      {d.status === 'failed' && <XCircle size={15} className="text-red-400" />}
                      {d.status === 'pending' && <Clock size={15} className="text-yellow-400" />}
                    </td>

                    {/* Expand */}
                    <td className="px-4 py-3">
                      {expandedId === d.id
                        ? <ChevronUp size={14} className="text-muted-foreground" />
                        : <ChevronDown size={14} className="text-muted-foreground" />
                      }
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedId === d.id && (
                    <tr key={`${d.id}-expanded`} className="bg-white/3 border-b border-border/30">
                      <td colSpan={10} className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Deployment Details */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deployment Details</h4>
                            <div className="space-y-2">
                              {[
                                { label: 'Full Address', value: d.address || '—', mono: true, copy: d.address },
                                { label: 'Tx Hash', value: d.txHash ? formatAddress(d.txHash, 12) : '—', mono: true, copy: d.txHash },
                                { label: 'Deployer', value: d.deployer, mono: true, copy: d.deployer },
                                { label: 'Gas Used', value: d.gasUsed, mono: false },
                                { label: 'Chain ID', value: String(d.chainId), mono: false },
                              ].map(f => (
                                <div key={f.label} className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">{f.label}</span>
                                  <div className="flex items-center gap-1">
                                    <span className={`text-xs ${f.mono ? 'font-mono text-purple-300' : 'text-foreground'}`}>
                                      {f.value}
                                    </span>
                                    {f.copy && (
                                      <button onClick={() => copy(f.copy!, f.label)} className="text-muted-foreground hover:text-foreground">
                                        <Copy size={10} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Source & Proxy Info */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source & Proxy</h4>
                            <div className="space-y-2">
                              {d.branch && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Branch</span>
                                  <span className="text-xs font-mono text-cyan-400">{d.branch}</span>
                                </div>
                              )}
                              {d.commitHash && (
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted-foreground">Commit</span>
                                  <span className="text-xs font-mono text-foreground">{d.commitHash}</span>
                                </div>
                              )}
                              {d.isProxy && d.implementationAddress && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">Implementation</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-mono text-cyan-300">
                                      {formatAddress(d.implementationAddress)}
                                    </span>
                                    <button onClick={() => copy(d.implementationAddress!, 'Implementation')} className="text-muted-foreground hover:text-foreground">
                                      <Copy size={10} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                            {/* Tags */}
                            <div>
                              <div className="text-xs text-muted-foreground mb-2">Tags</div>
                              <div className="flex flex-wrap gap-1">
                                {d.tags.map(tag => (
                                  <span key={tag} className="flex items-center gap-1 text-xs bg-white/5 text-muted-foreground px-2 py-0.5 rounded">
                                    <Tag size={9} />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</h4>
                            {d.notes && (
                              <div className="text-xs text-yellow-300/80 bg-yellow-500/10 border border-yellow-500/20 rounded p-2 flex items-start gap-2">
                                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                                {d.notes}
                              </div>
                            )}
                            <div className="flex flex-col gap-2">
                              {d.address && (
                                <Link href="/contracts" className="btn-secondary text-xs flex items-center gap-2 justify-center">
                                  <Cpu size={13} />
                                  Open in Contract Interaction
                                </Link>
                              )}
                              {getExplorerUrl(d) && (
                                <a
                                  href={getExplorerUrl(d)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-secondary text-xs flex items-center gap-2 justify-center"
                                >
                                  <Globe size={13} />
                                  View on Explorer
                                </a>
                              )}
                              <button
                                onClick={() => toast.success('Verification triggered')}
                                className="btn-secondary text-xs flex items-center gap-2 justify-center"
                              >
                                <Shield size={13} />
                                {d.verified ? 'Re-verify Contract' : 'Verify Contract'}
                              </button>
                              <button
                                onClick={() => toast.success('ABI copied to clipboard')}
                                className="btn-secondary text-xs flex items-center gap-2 justify-center"
                              >
                                <Eye size={13} />
                                Export ABI
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Layers size={40} className="mx-auto mb-3 opacity-30" />
            <p>No deployments match your filters</p>
          </div>
        )}
      </div>

      {/* CI/CD Integration Card */}
      <div className="glass-card p-5 border border-cyan-500/20">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <GitBranch size={20} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">CI/CD Auto-Registration</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Automatically register deployments from your GitHub Actions / Foundry scripts via the API endpoint below.
              Deployments pushed from CI include the commit hash, branch, and deployer for full traceability.
            </p>
            <div className="bg-black/30 rounded p-3 font-mono text-xs text-green-400 border border-border/50">
              <div className="text-muted-foreground mb-1"># In your Foundry deploy script or GitHub Action:</div>
              <div>POST https://cryptogod.internal/api/deployments</div>
              <div className="text-muted-foreground mt-1">{'{'} network, address, txHash, abi, version, commitHash {'}'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
