'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Globe,
  Coins,
  Code2,
  Image,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const TX_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: `Mar ${i + 1}`,
  transactions: Math.floor(Math.random() * 50 + 10),
  gas: (Math.random() * 0.5 + 0.1).toFixed(3),
}));

const GAS_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  ethereum: Math.floor(Math.random() * 80 + 15),
  bsc: Math.floor(Math.random() * 5 + 1),
  polygon: Math.floor(Math.random() * 100 + 20),
}));

const NETWORK_DIST = [
  { name: 'Ethereum', value: 45, color: '#627EEA' },
  { name: 'BSC', value: 25, color: '#F3BA2F' },
  { name: 'Polygon', value: 15, color: '#8247E5' },
  { name: 'Arbitrum', value: 8, color: '#28A0F0' },
  { name: 'Others', value: 7, color: '#6B7280' },
];

const DEPLOY_DATA = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  tokens: Math.floor(Math.random() * 5),
  contracts: Math.floor(Math.random() * 8),
  nfts: Math.floor(Math.random() * 20),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs border border-white/10">
        <div className="font-semibold mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="text-blue-400" size={24} />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Platform usage metrics, gas analytics, and deployment statistics
          </p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`tab-button text-xs ${timeRange === r ? 'active' : ''}`}
            >
              {r}
            </button>
          ))}
          <button className="btn-secondary text-xs h-8 ml-2"><RefreshCw size={12} /></button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Transactions', value: '1,247', change: '+12.4%', up: true, icon: <Activity size={16} />, color: 'text-purple-400' },
          { label: 'Gas Spent', value: '2.847 ETH', change: '+5.2%', up: true, icon: <Zap size={16} />, color: 'text-yellow-400' },
          { label: 'Contracts Deployed', value: '47', change: '+18.3%', up: true, icon: <Code2 size={16} />, color: 'text-blue-400' },
          { label: 'Avg Gas Price', value: '28 Gwei', change: '-15.1%', up: false, icon: <TrendingUp size={16} />, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-5">
            <div className={`flex items-center gap-2 mb-3 ${s.color}`}>{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            <div className={`flex items-center gap-1 text-xs ${s.up ? 'text-green-400' : 'text-red-400'}`}>
              {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {s.change} vs last period
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Transaction Volume */}
        <div className="col-span-2 glass-card p-5">
          <h2 className="font-semibold mb-4 text-sm">Transaction Volume (30 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TX_DATA}>
              <defs>
                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="transactions" stroke="#7C3AED" fill="url(#txGrad)" strokeWidth={2} name="Transactions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Network Distribution */}
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4 text-sm">Network Distribution</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={NETWORK_DIST} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {NETWORK_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {NETWORK_DIST.map(n => (
              <div key={n.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: n.color }} />
                  <span>{n.name}</span>
                </div>
                <span className="font-semibold">{n.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Gas Prices by Hour */}
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4 text-sm">Gas Prices by Hour (Gwei)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={GAS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#6B7280' }} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ethereum" stroke="#627EEA" strokeWidth={1.5} dot={false} name="Ethereum" />
              <Line type="monotone" dataKey="polygon" stroke="#8247E5" strokeWidth={1.5} dot={false} name="Polygon" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Deployments by Type */}
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4 text-sm">Deployments This Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEPLOY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tokens" fill="#7C3AED" name="Tokens" radius={[2, 2, 0, 0]} />
              <Bar dataKey="contracts" fill="#2563EB" name="Contracts" radius={[2, 2, 0, 0]} />
              <Bar dataKey="nfts" fill="#EC4899" name="NFTs" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-semibold text-sm">Top Activities This Month</h2>
        </div>
        <table className="crypto-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Network</th>
              <th>Count</th>
              <th>Gas Used</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { activity: 'Token Deployments', network: 'Ethereum / BSC', count: '23', gas: '0.847 ETH', status: 'Completed' },
              { activity: 'NFT Minting', network: 'Polygon / Ethereum', count: '892', gas: '0.234 ETH', status: 'Completed' },
              { activity: 'Contract Deployments', network: 'Multi-chain', count: '47', gas: '1.234 ETH', status: 'Completed' },
              { activity: 'Token Transfers', network: 'Ethereum', count: '285', gas: '0.532 ETH', status: 'Completed' },
            ].map(row => (
              <tr key={row.activity}>
                <td className="font-medium">{row.activity}</td>
                <td className="text-muted-foreground text-sm">{row.network}</td>
                <td className="font-semibold">{row.count}</td>
                <td className="font-mono text-yellow-400">{row.gas}</td>
                <td><span className="badge badge-green">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
