import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CryptoGod — Web3 Development Suite',
  description:
    'All-in-one platform for blockchain development, multi-chain token creation, smart contract deployment, NFT management, and Web3 education.',
  keywords: ['web3', 'blockchain', 'ethereum', 'solidity', 'nft', 'defi', 'smart contracts'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          containerStyle={{ bottom: 24, right: 16 }}
          toastOptions={{
            style: {
              background: 'hsl(240 10% 11%)',
              color: 'hsl(0 0% 95%)',
              border: '1px solid hsl(240 5% 22%)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: 'hsl(240 10% 11%)',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: 'hsl(240 10% 11%)',
              },
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
