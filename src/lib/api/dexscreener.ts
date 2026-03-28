export interface DexScreenerPair {
  pairAddress: string;
  dexId: string;
  url: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: { h24: number; h6: number; h1: number; m5: number };
  priceChange: { m5: number; h1: number; h6: number; h24: number };
  liquidity: { usd: number; base: number; quote: number };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

export interface DexScreenerResponse {
  pairs: DexScreenerPair[] | null;
}

export async function fetchTokenPairs(address: string): Promise<DexScreenerPair[]> {
  if (!address || !address.startsWith('0x')) return [];
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${address}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return [];
    const data: DexScreenerResponse = await res.json();
    return data.pairs ?? [];
  } catch {
    return [];
  }
}

export function formatDexChange(value: number): { text: string; positive: boolean } {
  const positive = value >= 0;
  return {
    text: `${positive ? '+' : ''}${value.toFixed(2)}%`,
    positive,
  };
}
