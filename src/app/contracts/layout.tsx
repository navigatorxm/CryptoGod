import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contract Deployer | CryptoGod',
  description: 'Deploy ERC721, ERC1155, governance, and custom smart contracts across multiple chains with one-click deployment.',
};

export default function ContractsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
