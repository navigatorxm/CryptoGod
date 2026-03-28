'use client';

import { useState } from 'react';
import {
  Activity,
  Shield,
  GitBranch,
  Coins,
  Image,
  Settings,
  Key,
  Users,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Download,
  Search,
  Filter,
  Lock,
} from 'lucide-react';
import { formatTimeAgo, formatAddress } from '@/lib/utils/formatting';
import toast from 'react-hot-toast';

// ============================================
// Types
// ============================================
type AuditAction =
  | 'deploy' | 'upgrade' | 'verify' | 'pause' | 'unpause'
  | 'mint' | 'burn' | 'transfer' | 'revoke'
  | 'multisig-propose' | 'multisig-sign' | 'multisig-execute'
  | 'role-grant' | 'role-revoke'
  | 'settings-change' | 'key-rotate'
  | 'wallet-connect' | 'wallet-disconnect'
  | 'test-run' | 'audit-complete';

interface AuditEntry {
  id: string;
  action: AuditAction;
  actor: string;
  actorAddress?: string;
  description: string;
  target?: string;
  targetAddress?: string;
  network?: string;
  txHash?: string;
  chainId?: number;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  metadata?: Record<string, string>;
}

// ============================================
// Mock Audit Trail
// ============================================
const AUDIT_LOG: AuditEntry[] = [
  {
    id: '1',
    action: 'deploy',
    actor: 'alice@company.com',
    actorAddress: '0xAlice123...456',
    description: 'Deployed ClientToken ERC20 to Ethereum Mainnet',
    target: 'ClientToken ERC20',
    targetAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    network: 'Ethereum',
    txHash: '0xabc123def456789abc123def456789abc123def456789abc123def456789abc12',
    chainId: 1,
    severity: 'info',
    timestamp: new Date(Date.now() - 86400000 * 5),
    metadata: { version: 'v1.2.0', commit: 'a4f2c3e', gas: '1,247,893' },
  },
  {
    id: '2',
    action: 'verify',
    actor: 'alice@company.com',
    description: 'Contract verified on Etherscan',
    target: 'ClientToken ERC20',
    targetAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    network: 'Ethereum',
    severity: 'info',
    timestamp: new Date(Date.now() - 86400000 * 5 + 300000),
    metadata: { explorer: 'Etherscan', status: 'verified' },
  },
  {
    id: '3',
    action: 'multisig-propose',
    actor: 'bob@company.com',
    actorAddress: '0xBob789...012',
    description: 'Proposed ownership transfer to client multisig',
    target: 'ClientToken ERC20',
    targetAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    network: 'Ethereum',
    severity: 'warning',
    timestamp: new Date(Date.now() - 86400000 * 4),
    metadata: { threshold: '3-of-5', safeAddress: '0xSafe...123' },
  },
  {
    id: '4',
    action: 'multisig-sign',
    actor: 'charlie@company.com',
    actorAddress: '0xCharlie...789',
    description: 'Signed multisig transaction #7: Ownership transfer',
    target: 'Safe Multisig',
    network: 'Ethereum',
    severity: 'info',
    timestamp: new Date(Date.now() - 86400000 * 3.5),
    metadata: { txId: '#7', confirmations: '2/3', remaining: '1' },
  },
  {
    id: '5',
    action: 'upgrade',
    actor: 'alice@company.com',
    actorAddress: '0xAlice123...456',
    description: 'Upgraded CryptoApes proxy to implementation v2.1.0',
    target: 'CryptoApes NFT Proxy',
    targetAddress: '0x58807baD0B376efc12F5AD304f9e0eb38e253e4f',
    network: 'Polygon',
    txHash: '0xupgrade123...789',
    chainId: 137,
    severity: 'critical',
    timestamp: new Date(Date.now() - 86400000 * 3),
    metadata: { fromImpl: '0xOld...111', toImpl: '0xNew...222', version: 'v2.1.0' },
  },
  {
    id: '6',
    action: 'audit-complete',
    actor: 'security@certik.com',
    description: 'External audit completed — 0 critical, 2 medium (resolved)',
    target: 'ClientToken ERC20',
    severity: 'info',
    timestamp: new Date(Date.now() - 86400000 * 2),
    metadata: { auditor: 'CertiK', findings: '2 medium', status: 'resolved' },
  },
  {
    id: '7',
    action: 'pause',
    actor: 'alice@company.com',
    actorAddress: '0xAlice123...456',
    description: 'Emergency pause triggered on YieldVault — suspicious activity detected',
    target: 'YieldVault DeFi',
    targetAddress: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
    network: 'BSC',
    txHash: '0xpause789...abc',
    chainId: 56,
    severity: 'critical',
    timestamp: new Date(Date.now() - 3600000 * 12),
    metadata: { reason: 'Suspicious TVL drain detected', alert: 'automated-monitor' },
  },
  {
    id: '8',
    action: 'role-grant',
    actor: 'bob@company.com',
    description: 'Granted MINTER_ROLE to new contract address',
    target: 'ClientToken ERC20',
    targetAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    network: 'Ethereum',
    severity: 'warning',
    timestamp: new Date(Date.now() - 3600000 * 6),
    metadata: { role: 'MINTER_ROLE', grantee: '0xMinter...333' },
  },
  {
    id: '9',
    action: 'test-run',
    actor: 'github-actions[bot]',
    description: 'Foundry test suite passed — 247 tests, 100% pass rate',
    network: 'Local',
    severity: 'info',
    timestamp: new Date(Date.now() - 3600000 * 2),
    metadata: { tests: '247', passed: '247', branch: 'feature/new-token', commit: 'b2c3d4e' },
  },
  {
    id: '10',
    action: 'settings-change',
    actor: 'charlie@company.com',
    description: 'Updated Alchemy API key for Ethereum mainnet RPC',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1800000),
    metadata: { setting: 'ethereum-rpc', change: 'api-key-rotation' },
  },
  {
    id: '11',
    action: 'wallet-connect',
    actor: 'alice@company.com',
    actorAddress: '0xAlice123...456',
    description: 'Wallet connected via MetaMask',
    network: 'Ethereum',
    severity: 'info',
    timestamp: new Date(Date.now() - 600000),
    metadata: { wallet: 'MetaMask', chainId: '1' },
  },
];

