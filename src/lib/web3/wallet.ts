import { BrowserProvider, JsonRpcProvider, JsonRpcSigner, formatEther } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      selectedAddress?: string;
      chainId?: string;
    };
    solana?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      isPhantom?: boolean;
      publicKey?: { toString: () => string };
    };
    tronWeb?: {
      defaultAddress?: { base58?: string; hex?: string };
      ready?: boolean;
    };
  }
}

export interface WalletConnection {
  address: string;
  chainId: number;
  balance: string;
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  walletType: 'metamask' | 'coinbase' | 'injected';
}

export async function connectMetaMask(): Promise<WalletConnection> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed. Please install MetaMask extension.');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  }) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found. Please unlock MetaMask.');
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();
  const balance = await provider.getBalance(accounts[0]);

  const walletType = window.ethereum.isCoinbaseWallet ? 'coinbase' : 'metamask';

  return {
    address: accounts[0],
    chainId: Number(network.chainId),
    balance: formatEther(balance),
    provider,
    signer,
    walletType,
  };
}

export async function switchChain(chainId: number): Promise<void> {
  if (!window.ethereum) throw new Error('No wallet connected');

  const hexChainId = `0x${chainId.toString(16)}`;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 4902) {
      // Chain not added, need to add it first
      throw new Error(`Chain ${chainId} not configured in wallet. Please add it manually.`);
    }
    throw error;
  }
}

export async function addChain(chainConfig: {
  chainId: number;
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}): Promise<void> {
  if (!window.ethereum) throw new Error('No wallet connected');

  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: `0x${chainConfig.chainId.toString(16)}`,
      chainName: chainConfig.chainName,
      nativeCurrency: chainConfig.nativeCurrency,
      rpcUrls: chainConfig.rpcUrls,
      blockExplorerUrls: chainConfig.blockExplorerUrls,
    }],
  });
}

export async function getBalance(address: string, rpcUrl: string): Promise<string> {
  const provider = new JsonRpcProvider(rpcUrl);
  const balance = await provider.getBalance(address);
  return formatEther(balance);
}

export async function getConnectedAddress(): Promise<string | null> {
  if (!window.ethereum) return null;
  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  }) as string[];
  return accounts.length > 0 ? accounts[0] : null;
}

export async function getChainId(): Promise<number | null> {
  if (!window.ethereum) return null;
  const chainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
  return parseInt(chainId, 16);
}

export function onAccountChanged(handler: (accounts: string[]) => void): () => void {
  if (!window.ethereum) return () => {};
  window.ethereum.on('accountsChanged', handler as (...args: unknown[]) => void);
  return () => window.ethereum?.removeListener('accountsChanged', handler as (...args: unknown[]) => void);
}

export function onChainChanged(handler: (chainId: string) => void): () => void {
  if (!window.ethereum) return () => {};
  window.ethereum.on('chainChanged', handler as (...args: unknown[]) => void);
  return () => window.ethereum?.removeListener('chainChanged', handler as (...args: unknown[]) => void);
}

export async function signMessage(message: string, signer: JsonRpcSigner): Promise<string> {
  return signer.signMessage(message);
}

export async function personalSign(message: string): Promise<string> {
  if (!window.ethereum) throw new Error('No wallet connected');
  const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
  if (!accounts.length) throw new Error('No account connected');

  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [message, accounts[0]],
  }) as string;

  return signature;
}

// Solana wallet connection
export async function connectPhantom(): Promise<{ publicKey: string }> {
  if (!window.solana?.isPhantom) {
    throw new Error('Phantom wallet not found. Please install Phantom extension.');
  }

  const response = await window.solana.connect();
  return { publicKey: response.publicKey.toString() };
}

// TronLink connection
export async function connectTronLink(): Promise<{ address: string }> {
  if (!window.tronWeb?.ready) {
    throw new Error('TronLink not found or not ready. Please install TronLink extension.');
  }

  const address = window.tronWeb.defaultAddress?.base58;
  if (!address) throw new Error('No TronLink account found');

  return { address };
}

export function formatWalletError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('user rejected')) return 'Transaction rejected by user';
    if (error.message.includes('insufficient funds')) return 'Insufficient funds for gas';
    if (error.message.includes('nonce')) return 'Transaction nonce error - please reset MetaMask';
    return error.message;
  }
  return 'Unknown wallet error';
}
