'use client';

import { useState } from 'react';
import {
  Activity,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  ArrowUpRight,
  Coins,
  Code2,
  Image,
  Zap,
} from 'lucide-react';
import { Transaction, NetworkName } from '@/types';
import { formatAddress, formatTimeAgo, formatGwei, getExplorerTxUrl } from '@/lib/utils/formatting';
import { useTransactionStore } from '@/store';

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    hash: '0xabc1234567890def1234567890abcdef1234567890abcdef1234567890abcdef12',
    from: '0xUser1234567890abcdef1234567890abcdef1234',
    to: '0xContractAddress1234567890abcdef12345678',
    value: '0',
    gasUsed: '85000',
    gasPrice: '25000000000',
    gasFee: '0.002125',
    blockNumber: 19234567,
    status: 'confirmed',
    network: 'ethereum',
    method: 'mint()',
    timestamp: new Date(Date.now() - 120000),
    confirmations: 12,
  },
  {
    id: '2',
    hash: '0xdef4567890abc1234567890def1234567890abcdef1234567890abcdef12345678',
    from: '0xUser1234567890abcdef1234567890abcdef1234',
    to: '0xContractAddress2234567890abcdef12345679',
    value: '0',
    gasUsed: '65000',
    gasPrice: '30000000000',
    gasFee: '0.00195',
    blockNumber: 19234534,
    status: 'confirmed',
    network: 'ethereum',
    method: 'transfer()',
    timestamp: new Date(Date.now() - 300000),
    confirmations: 24,
  },
  {
    id: '3',
    hash: '0x123456789abcdef01234567890abcdef01234567890abcdef01234567890abcdef',
    from: '0xUser1234567890abcdef1234567890abcdef1234',
    to: '',
    value: '0',
    gasUsed: '1234567',
    gasPrice: '5000000000',
    gasFee: '0.006172',
    blockNumber: 35234567,
    status: 'pending',
    network: 'bsc',
    method: 'deploy',
    timestamp: new Date(Date.now() - 45000),
    confirmations: 2,
  },
  {
    id: '4',
    hash: '0x456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012345',
    from: '0xUser1234567890abcdef1234567890abcdef1234',
    to: '0xContractAddress3234567890abcdef12345670',
    value: '0.05',
    gasUsed: '45000',
    gasPrice: '25000000000',
    gasFee: '0.001125',
    blockNumber: 19234100,
    status: 'failed',
    network: 'ethereum',
    method: 'approve()',
    timestamp: new Date(Date.now() - 600000),
    confirmations: 0,
    error: 'Out of gas',
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') return (
    <span className="flex items-center gap-1 text-xs text-green-400">
      <CheckCircle2 size={12} />
      Confirmed
    </span>
  );
  if (status === 'pending') return (
    <span className="flex items-center gap-1 text-xs text-yellow-400">
      <Clock size={12} className="animate-pulse" />
      Pending
    </span>
  );
  if (status === 'failed') return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <XCircle size={12} />
      Failed
    </span>
  );
  return null;
}

function MethodIcon({ method }: { method?: string }) {
  if (!method) return <Activity size={14} className="text-muted-foreground" />;
  if (method.includes('mint')) return <Coins size={14} className="text-green-400" />;
  if (method.includes('deploy')) return <Code2 size={14} className="text-blue-400" />;
  if (method.includes('transfer')) return <ArrowUpRight size={14} className="text-purple-400" />;
  if (method.includes('burn')) return <Zap size={14} className="text-red-400" />;
  if (method.includes('approve')) return <CheckCircle2 size={14} className="text-cyan-400" />;
  return <Activity size={14} className="text-muted-foreground" />;
}

export default function TransactionMonitor() {
  const { transactions: storeTransactions } = useTransactionStore();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterNetwork, setFilterNetwork] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const allTxs = [...MOCK_TRANSACTIONS, ...storeTransactions];

  const filtered = allTxs.filter((tx) => {
    const matchStatus = filterStatus === 'ALL' || tx.status === filterStatus;
    const matchNetwork = filterNetwork === 'ALL' || tx.network === filterNetwork;
    const matchSearch = !searchQuery ||
      tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.method?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchNetwork && matchSearch;
  });

  const stats = {
    total: allTxs.length,
    confirmed: allTxs.filter(t => t.status === 'confirmed').length,
    pending: allTxs.filter(t => t.status === 'pending').length,
    failed: allTxs.filter(t => t.status === 'failed').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-green-400' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Failed', value: stats.failed, color: 'text-red-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search hash, address, method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="crypto-input pl-9 h-8 text-xs"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="crypto-input h-8 text-xs w-32"
        >
          <option value="ALL">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={filterNetwork}
          onChange={(e) => setFilterNetwork(e.target.value)}
          className="crypto-input h-8 text-xs w-36"
        >
          <option value="ALL">All Networks</option>
          <option value="ethereum">Ethereum</option>
          <option value="bsc">BSC</option>
          <option value="polygon">Polygon</option>
          <option value="sepolia">Sepolia</option>
          <option value="bsc-testnet">BSC Testnet</option>
        </select>
        <button className="btn-secondary h-8 text-xs">
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Transaction Table */}
      <div className="glass-card overflow-hidden">
        <table className="crypto-table">
          <thead>
            <tr>
              <th>Method</th>
              <th>Hash</th>
              <th>From</th>
              <th>Block</th>
              <th>Network</th>
              <th>Gas Fee</th>
              <th>Time</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            ) : filtered.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <MethodIcon method={tx.method} />
                    <span className="font-mono text-xs">{tx.method || 'unknown'}</span>
                  </div>
                </td>
                <td>
                  <span className="font-mono text-xs text-purple-300">
                    {formatAddress(tx.hash, 8)}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatAddress(tx.from)}
                  </span>
                </td>
                <td>
                  <span className="font-mono text-xs">
                    {tx.blockNumber?.toLocaleString() || '-'}
                  </span>
                </td>
                <td>
                  <span className="text-xs capitalize">{tx.network}</span>
                </td>
                <td>
                  <span className="font-mono text-xs text-yellow-400">
                    {tx.gasFee ? `${tx.gasFee} ETH` : '-'}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(tx.timestamp)}
                  </span>
                </td>
                <td>
                  <StatusBadge status={tx.status} />
                  {tx.error && (
                    <div className="text-[10px] text-red-400/70 mt-0.5">{tx.error}</div>
                  )}
                </td>
                <td>
                  <a
                    href={getExplorerTxUrl(tx.network, tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink size={13} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
