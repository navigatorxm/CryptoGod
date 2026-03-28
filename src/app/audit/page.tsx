'use client';
import { Cpu, Construction } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-yellow-500/20">
          <Cpu size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Contract Auditor</h1>
        <span className="badge badge-yellow mb-4 inline-block">BETA — Coming Soon</span>
        <p className="text-muted-foreground max-w-md">
          AI-powered smart contract auditing with Slither integration, gas optimization reports, and automated vulnerability scanning.
        </p>
        <div className="mt-6 flex gap-2 justify-center flex-wrap">
          {['Slither Integration', 'Mythril Analysis', 'Gas Reports', 'Certora Specs', 'AI Review'].map(f => (
            <span key={f} className="badge badge-gray">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
