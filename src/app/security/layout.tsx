import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Hub | CryptoGod',
  description: 'Protect your smart contracts and wallets. Learn about reentrancy, flash loans, oracle manipulation, and other DeFi attack vectors.',
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
