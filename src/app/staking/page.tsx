'use client';

import { useState } from 'react';
import { TrendingUp, Coins, Gift, BarChart3, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { StakingPool } from '@/types';
import { MOCK_STAKING_POOLS } from '@/lib/constants/staking';
import { formatNumber } from '@/lib/utils/formatting';
import StakePanel from '@/components/staking/StakePanel';
import { useWalletStore } from '@/store';

type StakingTab = 'pools' | 'my-positions';

const NETWORK_COLORS: Record<string, string> = {
  ethereum: '#627EEA',
  bsc: '#F3BA2F',
  polygon: '#8247E5',
  avalanche: '#E84142',
  arbitrum: '#28A0F0',
  optimism: '#FF0420',
};

export default function StakingPage() {
  const [activeTab, setActiveTab] = useState<StakingTab>('pools');
  const [expandedPool, setExpandedPool] = useState<string | null>(null);
  const { connected } = useWalletStore();

  // Use mock pools; in production these would come from the contract store
  const pools: StakingPool[] = MOCK_STAKING_POOLS;

  const totalTvl = pools.reduce((sum, p) => sum + p.tvl, 0);
  const bestApy = Math.max(...pools.map((p) => p.apy));

  const stats = [
    {
      label: 'Total Value Locked',
      value: `$${formatNumber(totalTvl)}`,
      icon: <Coins size={18} />,
      color: '#7C3AED',
    },
    {
      label: 'Active Pools',
      value: pools.filter((p) => p.isActive).length.toString(),
      icon: <BarChart3 size={18} />,
      color: '#3B82F6',
    },
    {
      label: 'Best APY',
      value: `${bestApy}%`,
      icon: <TrendingUp size={18} />,
      color: '#10B981',
    },
    {
      label: 'Claimable Rewards',
      value: connected ? '~0.00' : '—',
      icon: <Gift size={18} />,
      color: '#F59E0B',
    },
  ];

  const poolsToShow =
    activeTab === 'my-positions'
      ? pools.filter((p) => p.contractAddress) // Only real contracts in "my-positions"
      : pools;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <TrendingUp size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Staking</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Stake tokens, earn rewards, and grow your portfolio passively.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border"
                style={{ borderColor: `${stat.color}33`, background: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-white/[0.03] border border-white/5">
        {(['pools', 'my-positions'] as StakingTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button text-xs ${activeTab === tab ? 'active' : ''}`}
          >
            {tab === 'my-positions' ? 'My Positions' : 'All Pools'}
          </button>
        ))}
      </div>

      {/* Pools list */}
      <div className="space-y-3">
        {poolsToShow.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Coins size={32} className="mx-auto mb-3 text-muted-foreground/40" />
            <div className="text-sm font-medium text-white/70">No positions yet</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Connect your wallet and stake in one of the pools above.
            </p>
          </div>
        ) : (
          poolsToShow.map((pool) => {
            const isExpanded = expandedPool === pool.id;
            const networkColor = NETWORK_COLORS[pool.network] ?? '#7C3AED';

            return (
              <div
                key={pool.id}
                className="glass-card rounded-2xl overflow-hidden transition-all"
              >
                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold text-white"
                        style={{ borderColor: `${networkColor}33`, background: `${networkColor}18` }}
                      >
                        {pool.stakingTokenSymbol.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-white truncate">{pool.name}</span>
                          {pool.lockPeriod === 0 ? (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
                              Flexible
                            </span>
                          ) : (
                            <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-300">
                              {pool.lockPeriod}d Lock
                            </span>
                          )}
                          {pool.isActive && (
                            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-cyan-300">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Stake {pool.stakingTokenSymbol} · Earn {pool.rewardTokenSymbol} · {pool.network}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">APY</div>
                        <div className="text-lg font-bold text-emerald-400">{pool.apy}%</div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-muted-foreground">TVL</div>
                        <div className="text-sm font-semibold text-white">${formatNumber(pool.tvl)}</div>
                      </div>
                      {pool.contractAddress && (
                        <a
                          href={`https://etherscan.io/address/${pool.contractAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-cyan-300 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => setExpandedPool(isExpanded ? null : pool.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-muted-foreground transition-all hover:border-white/20 hover:text-white"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && <StakePanel pool={pool} />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Info banner */}
      <div className="glass-card rounded-2xl p-4 border border-blue-400/10 bg-blue-400/5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10 text-blue-300">
            <TrendingUp size={14} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Deploy Your Own Staking Contract</div>
            <p className="mt-1 text-xs text-muted-foreground">
              After deploying a token in the Token Manager, you can deploy a staking contract for it.
              Staking creates utility and value for your token by giving holders passive income.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
