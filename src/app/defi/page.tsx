'use client';
import { Database } from 'lucide-react';

export default function DeFiPage() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-green-500/20">
          <Database size={32} className="text-green-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">DeFi Protocols</h1>
        <span className="badge badge-purple mb-4 inline-block">Version 2.0</span>
        <p className="text-muted-foreground max-w-md">Deploy Aave-like lending, Compound-style borrowing, and Yearn-inspired yield farming protocols with one-click configuration.</p>
      </div>
    </div>
  );
}
