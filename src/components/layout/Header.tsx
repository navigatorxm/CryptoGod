'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  ChevronDown,
  RefreshCw,
  Search,
  Bell,
  Copy,
  LogOut,
  ExternalLink,
  Wifi,
  WifiOff,
  Command,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useWalletStore, useAlertStore, useUIStore } from '@/store';
import { connectMetaMask, formatWalletError } from '@/lib/web3/wallet';
import { formatAddress } from '@/lib/utils/formatting';
import { NETWORKS } from '@/lib/constants/networks';
import toast from 'react-hot-toast';

export default function Header() {
  const { connected, address, chainId, balance, walletType, setWallet, disconnect } = useWalletStore();
  const { unreadCount } = useAlertStore();
  const { activeNetwork, setActiveNetwork } = useUIStore();
  const [connecting, setConnecting] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showNetworkMenu, setShowNetworkMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const currentNetwork = Object.values(NETWORKS).find((n) => n.id === chainId);
  const selectedNetwork =
    Object.values(NETWORKS).find((n) => n.shortName === activeNetwork) || currentNetwork || Object.values(NETWORKS)[0];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const wallet = await connectMetaMask();
      setWallet({
        connected: true,
        address: wallet.address,
        chainId: wallet.chainId,
        balance: wallet.balance,
        walletType: wallet.walletType,
        provider: wallet.provider,
      });
      setActiveNetwork(Object.values(NETWORKS).find((n) => n.id === wallet.chainId)?.shortName || 'ethereum');
      toast.success(`Connected: ${formatAddress(wallet.address)}`);
    } catch (error) {
      toast.error(formatWalletError(error));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowWalletMenu(false);
    toast.success('Wallet disconnected');
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied!');
    }
  };

  const getWalletIcon = () => {
    if (walletType === 'metamask') return '🦊';
    if (walletType === 'coinbase') return '🔵';
    return '👛';
  };

  return (
    <>
      <header
        className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-white/10 px-4 sm:px-6"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,12,22,0.92) 0%, rgba(8,12,22,0.82) 100%)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-4">
          <div className="hidden xl:flex items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
            <Command size={14} />
            Command Deck
          </div>

          <div className="relative max-w-xl flex-1">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300/70" />
            <input
              type="text"
              placeholder="Search contracts, tokens, tx hashes, operators..."
              className="crypto-input h-11 rounded-2xl border-white/10 bg-white/[0.04] pl-11 pr-24 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(34,211,238,0.02)] placeholder:text-muted-foreground/80"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Command size={10} />
              K
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center gap-2 lg:gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                isOnline
                  ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                  : 'border-red-400/20 bg-red-400/10 text-red-300'
              }`}
            >
              {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
            </div>
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Network</div>
              <div className={`mt-1 text-xs font-semibold ${isOnline ? 'text-emerald-300' : 'text-red-300'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
              <ShieldCheck size={15} />
            </div>
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Workspace</div>
              <div className="mt-1 text-xs font-semibold text-white">Secure Session</div>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          <div className="relative">
            <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-muted-foreground transition-all hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300">
              <Bell size={18} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-slate-950 bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10" />

          <div className="relative">
            <button
              onClick={() => setShowNetworkMenu(!showNetworkMenu)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition-all hover:border-cyan-400/20 hover:bg-cyan-400/10"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{
                  borderColor: `${selectedNetwork?.color || '#22d3ee'}33`,
                  background: `${selectedNetwork?.color || '#22d3ee'}15`,
                  color: selectedNetwork?.color || '#22d3ee',
                }}
              >
                <span className="text-base leading-none">{selectedNetwork?.icon}</span>
              </div>
              <div className="hidden md:block leading-none">
                <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Chain</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{selectedNetwork?.name || 'Select Network'}</span>
                  {selectedNetwork?.isTestnet && (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-300">
                      Test
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showNetworkMenu ? 'rotate-180' : ''}`} />
            </button>

            {showNetworkMenu && (
              <div
                className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
                style={{ background: 'linear-gradient(180deg, rgba(10,14,24,0.98), rgba(8,11,20,0.98))' }}
              >
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Active Network
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">Switch command routing</div>
                </div>
                <div className="p-2">
                  {Object.values(NETWORKS).map((network) => {
                    const isSelected = network.shortName === activeNetwork || network.id === chainId;

                    return (
                      <button
                        key={network.shortName}
                        onClick={() => {
                          setActiveNetwork(network.shortName);
                          setShowNetworkMenu(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all ${
                          isSelected
                            ? 'border-cyan-400/20 bg-cyan-400/10'
                            : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl border"
                          style={{
                            borderColor: `${network.color}33`,
                            background: `${network.color}15`,
                            color: network.color,
                          }}
                        >
                          <span className="text-lg leading-none">{network.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="truncate font-medium text-white">{network.name}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                              {network.shortName}
                            </span>
                            {network.isTestnet && (
                              <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-amber-300">
                                Testnet
                              </span>
                            )}
                          </div>
                        </div>
                        {network.id === chainId && <Activity size={14} className="text-emerald-300" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {connected && address ? (
            <div className="relative">
              <button
                onClick={() => setShowWalletMenu(!showWalletMenu)}
                className="flex items-center gap-3 rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-500/15 via-fuchsia-500/10 to-cyan-500/10 px-3 py-2 transition-all hover:border-purple-400/35 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10 text-lg">
                  {getWalletIcon()}
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-purple-200/70">Wallet</div>
                  <div className="mt-1 text-xs font-semibold text-white">{formatAddress(address)}</div>
                  <div className="mt-1 text-[11px] text-purple-200/80">
                    {balance ? `${parseFloat(balance).toFixed(4)} ${currentNetwork?.symbol || 'ETH'}` : 'Loading balance...'}
                  </div>
                </div>
                <div className="hidden md:flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" />
                <ChevronDown size={14} className={`text-muted-foreground transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
              </button>

              {showWalletMenu && (
                <div
                  className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
                  style={{ background: 'linear-gradient(180deg, rgba(10,14,24,0.98), rgba(8,11,20,0.98))' }}
                >
                  <div className="border-b border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10 text-2xl">
                        {getWalletIcon()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{formatAddress(address, 6)}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground capitalize">
                          {walletType || 'wallet'}
                        </div>
                      </div>
                      <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.8)]" />
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Available Balance</div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {balance ? parseFloat(balance).toFixed(4) : '0.0000'}
                      </div>
                      <div className="mt-1 text-xs text-purple-200/80">{currentNetwork?.symbol || 'ETH'}</div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={copyAddress}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white transition-colors hover:bg-white/[0.04]"
                    >
                      <Copy size={15} className="text-muted-foreground" />
                      Copy Address
                    </button>
                    <a
                      href={currentNetwork ? `${currentNetwork.explorerUrl}/address/${address}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white transition-colors hover:bg-white/[0.04]"
                    >
                      <ExternalLink size={15} className="text-muted-foreground" />
                      View on Explorer
                    </a>
                    <button
                      onClick={handleDisconnect}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-300 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut size={15} />
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={handleConnect} disabled={connecting} className="btn-primary h-11 rounded-2xl px-4 text-xs">
              {connecting ? <RefreshCw size={14} className="animate-spin" /> : <Wallet size={14} />}
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {(showWalletMenu || showNetworkMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowWalletMenu(false);
            setShowNetworkMenu(false);
          }}
        />
      )}
    </>
  );
}