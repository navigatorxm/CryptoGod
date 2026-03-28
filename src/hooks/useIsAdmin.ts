'use client';

import { useWalletStore } from '@/store';
import { isAdminWallet } from '@/lib/constants/admin';

/**
 * Returns true when the currently connected wallet is the master admin wallet.
 * Use this to conditionally render admin-only UI.
 */
export function useIsAdmin(): boolean {
  const address = useWalletStore((s) => s.address);
  return isAdminWallet(address);
}
