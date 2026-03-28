'use client';

import { useState } from 'react';
import {
  Server,
  Shield,
  AlertTriangle,
  Bell,
  Lock,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Settings,
  Activity,
  TrendingUp,
  ExternalLink,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import { MonitoringAlert } from '@/types';
import { useAlertStore } from '@/store';
import { formatTimeAgo, formatAddress } from '@/lib/utils/formatting';
import toast from 'react-hot-toast';

const MOCK_ALERTS: MonitoringAlert[] = [
  { id: '1', type: 'large-transfer', severity: 'high', message: 'Large transfer detected: 50,000 ETH from contract 0xAbCd...', contractAddress: '0xAbCd1234', network: 'ethereum', timestamp: new Date(Date.now() - 120000), acknowledged: false },
  { id: '2', type: 'gas-spike', severity: 'medium', message: 'Gas price spike on Ethereum: 145 Gwei (3x normal)', network: 'ethereum', timestamp: new Date(Date.now() - 300000), acknowledged: false },
  { id: '3', type: 'contract-event', severity: 'low', message: 'Ownership transfer event emitted on NFT collection', contractAddress: '0xNFT5678', network: 'polygon', timestamp: new Date(Date.now() - 600000), acknowledged: true },
];

const MOCK_DEPLOYMENTS = [
  { id: '1', name: 'MyToken ERC20', network: 'ethereum', address: '0xAbCd1234567890ABCD1234567890abCd12345678', deployedAt: new Date(Date.now() - 86400000 * 5), status: 'active', verified: true, paused: false },
  { id: '2', name: 'NFT Collection', network: 'polygon', address: '0xDef5678901234ABCD5678901234def56789012', deployedAt: new Date(Date.now() - 86400000 * 10), status: 'active', verified: true, paused: false },
  { id: '3', name: 'Staking Contract', network: 'bsc', address: '0xGhi9012345678ABCD9012345678ghi90123456', deployedAt: new Date(Date.now() - 86400000 * 2), status: 'active', verified: false, paused: true },
];

const MULTISIG_PENDING = [
  { id: '1', description: 'Upgrade proxy implementation', to: '0xProxy...', value: '0 ETH', confirmations: 2, required: 3, submittedAt: new Date(Date.now() - 3600000) },
  { id: '2', description: 'Withdraw treasury funds (10 ETH)', to: '0xTreasury...', value: '10 ETH', confirmations: 1, required: 3, submittedAt: new Date(Date.now() - 7200000) },
];

type Tab = 'overview' | 'contracts' | 'multisig' | 'alerts';

export default function MainnetPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { alerts: storeAlerts, acknowledgeAlert } = useAlertStore();
  const allAlerts = [...MOCK_ALERTS, ...storeAlerts];
  const unacknowledged = allAlerts.filter(a => !a.acknowledged).length;

  const [pausing, setPausing] = useState<string | null>(null);

  const handlePause = async (contractId: string, isPaused: boolean) => {
    setPausing(contractId);
    await new Promise(r => setTimeout(r, 1500));
    setPausing(null);
    toast.success(`Contract ${isPaused ? 'unpaused' : 'paused'} successfully`);
  };

  const alertSeverityClass = (s: string) => ({
    critical: 'border-l-red-500 bg-red-500/5',
    high: 'border-l-orange-500 bg-orange-500/5',
    medium: 'border-l-yellow-500 bg-yellow-500/5',
    low: 'border-l-blue-500 bg-blue-500/5',
  }[s] || 'border-l-gray-500 bg-gray-500/5');

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Server className="text-yellow-400" size={24} />
            Mainnet Operations Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Production contract management, multi-sig operations, and monitoring
          </p>
        </div>
        {unacknowledged > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertTriangle size={16} />
            {unacknowledged} active alert{unacknowledged !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Live Contracts', value: MOCK_DEPLOYMENTS.filter(d => d.status === 'active' && !d.paused).length, color: 'text-green-400', icon: <Activity size={16} /> },
          { label: 'Paused Contracts', value: MOCK_DEPLOYMENTS.filter(d => d.paused).length, color: 'text-yellow-400', icon: <Pause size={16} /> },
          { label: 'Pending Multi-Sig', value: MULTISIG_PENDING.length, color: 'text-purple-400', icon: <Lock size={16} /> },
          { label: 'Active Alerts', value: unacknowledged, color: unacknowledged > 0 ? 'text-red-400' : 'text-green-400', icon: <Bell size={16} /> },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className={`flex items-center gap-2 mb-2 ${s.color}`}>{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-white/[0.04] border border-white/[0.06]">
        {(['overview', 'contracts', 'multisig', 'alerts'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button capitalize ${activeTab === tab ? 'active' : ''}`}>
            {tab === 'alerts' && unacknowledged > 0 ? `Alerts (${unacknowledged})` : tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="font-semibold">Deployed Contracts</h2>
            {MOCK_DEPLOYMENTS.map(dep => (
              <div key={dep.id} className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{dep.name}</span>
                      {dep.verified && <span className="badge badge-green text-[9px]">✓ VERIFIED</span>}
                      {dep.paused && <span className="badge badge-yellow text-[9px]">PAUSED</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {dep.network} • {formatAddress(dep.address)} • {formatTimeAgo(dep.deployedAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePause(dep.id, dep.paused)}
                    disabled={pausing === dep.id}
                    className={dep.paused ? 'btn-primary text-xs h-8 px-3' : 'btn-secondary text-xs h-8 px-3'}
                  >
                    {pausing === dep.id ? <div className="spinner w-3 h-3" /> : dep.paused ? <><Play size={12} /> Resume</> : <><Pause size={12} /> Pause</>}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold">Recent Alerts</h2>
            {allAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className={`glass-card p-4 border-l-2 ${alertSeverityClass(alert.severity)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase severity-${alert.severity}`}>{alert.severity}</span>
                      <span className="text-xs text-muted-foreground">{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="text-xs text-muted-foreground hover:text-green-400 flex-shrink-0"
                    >
                      <CheckCircle2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contracts */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="glass-card overflow-hidden">
            <table className="crypto-table">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Network</th>
                  <th>Address</th>
                  <th>Deployed</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DEPLOYMENTS.map(dep => (
                  <tr key={dep.id}>
                    <td className="font-semibold">{dep.name}</td>
                    <td className="capitalize">{dep.network}</td>
                    <td className="font-mono text-xs text-purple-300">{formatAddress(dep.address)}</td>
                    <td className="text-sm text-muted-foreground">{formatTimeAgo(dep.deployedAt)}</td>
                    <td>
                      <span className={dep.paused ? 'badge badge-yellow' : 'badge badge-green'}>
                        {dep.paused ? 'Paused' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {dep.verified ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-red-400" />}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePause(dep.id, dep.paused)}
                          disabled={pausing === dep.id}
                          className="btn-secondary text-xs h-7 px-2"
                        >
                          {dep.paused ? 'Resume' : 'Pause'}
                        </button>
                        <button className="btn-secondary text-xs h-7 px-2">
                          <ExternalLink size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Emergency Controls */}
          <div className="glass-card p-5 border border-red-500/20">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
              <AlertTriangle size={18} />
              Emergency Controls
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Use these controls only in emergency situations. All actions are logged and require multi-sig confirmation.</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  if (confirm('⚠️ Pause ALL contracts? This is an emergency action.')) {
                    toast.success('All contracts paused (requires multi-sig confirmation)');
                  }
                }}
                className="btn-danger"
              >
                <Pause size={14} />
                Pause All Contracts
              </button>
              <button className="btn-secondary text-red-400 border-red-500/30">
                <Lock size={14} />
                Emergency Withdraw
              </button>
              <button className="btn-secondary text-yellow-400 border-yellow-500/30">
                <Settings size={14} />
                Upgrade Implementation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Sig */}
      {activeTab === 'multisig' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Lock size={18} className="text-purple-400" />
              Multi-Signature Wallet
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-xs text-muted-foreground mb-1">Wallet Address</div>
                <div className="font-mono text-sm">0xMultiSig...1234</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-xs text-muted-foreground mb-1">Threshold</div>
                <div className="font-semibold">2 of 3 signers</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-xs text-muted-foreground mb-1">Balance</div>
                <div className="font-semibold text-green-400">45.3 ETH</div>
              </div>
            </div>

            <h3 className="font-semibold text-sm mb-3">Pending Transactions ({MULTISIG_PENDING.length})</h3>
            <div className="space-y-3">
              {MULTISIG_PENDING.map(tx => (
                <div key={tx.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">{tx.description}</div>
                      <div className="text-xs text-muted-foreground">
                        To: {tx.to} · Value: {tx.value} · Submitted {formatTimeAgo(tx.submittedAt)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex">
                          {Array.from({ length: tx.required }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-full border-2 border-background flex items-center justify-center -ml-1 first:ml-0 text-xs font-bold ${i < tx.confirmations ? 'bg-purple-600 text-white' : 'bg-white/10 text-muted-foreground'}`}
                            >
                              {i < tx.confirmations ? '✓' : '?'}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{tx.confirmations}/{tx.required} confirmations</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => toast.success('Confirmation submitted to multi-sig')}
                        className="btn-primary text-xs h-8 px-3"
                        disabled={tx.confirmations >= tx.required}
                      >
                        <CheckCircle2 size={12} />
                        Confirm
                      </button>
                      {tx.confirmations >= tx.required && (
                        <button
                          onClick={() => toast.success('Transaction executed!')}
                          className="btn-primary text-xs h-8 px-3"
                          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                        >
                          <Play size={12} />
                          Execute
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Monitoring Alerts</h2>
            <button
              onClick={() => allAlerts.forEach(a => !a.acknowledged && acknowledgeAlert(a.id))}
              className="btn-secondary text-xs h-8"
            >
              <CheckCircle2 size={12} />
              Acknowledge All
            </button>
          </div>
          {allAlerts.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <CheckCircle2 size={32} className="mx-auto text-green-400 mb-3" />
              <p className="text-green-400 font-semibold">No active alerts</p>
              <p className="text-muted-foreground text-sm mt-1">All systems operating normally</p>
            </div>
          ) : allAlerts.map(alert => (
            <div key={alert.id} className={`glass-card p-4 border-l-4 ${alertSeverityClass(alert.severity)} ${alert.acknowledged ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`severity-${alert.severity}`}>{alert.severity.toUpperCase()}</span>
                    <span className="badge badge-gray text-[9px]">{alert.type.replace('-', ' ')}</span>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(alert.timestamp)}</span>
                    {alert.acknowledged && <span className="badge badge-green text-[9px]">ACKNOWLEDGED</span>}
                  </div>
                  <p className="text-sm font-medium">{alert.message}</p>
                  {alert.contractAddress && (
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{alert.contractAddress}</div>
                  )}
                </div>
                {!alert.acknowledged && (
                  <button
                    onClick={() => { acknowledgeAlert(alert.id); toast.success('Alert acknowledged'); }}
                    className="btn-secondary text-xs h-8 px-3 flex-shrink-0"
                  >
                    <CheckCircle2 size={12} />
                    Ack
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
