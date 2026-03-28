import { formatUnits, parseUnits } from 'ethers';

export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatAmount(
  amount: string | bigint,
  decimals = 18,
  displayDecimals = 4
): string {
  try {
    const formatted = formatUnits(BigInt(amount.toString()), decimals);
    const num = parseFloat(formatted);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals,
    });
  } catch {
    return '0';
  }
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatGwei(wei: bigint | string): string {
  try {
    const gwei = Number(formatUnits(BigInt(wei.toString()), 9));
    return `${gwei.toFixed(2)} Gwei`;
  } catch {
    return '0 Gwei';
  }
}

export function formatEth(wei: bigint | string, symbol = 'ETH'): string {
  try {
    const eth = formatUnits(BigInt(wei.toString()), 18);
    const num = parseFloat(eth);
    return `${num.toFixed(6)} ${symbol}`;
  } catch {
    return `0 ${symbol}`;
  }
}

export function formatTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatTimeAgo(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatTimestamp(date);
}

export function formatTxHash(hash: string, chars = 8): string {
  if (!hash) return '';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function formatNumber(num: number | string, decimals = 2): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  if (n >= 1e9) return `${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(decimals)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(decimals)}K`;
  return n.toFixed(decimals);
}

export function parseAmount(amount: string, decimals = 18): bigint {
  try {
    return parseUnits(amount, decimals);
  } catch {
    return BigInt(0);
  }
}

export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}

export function isValidTxHash(hash: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(hash);
}

export function getExplorerTxUrl(network: string, hash: string): string {
  const explorers: Record<string, string> = {
    ethereum: 'https://etherscan.io/tx/',
    sepolia: 'https://sepolia.etherscan.io/tx/',
    bsc: 'https://bscscan.com/tx/',
    'bsc-testnet': 'https://testnet.bscscan.com/tx/',
    polygon: 'https://polygonscan.com/tx/',
    'polygon-amoy': 'https://www.oklink.com/amoy/tx/',
    avalanche: 'https://snowtrace.io/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    optimism: 'https://optimistic.etherscan.io/tx/',
    solana: 'https://solscan.io/tx/',
    'solana-devnet': 'https://solscan.io/tx/?cluster=devnet',
    tron: 'https://tronscan.org/#/transaction/',
    'tron-shasta': 'https://shasta.tronscan.org/#/transaction/',
  };
  return `${explorers[network] || 'https://etherscan.io/tx/'}${hash}`;
}

export function getExplorerAddressUrl(network: string, address: string): string {
  const explorers: Record<string, string> = {
    ethereum: 'https://etherscan.io/address/',
    sepolia: 'https://sepolia.etherscan.io/address/',
    bsc: 'https://bscscan.com/address/',
    'bsc-testnet': 'https://testnet.bscscan.com/address/',
    polygon: 'https://polygonscan.com/address/',
    avalanche: 'https://snowtrace.io/address/',
    arbitrum: 'https://arbiscan.io/address/',
    optimism: 'https://optimistic.etherscan.io/address/',
    solana: 'https://solscan.io/account/',
    tron: 'https://tronscan.org/#/address/',
  };
  return `${explorers[network] || 'https://etherscan.io/address/'}${address}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateColorFromAddress(address: string): string {
  const colors = [
    '#7C3AED', '#2563EB', '#10B981', '#F59E0B',
    '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6',
  ];
  const hash = address
    .slice(2, 8)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
