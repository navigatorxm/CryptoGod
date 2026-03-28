'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function TokensError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Tokens page error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[50vh]">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-300">
        <AlertTriangle size={24} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">Token Manager error</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{error.message}</p>
      </div>
      <button onClick={reset} className="btn-primary text-sm h-10 px-5">
        <RefreshCw size={14} /> Try again
      </button>
    </div>
  );
}