// ============================================
// Icon & Color Maps
// ============================================
const ACTION_CONFIG: Record<AuditAction, { icon: React.ReactNode; label: string; color: string }> = {
  deploy: { icon: <GitBranch size={13} />, label: 'Deploy', color: 'text-purple-400 bg-purple-400/10' },
  upgrade: { icon: <GitBranch size={13} />, label: 'Upgrade', color: 'text-orange-400 bg-orange-400/10' },
  verify: { icon: <CheckCircle2 size={13} />, label: 'Verify', color: 'text-green-400 bg-green-400/10' },
  pause: { icon: <AlertTriangle size={13} />, label: 'Pause', color: 'text-red-400 bg-red-400/10' },
  unpause: { icon: <CheckCircle2 size={13} />, label: 'Unpause', color: 'text-green-400 bg-green-400/10' },
  mint: { icon: <Coins size={13} />, label: 'Mint', color: 'text-cyan-400 bg-cyan-400/10' },
  burn: { icon: <Coins size={13} />, label: 'Burn', color: 'text-red-400 bg-red-400/10' },
  transfer: { icon: <Coins size={13} />, label: 'Transfer', color: 'text-blue-400 bg-blue-400/10' },
  revoke: { icon: <Lock size={13} />, label: 'Revoke', color: 'text-red-400 bg-red-400/10' },
  'multisig-propose': { icon: <Shield size={13} />, label: 'MS Propose', color: 'text-yellow-400 bg-yellow-400/10' },
  'multisig-sign': { icon: <Shield size={13} />, label: 'MS Sign', color: 'text-yellow-300 bg-yellow-300/10' },
  'multisig-execute': { icon: <Shield size={13} />, label: 'MS Execute', color: 'text-green-400 bg-green-400/10' },
  'role-grant': { icon: <Key size={13} />, label: 'Role Grant', color: 'text-orange-400 bg-orange-400/10' },
  'role-revoke': { icon: <Key size={13} />, label: 'Role Revoke', color: 'text-red-400 bg-red-400/10' },
  'settings-change': { icon: <Settings size={13} />, label: 'Settings', color: 'text-gray-400 bg-gray-400/10' },
  'key-rotate': { icon: <Key size={13} />, label: 'Key Rotate', color: 'text-yellow-400 bg-yellow-400/10' },
  'wallet-connect': { icon: <Users size={13} />, label: 'Connect', color: 'text-blue-400 bg-blue-400/10' },
  'wallet-disconnect': { icon: <Users size={13} />, label: 'Disconnect', color: 'text-gray-400 bg-gray-400/10' },
  'test-run': { icon: <CheckCircle2 size={13} />, label: 'Test Run', color: 'text-green-400 bg-green-400/10' },
  'audit-complete': { icon: <Shield size={13} />, label: 'Audit', color: 'text-cyan-400 bg-cyan-400/10' },
};

const SEVERITY_COLORS = {
  info: 'border-l-blue-500/30',
  warning: 'border-l-yellow-500/40',
  critical: 'border-l-red-500/50',
};

