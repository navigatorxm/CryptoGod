'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coins,
  Code2,
  FlaskConical,
  Server,
  Image,
  BookOpen,
  ShieldAlert,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Layers,
  Zap,
  GitBranch,
  Settings,
  Bell,
  Users,
  Database,
  Cpu,
  Lock,
  TrendingUp,
  Activity,
  Globe,
  Sparkles,
  Radar,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useUIStore, useAlertStore } from '@/store';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  section?: string;
  isV2?: boolean;
  isBeta?: boolean;
  isNew?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <BarChart3 size={18} />,
    section: 'Overview',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: <TrendingUp size={18} />,
    section: 'Overview',
  },
  {
    href: '/activity',
    label: 'Activity Feed',
    icon: <Activity size={18} />,
    section: 'Overview',
  },
  {
    href: '/tokens',
    label: 'Token Manager',
    icon: <Coins size={18} />,
    section: 'Blockchain Tools',
    isNew: true,
  },
  {
    href: '/contracts',
    label: 'Contract Deployer',
    icon: <Code2 size={18} />,
    section: 'Blockchain Tools',
  },
  {
    href: '/nft',
    label: 'NFT Studio',
    icon: <Image size={18} />,
    section: 'Blockchain Tools',
  },
  {
    href: '/multisig',
    label: 'Multi-Sig Wallet',
    icon: <Lock size={18} />,
    section: 'Blockchain Tools',
  },
  {
    href: '/staking',
    label: 'Staking',
    icon: <TrendingUp size={18} />,
    section: 'Blockchain Tools',
    isNew: true,
  },
  {
    href: '/testing',
    label: 'Test Environment',
    icon: <FlaskConical size={18} />,
    section: 'Development',
  },
  {
    href: '/mainnet',
    label: 'Mainnet Ops',
    icon: <Server size={18} />,
    section: 'Development',
  },
  {
    href: '/gas',
    label: 'Gas Optimizer',
    icon: <Zap size={18} />,
    section: 'Development',
  },
  {
    href: '/deployments',
    label: 'Deployments',
    icon: <GitBranch size={18} />,
    section: 'Development',
  },
  {
    href: '/security',
    label: 'Security Hub',
    icon: <ShieldAlert size={18} />,
    section: 'Security & Audit',
  },
  {
    href: '/audit',
    label: 'Contract Auditor',
    icon: <Cpu size={18} />,
    section: 'Security & Audit',
    isBeta: true,
  },
  {
    href: '/education',
    label: 'Learn Web3',
    icon: <BookOpen size={18} />,
    section: 'Education',
  },
  {
    href: '/templates',
    label: 'Code Templates',
    icon: <Layers size={18} />,
    section: 'Education',
  },
  {
    href: '/dapps',
    label: 'DApp Builder',
    icon: <Globe size={18} />,
    section: 'Phase 2',
    isV2: true,
  },
  {
    href: '/dex',
    label: 'DEX Platform',
    icon: <TrendingUp size={18} />,
    section: 'Phase 2',
    isV2: true,
  },
  {
    href: '/defi',
    label: 'DeFi Protocols',
    icon: <Database size={18} />,
    section: 'Phase 2',
    isV2: true,
  },
  {
    href: '/dao',
    label: 'DAO Governance',
    icon: <Users size={18} />,
    section: 'Phase 2',
    isV2: true,
  },
];

const sections = ['Overview', 'Blockchain Tools', 'Development', 'Security & Audit', 'Education', 'Phase 2'];

