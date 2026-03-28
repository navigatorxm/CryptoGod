import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staking | CryptoGod',
  description: 'Stake tokens, earn passive rewards, and grow your crypto portfolio. Flexible and locked staking pools across multiple chains.',
  openGraph: {
    title: 'Staking | CryptoGod',
    description: 'Earn passive rewards by staking your tokens across multiple blockchain networks.',
  },
};

export default function StakingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
