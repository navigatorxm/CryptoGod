/**
 * Master admin wallets for CryptoGod Dashboard.
 * All listed wallets have full admin access:
 *   - Marketing/tax fees routed to ADMIN_WALLET (primary)
 *   - Admin UI unlocked when any of ADMIN_WALLETS connects
 *   - Full mint/burn/pause rights on deployed contracts (via onlyOwner)
 */

/** Primary wallet — receives marketing fees from all deployed tokens */
export const ADMIN_WALLET = (
  process.env.NEXT_PUBLIC_ADMIN_WALLET ?? '0x85D697bC39a61f25a4075eD834B82b4d2Cc41c40'
).toLowerCase();

/** All wallets with admin UI access */
export const ADMIN_WALLETS: string[] = [
  '0x85D697bC39a61f25a4075eD834B82b4d2Cc41c40',
  '0x3724A3179657c0aD23Eb3Fb4F7e2F176f490280e',
  ...(process.env.NEXT_PUBLIC_ADMIN_WALLET ? [process.env.NEXT_PUBLIC_ADMIN_WALLET] : []),
  ...(process.env.NEXT_PUBLIC_ADMIN_WALLET_2 ? [process.env.NEXT_PUBLIC_ADMIN_WALLET_2] : []),
].map((a) => a.toLowerCase()).filter((a, i, arr) => arr.indexOf(a) === i); // dedupe

/** Returns true if the given address has admin access. */
export function isAdminWallet(address: string | undefined | null): boolean {
  if (!address) return false;
  return ADMIN_WALLETS.includes(address.toLowerCase());
}
