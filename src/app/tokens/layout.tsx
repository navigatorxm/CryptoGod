import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Token Manager | CryptoGod',
  description: 'Deploy and manage ERC20, BEP20, TRC20, and SPL tokens with advanced tokenomics — taxes, reflection, auto-liquidity, and more.',
  openGraph: {
    title: 'Token Manager | CryptoGod',
    description: 'Deploy custom tokens on Ethereum, BSC, Polygon, Solana, and more with a single click.',
  },
};

export default function TokensLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
