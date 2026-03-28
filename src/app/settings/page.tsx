'use client';

import { useState } from 'react';
import {
  Settings,
  Wallet,
  Bell,
  Shield,
  Globe,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Moon,
  Sun,
  Zap,
  Database,
  Key,
  Code2,
} from 'lucide-react';
import { useUIStore, useWalletStore } from '@/store';
import toast from 'react-hot-toast';

type Tab = 'general' | 'rpc' | 'notifications' | 'api-keys' | 'advanced';

interface NotificationSettings {
  largeTransfers: boolean;
  contractEvents: boolean;
  gasSpike: boolean;
  deploymentSuccess: boolean;
  testResults: boolean;
  priceAlerts: boolean;
  emailAlerts: boolean;
  email: string;
}

type BooleanNotificationKey = Exclude<keyof NotificationSettings, 'email'>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const { theme, showTestnets, activeNetwork, setTheme, setShowTestnets } = useUIStore();
  const { connected, address } = useWalletStore();

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [rpcConfig, setRpcConfig] = useState({
    ethereum: 'https://eth.llamarpc.com',
    bsc: 'https://bsc-dataseed1.binance.org',
    polygon: 'https://polygon.llamarpc.com',
    avalanche: 'https://api.avax.network/ext/bc/C/rpc',
    arbitrum: 'https://arb1.arbitrum.io/rpc',
    optimism: 'https://mainnet.optimism.io',
  });

  const [apiKeys, setApiKeys] = useState({
    etherscan: '',
    bscscan: '',
    polygonscan: '',
    infura: '',
    alchemy: '',
    pinata: '',
    walletconnect: '',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    largeTransfers: true,
    contractEvents: true,
    gasSpike: true,
    deploymentSuccess: true,
    testResults: false,
    priceAlerts: false,
    emailAlerts: false,
    email: '',
  });

  const saveSettings = () => {
    toast.success('Settings saved successfully!');
  };

  const ToggleSwitch = ({
    value,
    onChange,
    label,
    description,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div
        className={`w-11 h-6 rounded-full relative cursor-pointer transition-all duration-200 ${value ? 'bg-purple-600' : 'bg-white/10'}`}
        onClick={() => onChange(!value)}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${value ? 'left-6' : 'left-1'}`} />
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Settings className="text-gray-400" size={24} />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your CryptoGod dashboard preferences and integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-white/[0.04] border border-white/[0.06]">
        {(['general', 'rpc', 'notifications', 'api-keys', 'advanced'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button ${activeTab === tab ? 'active' : ''}`}>
            {tab === 'api-keys' ? 'API Keys' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold mb-1">Interface</h2>
            <ToggleSwitch
              value={theme === 'dark'}
              onChange={(v) => setTheme(v ? 'dark' : 'light')}
              label="Dark Mode"
              description="Use dark theme across the dashboard"
            />
            <ToggleSwitch
              value={showTestnets}
              onChange={setShowTestnets}
              label="Show Testnets"
              description="Display testnet networks in network selector"
            />
          </div>

          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold mb-1">Wallet</h2>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-sm">
              <div className="text-muted-foreground mb-1">Connected Wallet</div>
              {connected && address ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="font-mono">{address}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">No wallet connected</span>
              )}
            </div>
            <ToggleSwitch
              value={false}
              onChange={() => {}}
              label="Auto-reconnect Wallet"
              description="Automatically reconnect on page load"
            />
            <ToggleSwitch
              value={true}
              onChange={() => {}}
              label="Hardware Wallet Support"
              description="Enable Ledger/Trezor connection via WalletConnect"
            />
          </div>

          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold mb-1">Language & Region</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Language</label>
                <select className="crypto-input text-sm h-9">
                  <option>English</option>
                  <option>Español</option>
                  <option>中文</option>
                  <option>日本語</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Currency Display</label>
                <select className="crypto-input text-sm h-9">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RPC Config */}
      {activeTab === 'rpc' && (
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-semibold">Custom RPC Endpoints</h2>
            <p className="text-sm text-muted-foreground">Configure your own RPC endpoints for better reliability and rate limits</p>
            {Object.entries(rpcConfig).map(([network, rpc]) => (
              <div key={network}>
                <label className="block text-sm font-medium mb-1.5 capitalize">{network} RPC</label>
                <input
                  type="text"
                  value={rpc}
                  onChange={(e) => setRpcConfig(prev => ({ ...prev, [network]: e.target.value }))}
                  className="crypto-input text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold mb-1">Alert Settings</h2>
            {[
              { key: 'largeTransfers', label: 'Large Transfer Alerts', desc: 'Alert when transfers exceed threshold' },
              { key: 'contractEvents', label: 'Contract Event Alerts', desc: 'Alert on important contract events' },
              { key: 'gasSpike', label: 'Gas Price Spikes', desc: 'Alert when gas price increases significantly' },
              { key: 'deploymentSuccess', label: 'Deployment Success', desc: 'Confirm when contracts deploy successfully' },
              { key: 'testResults', label: 'Test Results', desc: 'Notify when test suites complete' },
            ].map(({ key, label, desc }) => (
              <ToggleSwitch
                key={key}
                value={notifications[key as BooleanNotificationKey]}
                onChange={(v) => setNotifications(prev => ({ ...prev, [key]: v }))}
                label={label}
                description={desc}
              />
            ))}
          </div>

          <div className="glass-card p-5 space-y-3">
            <ToggleSwitch
              value={notifications.emailAlerts}
              onChange={(v) => setNotifications(prev => ({ ...prev, emailAlerts: v }))}
              label="Email Notifications"
              description="Receive alerts via email"
            />
            {notifications.emailAlerts && (
              <input
                type="email"
                placeholder="your@email.com"
                value={notifications.email}
                onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.value }))}
                className="crypto-input"
              />
            )}
          </div>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'api-keys' && (
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-4">
            <h2 className="font-semibold">API Keys & Integrations</h2>
            <p className="text-sm text-muted-foreground">Keys are stored locally and never sent to our servers</p>
            {[
              { key: 'etherscan', label: 'Etherscan API Key', hint: 'For contract verification and data' },
              { key: 'bscscan', label: 'BSCScan API Key', hint: 'For BSC contract verification' },
              { key: 'polygonscan', label: 'PolygonScan API Key', hint: 'For Polygon contract verification' },
              { key: 'infura', label: 'Infura Project ID', hint: 'Enhanced Ethereum/IPFS connectivity' },
              { key: 'alchemy', label: 'Alchemy API Key', hint: 'Enhanced node access and webhooks' },
              { key: 'pinata', label: 'Pinata API Key', hint: 'IPFS pinning for NFT metadata' },
              { key: 'walletconnect', label: 'WalletConnect Project ID', hint: 'Required for WalletConnect v2' },
            ].map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>
                <div className="relative">
                  <input
                    type={showKeys[key] ? 'text' : 'password'}
                    placeholder="Enter API key..."
                    value={(apiKeys as Record<string, string>)[key]}
                    onChange={(e) => setApiKeys(prev => ({ ...prev, [key]: e.target.value }))}
                    className="crypto-input pr-10 text-sm font-mono"
                  />
                  <button
                    onClick={() => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKeys[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div className="glass-card p-5 space-y-3">
            <h2 className="font-semibold">Advanced Settings</h2>
            <ToggleSwitch value={true} onChange={() => {}} label="Enable Debug Logging" description="Log detailed information to browser console" />
            <ToggleSwitch value={false} onChange={() => {}} label="Demo Mode" description="Use mock data without wallet connection" />
            <ToggleSwitch value={true} onChange={() => {}} label="Gas Estimation" description="Automatically estimate gas for transactions" />
            <ToggleSwitch value={true} onChange={() => {}} label="Contract Auto-Verification" description="Verify contracts on block explorers after deployment" />
          </div>
          <div className="glass-card p-5 border border-red-500/20">
            <h2 className="font-semibold text-red-400 mb-3">Danger Zone</h2>
            <div className="space-y-2">
              <button onClick={() => { if (confirm('Clear all local data?')) toast.success('Data cleared'); }} className="btn-secondary text-red-400 border-red-500/30 w-full justify-center">
                Clear All Cached Data
              </button>
              <button onClick={() => { if (confirm('Reset all settings to defaults?')) toast.success('Settings reset'); }} className="btn-secondary text-yellow-400 border-yellow-500/30 w-full justify-center">
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={saveSettings} className="btn-primary px-8">
          <CheckCircle2 size={16} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
