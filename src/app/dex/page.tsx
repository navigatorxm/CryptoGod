'use client';
import { TrendingUp } from 'lucide-react';

export default function DEXPage() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-blue-500/20">
          <TrendingUp size={32} className="text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">DEX Platform</h1>
        <span className="badge badge-purple mb-4 inline-block">Version 2.0</span>
        <p className="text-muted-foreground max-w-md">Build and deploy Uniswap v2/v3 compatible AMM DEXes with custom fee structures and liquidity management.</p>
      </div>
    </div>
  );
}