const sectionMeta: Record<string, { code: string; icon: React.ReactNode }> = {
  Overview: { code: 'SYS', icon: <Radar size={12} /> },
  'Blockchain Tools': { code: 'WEB3', icon: <Coins size={12} /> },
  Development: { code: 'DEV', icon: <Code2 size={12} /> },
  'Security & Audit': { code: 'SEC', icon: <ShieldAlert size={12} /> },
  Education: { code: 'LAB', icon: <BookOpen size={12} /> },
  'Phase 2': { code: 'V2', icon: <Sparkles size={12} /> },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { unreadCount } = useAlertStore();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['Phase 2']));

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        md:relative md:z-auto md:translate-x-0
        flex h-screen flex-col overflow-hidden border-r border-white/10
        transition-all duration-300 ease-in-out
        w-72
        ${sidebarOpen ? 'translate-x-0 md:w-72' : '-translate-x-full md:-translate-x-0 md:w-20'}
      `}
      style={{
        background:
          'radial-gradient(circle at top left, rgba(59,130,246,0.12), transparent 24%), radial-gradient(circle at top right, rgba(168,85,247,0.12), transparent 28%), linear-gradient(180deg, rgba(10,14,27,0.96) 0%, rgba(7,10,20,0.98) 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:22px_22px]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-400/10 via-cyan-400/0 to-transparent" />
      </div>

      <div className="relative z-10 flex h-20 items-center justify-between border-b border-white/10 px-4">
        {sidebarOpen ? (
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-500/20 text-sm font-black text-white shadow-[0_0_30px_rgba(59,130,246,0.18)]">
              <span className="gradient-text">CG</span>
              <div className="absolute inset-[3px] rounded-[14px] border border-white/10" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-semibold uppercase tracking-[0.22em] text-white/95">
                  CryptoGod
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  CORE
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                AI Command Console
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-500/20 text-sm font-black text-white shadow-[0_0_30px_rgba(59,130,246,0.18)]">
            <span className="gradient-text">CG</span>
          </div>
        )}

        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition-all hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {sidebarOpen && (
        <div className="relative z-10 border-b border-white/10 px-4 py-3">
          <div className="glass-card rounded-2xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                System Status
              </span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Stable
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Alerts</div>
                <div className="mt-1 text-lg font-semibold text-white">{unreadCount}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Modules</div>
                <div className="mt-1 text-lg font-semibold text-white">{navItems.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-4 no-scrollbar">
        <div className="space-y-3">
          {sections.map((section) => {
            const sectionItems = navItems.filter((item) => item.section === section);
            const isCollapsed = collapsedSections.has(section);
            const meta = sectionMeta[section];

            return (
              <div key={section} className="rounded-2xl border border-transparent bg-white/[0.015] p-1.5 transition-colors hover:border-white/5">
                {sidebarOpen && (
                  <button
                    onClick={() => toggleSection(section)}
                    className="mb-1 flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-cyan-300">
                        {meta.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
                          {meta.code}
                        </div>
                        <div className="truncate text-[11px] font-medium text-white/80">{section}</div>
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className={`text-muted-foreground/60 transition-transform ${!isCollapsed ? 'rotate-90' : ''}`}
                    />
                  </button>
                )}

                {(!isCollapsed || !sidebarOpen) && (
                  <div className="space-y-1">
                    {sectionItems.map((item) => {
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={!sidebarOpen ? item.label : undefined}
                          className={`sidebar-item group relative overflow-hidden ${isActive ? 'active' : ''} ${
                            !sidebarOpen ? 'justify-center px-0' : ''
                          } ${item.isV2 ? 'opacity-70 hover:opacity-100' : ''}`}
                        >
                          <span
                            className={`absolute inset-y-2 left-0 w-[3px] rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 transition-opacity ${
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                            }`}
                          />
                          <span
                            className={`relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition-all ${
                              isActive
                                ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.16)]'
                                : 'border-white/10 bg-white/[0.03] text-muted-foreground group-hover:border-white/15 group-hover:text-white'
                            }`}
                          >
                            {item.icon}
                          </span>

                          {sidebarOpen && (
                            <>
                              <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
                                <span className="truncate text-[13px] font-medium text-white/90">{item.label}</span>
                              </div>

                              <div className="relative z-10 flex items-center gap-1">
                                {item.isV2 && (
                                  <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-purple-300">
                                    V2
                                  </span>
                                )}
                                {item.isBeta && (
                                  <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-300">
                                    Beta
                                  </span>
                                )}
                                {item.isNew && (
                                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                                    New
                                  </span>
                                )}
                                {item.badge !== undefined && (
                                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="relative z-10 border-t border-white/10 p-3">
        <div className={`space-y-1.5 ${sidebarOpen ? 'glass-card rounded-2xl p-2' : ''}`}>
          <Link
            href="/alerts"
            className={`sidebar-item group relative ${!sidebarOpen ? 'justify-center px-0' : ''}`}
            title={!sidebarOpen ? 'Alerts' : undefined}
          >
            <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors group-hover:border-white/15 group-hover:text-white">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-[0_0_12px_rgba(239,68,68,0.45)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-white/90">Alerts</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Monitor system events</div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground/60" />
              </>
            )}
          </Link>

          <Link
            href="/settings"
            className={`sidebar-item group relative ${!sidebarOpen ? 'justify-center px-0' : ''}`}
            title={!sidebarOpen ? 'Settings' : undefined}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors group-hover:border-white/15 group-hover:text-white">
              <Settings size={18} />
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-white/90">Settings</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Preferences & access</div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground/60" />
              </>
            )}
          </Link>
        </div>
      </div>

      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-24 z-20 hidden md:flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/20 bg-slate-950 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.18)] transition-all hover:scale-105 hover:border-cyan-300/30 hover:bg-cyan-400/10"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen size={14} />
        </button>
      )}
    </aside>
    </>
  );
}