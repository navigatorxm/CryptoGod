'use client';
import { Globe } from 'lucide-react';

export default function DAppsPage() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-purple-500/20">
          <Globe size={32} className="text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">DApp Builder</h1>
        <span className="badge badge-purple mb-4 inline-block">Version 2.0</span>
        <p className="text-muted-foreground max-w-md">Visual DApp creator with frontend integration, wallet connection components, and one-click deployment to IPFS/Vercel.</p>
      </div>
    </div>
  );
}
