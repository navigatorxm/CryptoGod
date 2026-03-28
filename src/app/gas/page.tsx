'use client';

import { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const GAS_SPEEDS = [
  { name: 'Slow', icon: '🐢', time: '5-10 min', multiplier: 0.8 },
  { name: 'Standard', icon: '🚶', time: '1-3 min', multiplier: 1.0 },
  { name: 'Fast', icon: '🏃', time: '30-60s', multiplier: 1.3 },
  { name: 'Instant', icon: '⚡', time: '<15s', multiplier: 1.8 },
];

const NETWORKS_GAS = [
  { name: 'Ethereum', symbol: 'ETH', baseFee: 22.5, priorityFee: 2.1, color: '#627EEA', icon: '⟠' },
  { name: 'BSC', symbol: 'BNB', baseFee: 3.0, priorityFee: 1.0, color: '#F3BA2F', icon: '⬡' },
  { name: 'Polygon', symbol: 'MATIC', baseFee: 45.2, priorityFee: 30.0, color: '#8247E5', icon: '⬡' },
  { name: 'Avalanche', symbol: 'AVAX', baseFee: 28.1, priorityFee: 1.5, color: '#E84142', icon: '△' },
  { name: 'Arbitrum', symbol: 'ETH', baseFee: 0.1, priorityFee: 0.01, color: '#28A0F0', icon: '◈' },
  { name: 'Optimism', symbol: 'ETH', baseFee: 0.05, priorityFee: 0.001, color: '#FF0420', icon: '⬤' },
];

const HISTORICAL_GAS = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  gwei: Math.floor(Math.random() * 60 + 15),
}));

const GAS_SAVING_TIPS = [
  { tip: 'Use EIP-1559 type 2 transactions for predictable fees', savings: 'Up to 20%', difficulty: 'Easy' },
  { tip: 'Batch multiple transfers in one transaction', savings: 'Up to 60%', difficulty: 'Medium' },
  { tip: 'Use Multicall contracts for reading data', savings: 'Up to 90%', difficulty: 'Medium' },
  { tip: 'Pack storage variables into single slots (< 32 bytes each)', savings: 'Up to 40%', difficulty: 'Hard' },
  { tip: 'Use events instead of storage for historical data', savings: 'Up to 80%', difficulty: 'Medium' },
  { tip: 'Use uint256 instead of smaller uints (EVM pads to 256)', savings: 'Up to 15%', difficulty: 'Easy' },
  { tip: 'Use calldata instead of memory for read-only function args', savings: 'Up to 30%', difficulty: 'Medium' },
  { tip: 'Avoid zero-to-nonzero storage writes (cold SSTORE = 20k gas)', savings: 'Significant', difficulty: 'Hard' },
  { tip: 'Use immutable/constant for values set once', savings: 'Up to 50%', difficulty: 'Easy' },
  { tip: 'Use short-circuit evaluation in boolean conditions', savings: 'Variable', difficulty: 'Easy' },
];

export default function GasPage() {
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS_GAS[0]);
  const [txValue, setTxValue] = useState('0.1');
  const [customGasLimit, setCustomGasLimit] = useState('21000');
  const [ethPrice, setEthPrice] = useState(3245.5);
  const [refreshing, setRefreshing] = useState(false);
  const [liveGas, setLiveGas] = useState(22.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveGas(prev => prev + (Math.random() - 0.5) * 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setLiveGas(20 + Math.random() * 30);
    setRefreshing(false);
    toast.success('Gas prices refreshed');
  };

  const calcCost = (multiplier: number, gasLimit = parseInt(customGasLimit)) => {
    const gwei = liveGas * multiplier;
    const eth = (gwei * gasLimit * 1e-9);
    const usd = eth * ethPrice;
    return { gwei: gwei.toFixed(2), eth: eth.toFixed(6), usd: usd.toFixed(4) };
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="text-yellow-400" size={24} />
            Gas Optimizer
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time gas prices, cost estimation, and optimization strategies</p>
        </div>
        <button onClick={refresh} disabled={refreshing} className="btn-secondary">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Live Gas Prices by Network */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {NETWORKS_GAS.map(network => (
          <button
            key={network.name}
            onClick={() => setSelectedNetwork(network)}
            className={`glass-card p-4 text-left transition-all border ${selectedNetwork.name === network.name ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-white/5 hover:border-white/10'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: network.color }} className="text-lg">{network.icon}</span>
              <span className="font-semibold text-sm">{network.name}</span>
              <span className="ml-auto flex items-center gap-1 text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 live-indicator" />
                Live
              </span>
            </div>
            <div className="text-xl font-bold">{network.baseFee.toFixed(1)} <span className="text-sm text-muted-foreground">Gwei</span></div>
            <div className="text-xs text-muted-foreground mt-1">Priority: +{network.priorityFee.toFixed(1)} Gwei</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Cost Calculator */}
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-green-400" />
            Transaction Cost Calculator
          </h2>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Network</label>
              <select
                value={selectedNetwork.name}
                onChange={(e) => setSelectedNetwork(NETWORKS_GAS.find(n => n.name === e.target.value) || NETWORKS_GAS[0])}
                className="crypto-input text-sm h-9"
              >
                {NETWORKS_GAS.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Gas Limit</label>
                <input type="number" value={customGasLimit} onChange={(e) => setCustomGasLimit(e.target.value)} className="crypto-input text-sm h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">ETH Price (USD)</label>
                <input type="number" value={ethPrice} onChange={(e) => setEthPrice(parseFloat(e.target.value))} className="crypto-input text-sm h-9" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {GAS_SPEEDS.map(speed => {
              const cost = calcCost(speed.multiplier);
              return (
                <div key={speed.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{speed.icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{speed.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />{speed.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">{cost.gwei} Gwei</div>
                    <div className="text-xs text-yellow-400">${cost.usd}</div>
                    <div className="text-[10px] text-muted-foreground">{cost.eth} ETH</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gas History Chart */}
        <div className="glass-card p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            24h Gas History — Ethereum
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={HISTORICAL_GAS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#6B7280' }} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} unit=" Gwei" />
              <Tooltip
                contentStyle={{ background: 'hsl(240 10% 11%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                formatter={(v) => [`${v} Gwei`, 'Gas Price']}
              />
              <Line type="monotone" dataKey="gwei" stroke="#F59E0B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-3 gap-3 text-center">
            {[
              { label: 'Current', value: `${liveGas.toFixed(1)} Gwei`, color: 'text-yellow-400' },
              { label: '24h Low', value: '15.2 Gwei', color: 'text-green-400' },
              { label: '24h High', value: '78.5 Gwei', color: 'text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-2 rounded-lg bg-white/[0.02]">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className={`font-semibold text-sm ${color}`}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gas Optimization Tips */}
      <div className="glass-card p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-400" />
          Gas Optimization Techniques
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {GAS_SAVING_TIPS.map(({ tip, savings, difficulty }) => (
            <div key={tip} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{tip}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-green-400 font-semibold">Save: {savings}</span>
                  <span className={`badge text-[9px] ${difficulty === 'Easy' ? 'badge-green' : difficulty === 'Medium' ? 'badge-yellow' : 'badge-red'}`}>
                    {difficulty}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
