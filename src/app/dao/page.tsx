'use client';
import { Users } from 'lucide-react';

export default function DAOPage() {
  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-cyan-500/20">
          <Users size={32} className="text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">DAO Governance</h1>
        <span className="badge badge-purple mb-4 inline-block">Version 2.0</span>
        <p className="text-muted-foreground max-w-md">Deploy OpenZeppelin Governor-based DAOs with custom voting power, proposal thresholds, quorum requirements, and timelock execution.</p>
      </div>
    </div>
  );
}