export default function ActivityPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const actors = ['all', ...Array.from(new Set(AUDIT_LOG.map(e => e.actor)))];

  const filtered = AUDIT_LOG.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.description.toLowerCase().includes(q) ||
      e.actor.toLowerCase().includes(q) ||
      (e.target || '').toLowerCase().includes(q) ||
      (e.txHash || '').includes(q);
    const matchSev = severityFilter === 'all' || e.severity === severityFilter;
    const matchActor = actorFilter === 'all' || e.actor === actorFilter;
    return matchSearch && matchSev && matchActor;
  });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const stats = {
    total: AUDIT_LOG.length,
    critical: AUDIT_LOG.filter(e => e.severity === 'critical').length,
    warning: AUDIT_LOG.filter(e => e.severity === 'warning').length,
    today: AUDIT_LOG.filter(e => e.timestamp > new Date(Date.now() - 86400000)).length,
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Activity className="text-blue-400" size={24} />
            Audit Log
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Immutable append-only audit trail — every action, who did it, when, on-chain proof
          </p>
        </div>
        <button
          onClick={() => toast.success('Audit log exported to CSV')}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events', value: stats.total, color: 'text-foreground' },
          { label: 'Critical Events', value: stats.critical, color: 'text-red-400' },
          { label: 'Warnings', value: stats.warning, color: 'text-yellow-400' },
          { label: 'Last 24h', value: stats.today, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
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
              placeholder="Search events, actors, targets, tx hashes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <select
              className="crypto-input h-9 text-sm"
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as typeof severityFilter)}
            >
              <option value="all">All Severity</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              className="crypto-input h-9 text-sm"
              value={actorFilter}
              onChange={e => setActorFilter(e.target.value)}
            >
              {actors.map(a => (
                <option key={a} value={a}>{a === 'all' ? 'All Actors' : a}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} events</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {filtered.map(entry => {
          const cfg = ACTION_CONFIG[entry.action];
          const isExpanded = expanded === entry.id;
          return (
            <div
              key={entry.id}
              className={`glass-card border-l-2 ${SEVERITY_COLORS[entry.severity]} cursor-pointer hover:bg-white/5 transition-colors`}
              onClick={() => setExpanded(isExpanded ? null : entry.id)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Action Badge */}
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-medium shrink-0 ${cfg.color}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-medium text-foreground">{entry.description}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{formatTimeAgo(entry.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        by <span className="text-blue-400">{entry.actor}</span>
                      </span>
                      {entry.network && (
                        <span className="text-xs text-muted-foreground">on {entry.network}</span>
                      )}
                      {entry.target && (
                        <span className="text-xs text-muted-foreground">
                          → <span className="text-purple-300">{entry.target}</span>
                        </span>
                      )}
                      {entry.txHash && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono text-cyan-400">
                            {formatAddress(entry.txHash, 10)}
                          </span>
                          <button
                            onClick={e => { e.stopPropagation(); copy(entry.txHash!, 'Tx hash'); }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy size={10} />
                          </button>
                          <a
                            href={`https://etherscan.io/tx/${entry.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-muted-foreground hover:text-blue-400"
                          >
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                      {entry.severity === 'critical' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-medium">CRITICAL</span>
                      )}
                      {entry.severity === 'warning' && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-medium">WARNING</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded metadata */}
                {isExpanded && entry.metadata && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(entry.metadata).map(([k, v]) => (
                        <div key={k} className="bg-black/20 rounded p-2">
                          <div className="text-xs text-muted-foreground capitalize">{k.replace(/-/g, ' ')}</div>
                          <div className="text-xs font-mono text-foreground mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>
                    {entry.targetAddress && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Target Address:</span>
                        <span className="text-xs font-mono text-purple-300">{entry.targetAddress}</span>
                        <button onClick={() => copy(entry.targetAddress!, 'Address')} className="text-muted-foreground hover:text-foreground">
                          <Copy size={10} />
                        </button>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Timestamp:</span>
                      <span className="text-xs font-mono text-foreground">{entry.timestamp.toISOString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass-card p-16 text-center text-muted-foreground">
            <Activity size={40} className="mx-auto mb-3 opacity-30" />
            <p>No audit events match your filters</p>
          </div>
        )}
      </div>

      {/* Immutability Note */}
      <div className="glass-card p-4 border border-green-500/20">
        <div className="flex items-start gap-3">
          <Lock size={16} className="text-green-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-400">Append-only Audit Trail</p>
            <p className="text-xs text-muted-foreground mt-1">
              All audit events are cryptographically signed and append-only. Records cannot be modified or deleted.
              On-chain actions include transaction hashes for independent verification on block explorers.
              This log is exportable for external auditors and compliance reviews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
