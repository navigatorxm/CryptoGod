'use client';

import { useState, useEffect } from 'react';
import {
  Flame,
  Plus,
  Pause,
  Play,
  ArrowUpRight,
  Shield,
  CheckCircle2,
  Copy,
  ExternalLink,
  Zap,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Droplets,
  DollarSign,
} from 'lucide-react';
import { TokenConfig } from '@/types';
import { formatAddress, formatNumber, getExplorerTxUrl } from '@/lib/utils/formatting';
import { fetchTokenPairs, formatDexChange, type DexScreenerPair } from '@/lib/api/dexscreener';
import toast from 'react-hot-toast';

interface Props {
  token: TokenConfig;
}

type FunctionTab = 'read' | 'write' | 'approvals' | 'market';

export default function TokenFunctions({ token }: Props) {
  const [activeTab, setActiveTab] = useState<FunctionTab>('write');
  const [loading, setLoading] = useState<string | null>(null);
  const [dexPairs, setDexPairs] = useState<DexScreenerPair[]>([]);
  const [dexLoading, setDexLoading] = useState(false);

  const [mintTo, setMintTo] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [approveSpender, setApproveSpender] = useState('');
  const [approveAmount, setApproveAmount] = useState('');

  const [readResults, setReadResults] = useState<Record<string, string>>({});

  useEffect(() => {
    if (activeTab === 'market' && token.contractAddress) {
      setDexLoading(true);
      fetchTokenPairs(token.contractAddress)
        .then(setDexPairs)
        .finally(() => setDexLoading(false));
    }
  }, [activeTab, token.contractAddress]);

  const simulateAction = async (actionId: string, description: string, onSuccess?: () => void) => {
    setLoading(actionId);
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    setLoading(null);
    const fakeTxHash = `0x${Math.random().toString(16).slice(2, 66)}`;
    toast.success(
      <div>
        <div className="font-semibold">{description}</div>
        <div className="text-xs opacity-70 font-mono">{formatAddress(fakeTxHash, 8)}</div>
      </div>
    );
    onSuccess?.();
  };

  const simulateRead = async (funcId: string, result: string) => {
    setLoading(funcId);
    await new Promise(r => setTimeout(r, 500));
    setReadResults(prev => ({ ...prev, [funcId]: result }));
    setLoading(null);
  };

  const gasEstimate = (baseGas: number): string => {
    const gwei = 20 + Math.random() * 10;
    const ethCost = (baseGas * gwei * 1e-9).toFixed(5);
    return `~${ethCost} ETH (${gwei.toFixed(1)} Gwei)`;
  };

  const WriteFunction = ({
    id,
    icon,
    label,
    description,
    color,
    disabled,
    children,
    onSubmit,
    gasBase,
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
    description: string;
    color: string;
    disabled?: boolean;
    children?: React.ReactNode;
    onSubmit: () => void;
    gasBase: number;
  }) => (
    <div className={`p-4 rounded-xl border transition-all ${disabled ? 'opacity-40 border-white/5' : 'border-white/5 hover:border-white/10'} bg-white/[0.02]`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}25`, color }}>
          {icon}
        </div>
        <div>
          <div className="font-semibold text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        {disabled && <span className="ml-auto text-[10px] badge badge-gray">DISABLED</span>}
      </div>
      {children && <div className="space-y-2 mb-3">{children}</div>}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{gasEstimate(gasBase)}</span>
        <button
          onClick={onSubmit}
          disabled={!!disabled || loading === id}
          className="btn-primary h-8 text-xs px-4"
          style={{ background: disabled ? undefined : `linear-gradient(135deg, ${color}, ${color}99)` }}
        >
          {loading === id ? <div className="spinner w-3 h-3" /> : <Zap size={12} />}
          {label}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-5">
      {/* Contract Address Bar */}
      {token.contractAddress && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/5">
          <Shield size={14} className="text-green-400 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Contract Address:</span>
          <span className="font-mono text-sm flex-1">{token.contractAddress}</span>
          <button onClick={() => { navigator.clipboard.writeText(token.contractAddress!); toast.success('Copied!'); }}>
            <Copy size={13} className="text-muted-foreground hover:text-purple-400" />
          </button>
          <a href={getExplorerTxUrl(token.network, token.contractAddress)} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} className="text-muted-foreground hover:text-blue-400" />
          </a>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg w-fit bg-white/[0.03]">
        {(['read', 'write', 'approvals', 'market'] as FunctionTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button text-xs capitalize ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'market' ? '📈 Market' : tab}
          </button>
        ))}
      </div>

      {/* Read Functions */}
      {activeTab === 'read' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'name', label: 'name()', result: token.name },
            { id: 'symbol', label: 'symbol()', result: token.symbol },
            { id: 'decimals', label: 'decimals()', result: String(token.decimals) },
            { id: 'totalSupply', label: 'totalSupply()', result: `${formatNumber(parseFloat(token.totalSupply), 0)} (raw: ${token.totalSupply}${'0'.repeat(token.decimals)})` },
            { id: 'paused', label: 'paused()', result: 'false' },
            { id: 'owner', label: 'owner()', result: token.owner || '0x0...0' },
          ].map(({ id, label, result }) => (
            <div key={id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs text-purple-300">{label}</code>
                <button
                  onClick={() => simulateRead(id, result)}
                  className="text-[10px] text-muted-foreground hover:text-purple-400 flex items-center gap-1"
                  disabled={loading === id}
                >
                  {loading === id ? <div className="spinner w-3 h-3" /> : <RefreshCw size={10} />}
                  Call
                </button>
              </div>
              {readResults[id] !== undefined && (
                <div className="font-mono text-xs text-green-400 bg-black/20 rounded px-2 py-1 break-all">
                  → {readResults[id]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Write Functions */}
      {activeTab === 'write' && (
        <div className="grid grid-cols-2 gap-3">
          {/* Mint */}
          <WriteFunction
            id="mint"
            icon={<Plus size={14} />}
            label="mint()"
            description="Create new tokens and send to address"
            color="#10B981"
            disabled={!token.features.mintable}
            gasBase={65000}
            onSubmit={() => {
              if (!mintTo || !mintAmount) { toast.error('Enter recipient and amount'); return; }
              simulateAction('mint', `Minted ${mintAmount} ${token.symbol} to ${formatAddress(mintTo)}`, () => {
                setMintTo(''); setMintAmount('');
              });
            }}
          >
            <input placeholder="Recipient address (0x...)" value={mintTo} onChange={(e) => setMintTo(e.target.value)} className="crypto-input text-xs h-8" />
            <input placeholder={`Amount (in ${token.symbol})`} value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} type="number" className="crypto-input text-xs h-8" />
          </WriteFunction>

          {/* Burn */}
          <WriteFunction
            id="burn"
            icon={<Flame size={14} />}
            label="burn()"
            description="Permanently destroy tokens from your wallet"
            color="#EF4444"
            disabled={!token.features.burnable}
            gasBase={45000}
            onSubmit={() => {
              if (!burnAmount) { toast.error('Enter burn amount'); return; }
              simulateAction('burn', `Burned ${burnAmount} ${token.symbol}`, () => setBurnAmount(''));
            }}
          >
            <input placeholder={`Amount to burn (${token.symbol})`} value={burnAmount} onChange={(e) => setBurnAmount(e.target.value)} type="number" className="crypto-input text-xs h-8" />
          </WriteFunction>

          {/* Pause */}
          <WriteFunction
            id="pause"
            icon={<Pause size={14} />}
            label="pause()"
            description="Halt all token transfers (emergency)"
            color="#F59E0B"
            disabled={!token.features.pausable}
            gasBase={30000}
            onSubmit={() => simulateAction('pause', `${token.symbol} transfers paused`)}
          />

          {/* Unpause */}
          <WriteFunction
            id="unpause"
            icon={<Play size={14} />}
            label="unpause()"
            description="Resume token transfers"
            color="#10B981"
            disabled={!token.features.pausable}
            gasBase={30000}
            onSubmit={() => simulateAction('unpause', `${token.symbol} transfers resumed`)}
          />

          {/* Transfer */}
          <WriteFunction
            id="transfer"
            icon={<ArrowUpRight size={14} />}
            label="transfer()"
            description="Send tokens to another address"
            color="#7C3AED"
            gasBase={51000}
            onSubmit={() => {
              if (!transferTo || !transferAmount) { toast.error('Enter recipient and amount'); return; }
              simulateAction('transfer', `Transferred ${transferAmount} ${token.symbol} to ${formatAddress(transferTo)}`, () => {
                setTransferTo(''); setTransferAmount('');
              });
            }}
          >
            <input placeholder="To address (0x...)" value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className="crypto-input text-xs h-8" />
            <input placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} type="number" className="crypto-input text-xs h-8" />
          </WriteFunction>

          {/* renounceOwnership */}
          <WriteFunction
            id="renounce"
            icon={<AlertTriangle size={14} />}
            label="renounceOwnership()"
            description="IRREVERSIBLE: Remove contract owner. Use with extreme caution."
            color="#EF4444"
            gasBase={28000}
            onSubmit={() => {
              if (confirm('⚠️ This is IRREVERSIBLE. You will permanently lose owner privileges. Continue?')) {
                simulateAction('renounce', `Ownership renounced for ${token.symbol}`);
              }
            }}
          />
        </div>
      )}

      {/* Market Data */}
      {activeTab === 'market' && (
        <div className="space-y-4">
          {!token.contractAddress ? (
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">
              Deploy this token first to view live market data.
            </div>
          ) : dexLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-28 rounded-xl bg-white/5" />)}
            </div>
          ) : dexPairs.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center">
              <BarChart2 size={28} className="mx-auto mb-3 text-muted-foreground/40" />
              <div className="text-sm font-medium text-white/70">No market data yet</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Your token hasn&apos;t been added to a DEX yet. Add liquidity to get started.
              </p>
              <button
                onClick={() => toast('Add liquidity via the Approvals tab — approve the DEX router first.', { icon: '💧' })}
                className="mt-4 btn-primary text-xs h-8 px-4"
              >
                <Droplets size={12} /> How to Add Liquidity
              </button>
            </div>
          ) : (
            <>
              {dexPairs.slice(0, 5).map((pair) => {
                const change24h = formatDexChange(pair.priceChange?.h24 ?? 0);
                return (
                  <div key={pair.pairAddress} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                        </span>
                        <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                          {pair.dexId}
                        </span>
                      </div>
                      <a
                        href={pair.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-muted-foreground hover:text-cyan-300 flex items-center gap-1"
                      >
                        DexScreener <ExternalLink size={10} />
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-lg bg-white/[0.03] p-2">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <DollarSign size={9} /> Price
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">
                          ${parseFloat(pair.priceUsd || '0').toFixed(8)}
                        </div>
                        <div className={`text-[10px] flex items-center gap-0.5 ${change24h.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {change24h.positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                          {change24h.text} 24h
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] p-2">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <BarChart2 size={9} /> Vol 24h
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">
                          ${formatNumber(pair.volume?.h24 ?? 0)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {(pair.txns?.h24?.buys ?? 0) + (pair.txns?.h24?.sells ?? 0)} txns
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] p-2">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                          <Droplets size={9} /> Liquidity
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white">
                          ${formatNumber(pair.liquidity?.usd ?? 0)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatNumber(pair.liquidity?.base ?? 0)} {pair.baseToken.symbol}
                        </div>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] p-2">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Mkt Cap</div>
                        <div className="mt-1 text-sm font-semibold text-white">
                          {pair.marketCap ? `$${formatNumber(pair.marketCap)}` : 'N/A'}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          FDV: {pair.fdv ? `$${formatNumber(pair.fdv)}` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span>Buys 24h: <span className="text-emerald-400">{pair.txns?.h24?.buys ?? 0}</span></span>
                        <span>Sells 24h: <span className="text-red-400">{pair.txns?.h24?.sells ?? 0}</span></span>
                        <span>1h: <span className={formatDexChange(pair.priceChange?.h1 ?? 0).positive ? 'text-emerald-400' : 'text-red-400'}>{formatDexChange(pair.priceChange?.h1 ?? 0).text}</span></span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => {
                  setDexLoading(true);
                  fetchTokenPairs(token.contractAddress!)
                    .then(setDexPairs)
                    .finally(() => setDexLoading(false));
                }}
                className="btn-secondary w-full text-xs h-8"
              >
                <RefreshCw size={12} /> Refresh Data
              </button>
            </>
          )}
        </div>
      )}

      {/* Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="font-semibold text-sm mb-3">Grant Allowance (approve)</h3>
            <div className="space-y-2 mb-3">
              <input placeholder="Spender address (e.g. DEX router)" value={approveSpender} onChange={(e) => setApproveSpender(e.target.value)} className="crypto-input text-sm" />
              <input placeholder="Amount to approve (or MAX for unlimited)" value={approveAmount} onChange={(e) => setApproveAmount(e.target.value)} className="crypto-input text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!approveSpender) { toast.error('Enter spender address'); return; }
                  simulateAction('approve', `Approved ${approveAmount || 'unlimited'} ${token.symbol} for ${formatAddress(approveSpender)}`);
                }}
                className="btn-primary text-xs h-8"
              >
                <CheckCircle2 size={12} />
                Approve
              </button>
              <button
                onClick={() => {
                  if (!approveSpender) { toast.error('Enter spender address'); return; }
                  simulateAction('revoke', `Revoked allowance for ${formatAddress(approveSpender)}`);
                }}
                className="btn-secondary text-xs h-8"
              >
                Revoke (set to 0)
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <h3 className="font-semibold text-sm mb-2">Check Allowance</h3>
            <p className="text-xs text-muted-foreground mb-3">Query how much an address is approved to spend</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input placeholder="Owner address" className="crypto-input text-xs h-8" />
              <input placeholder="Spender address" className="crypto-input text-xs h-8" />
            </div>
            <button
              onClick={() => simulateRead('allowance', `${Math.floor(Math.random() * 1000000)} ${token.symbol}`)}
              disabled={loading === 'allowance'}
              className="btn-secondary text-xs h-8"
            >
              {loading === 'allowance' ? <div className="spinner w-3 h-3" /> : <RefreshCw size={12} />}
              Query Allowance
            </button>
            {readResults['allowance'] && (
              <div className="mt-2 font-mono text-xs text-green-400 bg-black/20 rounded px-2 py-1">
                → {readResults['allowance']}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
