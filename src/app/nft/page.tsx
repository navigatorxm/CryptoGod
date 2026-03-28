'use client';

import { useState } from 'react';
import {
  Image,
  Plus,
  Upload,
  Zap,
  CheckCircle2,
  ExternalLink,
  Layers,
  Settings,
  DollarSign,
  Eye,
  Globe,
  Star,
  RefreshCw,
  X,
  Copy,
} from 'lucide-react';
import { NFTCollection, NFTConfig, NFTAttribute } from '@/types';
import { useNFTStore } from '@/store';
import { NETWORKS } from '@/lib/constants/networks';
import { formatAddress, formatTimeAgo } from '@/lib/utils/formatting';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

type Tab = 'collections' | 'mint-single' | 'mint-collection' | 'marketplace';

const MOCK_COLLECTIONS: NFTCollection[] = [
  {
    id: '1',
    name: 'CryptoApes Genesis',
    symbol: 'CAG',
    description: 'The original CryptoApes collection featuring 10,000 unique hand-drawn apes on Ethereum.',
    contractAddress: '0xAbCd1234567890ABCD1234567890abCd12345678',
    network: 'ethereum',
    standard: 'ERC721',
    maxSupply: 10000,
    mintPrice: '0.08',
    royaltyBps: 500,
    royaltyRecipient: '0xRoyaltyAddress1234',
    revealed: true,
    totalMinted: 7842,
    features: { ownable: true, upgradeable: false, pausable: true, enumerable: true, uriStorage: true, burnable: true, royalties: true, reveal: true, whitelist: true, publicMint: true, freeMint: false, multiSig: false, timelocked: false },
    deployedAt: new Date(Date.now() - 86400000 * 45),
  },
  {
    id: '2',
    name: 'Digital Dragons',
    symbol: 'DDRG',
    description: 'Polygon-based 5,000 piece dragon NFT collection with staking rewards.',
    contractAddress: '0xDef5678901234ABCD5678901234def56789012',
    network: 'polygon',
    standard: 'ERC721',
    maxSupply: 5000,
    mintPrice: '50',
    royaltyBps: 750,
    royaltyRecipient: '0xRoyaltyAddress5678',
    revealed: false,
    totalMinted: 1230,
    features: { ownable: true, upgradeable: false, pausable: true, enumerable: true, uriStorage: true, burnable: false, royalties: true, reveal: true, whitelist: true, publicMint: false, freeMint: false, multiSig: false, timelocked: false },
    deployedAt: new Date(Date.now() - 86400000 * 10),
  },
];

const MARKETPLACE_INTEGRATIONS = [
  { name: 'OpenSea', logo: '🌊', url: 'https://opensea.io', chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche'], status: 'active' },
  { name: 'Magic Eden', logo: '✨', url: 'https://magiceden.io', chains: ['Solana', 'Ethereum', 'Polygon', 'Bitcoin'], status: 'active' },
  { name: 'Blur', logo: '💨', url: 'https://blur.io', chains: ['Ethereum'], status: 'active' },
  { name: 'LooksRare', logo: '👀', url: 'https://looksrare.org', chains: ['Ethereum', 'BNB Chain'], status: 'active' },
  { name: 'Rarible', logo: '🎨', url: 'https://rarible.com', chains: ['Ethereum', 'Tezos', 'Polygon', 'Immutable'], status: 'active' },
  { name: 'Foundation', logo: '🏛️', url: 'https://foundation.app', chains: ['Ethereum'], status: 'invite-only' },
];

export default function NFTPage() {
  const [activeTab, setActiveTab] = useState<Tab>('collections');
  const { collections: storeCollections, addCollection, nfts, addNFT } = useNFTStore();
  const [deploying, setDeploying] = useState(false);
  const [minting, setMinting] = useState(false);

  // Single NFT mint form
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftImageUrl, setNftImageUrl] = useState('');
  const [nftNetwork, setNftNetwork] = useState('ethereum');
  const [nftRecipient, setNftRecipient] = useState('');
  const [attributes, setAttributes] = useState<NFTAttribute[]>([
    { trait_type: 'Background', value: '' },
    { trait_type: 'Eyes', value: '' },
  ]);

  // Collection form
  const [collName, setCollName] = useState('');
  const [collSymbol, setCollSymbol] = useState('');
  const [collDesc, setCollDesc] = useState('');
  const [collMaxSupply, setCollMaxSupply] = useState('10000');
  const [collMintPrice, setCollMintPrice] = useState('0.05');
  const [collRoyalty, setCollRoyalty] = useState('500');
  const [collNetwork, setCollNetwork] = useState('sepolia');
  const [collRevealed, setCollRevealed] = useState(false);
  const [collWhitelist, setCollWhitelist] = useState(false);

  const allCollections = [...MOCK_COLLECTIONS, ...storeCollections];

  const handleMintSingle = async () => {
    if (!nftName.trim()) { toast.error('NFT name required'); return; }
    setMinting(true);
    await new Promise(r => setTimeout(r, 2000));
    const nft: NFTConfig = {
      id: uuidv4(),
      name: nftName,
      description: nftDescription,
      image: nftImageUrl,
      attributes,
      network: nftNetwork as any,
      standard: 'ERC721',
      mintedAt: new Date(),
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      tokenId: String(Math.floor(Math.random() * 10000)),
      ipfsHash: `Qm${Math.random().toString(36).slice(2, 48)}`,
    };
    addNFT(nft);
    setMinting(false);
    toast.success(`NFT "${nftName}" minted successfully!`);
    setNftName(''); setNftDescription(''); setNftImageUrl('');
  };

  const handleDeployCollection = async () => {
    if (!collName.trim()) { toast.error('Collection name required'); return; }
    setDeploying(true);
    await new Promise(r => setTimeout(r, 3000));
    const collection: NFTCollection = {
      id: uuidv4(),
      name: collName,
      symbol: collSymbol || collName.slice(0, 4).toUpperCase(),
      description: collDesc,
      network: collNetwork as any,
      standard: 'ERC721',
      maxSupply: parseInt(collMaxSupply),
      mintPrice: collMintPrice,
      royaltyBps: parseInt(collRoyalty),
      royaltyRecipient: '0xYourWalletAddress',
      revealed: collRevealed,
      totalMinted: 0,
      features: { ownable: true, upgradeable: false, pausable: true, enumerable: true, uriStorage: true, burnable: true, royalties: true, reveal: !collRevealed, whitelist: collWhitelist, publicMint: true, freeMint: false, multiSig: false, timelocked: false },
      contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
      deployedAt: new Date(),
    };
    addCollection(collection);
    setDeploying(false);
    setActiveTab('collections');
    toast.success(`Collection "${collName}" deployed!`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Image className="text-pink-400" size={24} />
            NFT Studio
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Mint single NFTs, deploy collections, manage royalties, and integrate with marketplaces
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActiveTab('mint-single')} className="btn-secondary">
            <Plus size={14} /> Mint NFT
          </button>
          <button onClick={() => setActiveTab('mint-collection')} className="btn-primary">
            <Layers size={14} /> Deploy Collection
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Collections', value: allCollections.length, color: 'text-pink-400' },
          { label: 'Total Minted', value: allCollections.reduce((a, c) => a + c.totalMinted, 0).toLocaleString(), color: 'text-purple-400' },
          { label: 'With Royalties', value: allCollections.filter(c => c.royaltyBps > 0).length, color: 'text-green-400' },
          { label: 'Floor Value', value: '$2.4M', color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-white/[0.04] border border-white/[0.06]">
        {(['collections', 'mint-single', 'mint-collection', 'marketplace'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button ${activeTab === tab ? 'active' : ''}`}>
            {tab === 'collections' ? 'My Collections' :
             tab === 'mint-single' ? 'Mint Single NFT' :
             tab === 'mint-collection' ? 'Deploy Collection' : 'Marketplace'}
          </button>
        ))}
      </div>

      {/* Collections */}
      {activeTab === 'collections' && (
        <div className="space-y-4">
          {allCollections.map(coll => {
            const network = NETWORKS[coll.network];
            const progress = (coll.totalMinted / coll.maxSupply) * 100;
            return (
              <div key={coll.id} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
                  >
                    🖼️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base">{coll.name}</span>
                      <span className="text-xs text-muted-foreground">({coll.symbol})</span>
                      {coll.revealed ? <span className="badge badge-green text-[9px]">REVEALED</span> : <span className="badge badge-yellow text-[9px]">HIDDEN</span>}
                      <span className="badge badge-blue text-[9px]">{coll.standard}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{coll.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-3">
                      <div>
                        <div className="text-muted-foreground">Minted</div>
                        <div className="font-semibold">{coll.totalMinted.toLocaleString()} / {coll.maxSupply.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Mint Price</div>
                        <div className="font-semibold">{coll.mintPrice} {network?.symbol}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Royalty</div>
                        <div className="font-semibold">{(coll.royaltyBps / 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Network</div>
                        <div className="font-semibold flex items-center gap-1" style={{ color: network?.color }}>{network?.icon} {network?.name}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Mint Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!coll.revealed && (
                      <button
                        onClick={async () => {
                          toast.success(`${coll.name} revealed!`);
                        }}
                        className="btn-primary text-xs h-8 px-3"
                      >
                        <Eye size={12} /> Reveal
                      </button>
                    )}
                    <button className="btn-secondary text-xs h-8 px-3">
                      <Settings size={12} /> Manage
                    </button>
                    {coll.contractAddress && network && (
                      <a
                        href={`${network.explorerUrl}/address/${coll.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs h-8 px-3 text-center justify-center"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {allCollections.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Image size={40} className="mx-auto text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground">No collections deployed yet.</p>
              <button onClick={() => setActiveTab('mint-collection')} className="btn-primary mt-4">
                <Layers size={14} /> Deploy First Collection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mint Single NFT */}
      {activeTab === 'mint-single' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="font-semibold">Mint Single NFT</h2>
            <div>
              <label className="block text-sm font-medium mb-2">NFT Name <span className="text-red-400">*</span></label>
              <input value={nftName} onChange={e => setNftName(e.target.value)} placeholder="e.g. Cosmic Ape #001" className="crypto-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea value={nftDescription} onChange={e => setNftDescription(e.target.value)} placeholder="Describe your NFT..." className="crypto-input resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Image URL / IPFS</label>
              <input value={nftImageUrl} onChange={e => setNftImageUrl(e.target.value)} placeholder="https://... or ipfs://..." className="crypto-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Recipient Address</label>
              <input value={nftRecipient} onChange={e => setNftRecipient(e.target.value)} placeholder="0x... (leave empty for your wallet)" className="crypto-input" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Network</label>
              <select value={nftNetwork} onChange={e => setNftNetwork(e.target.value)} className="crypto-input">
                {Object.values(NETWORKS).map(n => (
                  <option key={n.shortName} value={n.shortName}>{n.name}</option>
                ))}
              </select>
            </div>
            {/* Attributes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Attributes (Traits)</label>
                <button onClick={() => setAttributes(a => [...a, { trait_type: '', value: '' }])} className="text-xs text-purple-400 hover:underline">+ Add Trait</button>
              </div>
              <div className="space-y-2">
                {attributes.map((attr, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      placeholder="Trait type (e.g. Eyes)"
                      value={attr.trait_type}
                      onChange={e => setAttributes(prev => prev.map((a, j) => j === i ? { ...a, trait_type: e.target.value } : a))}
                      className="crypto-input flex-1"
                    />
                    <input
                      placeholder="Value"
                      value={String(attr.value)}
                      onChange={e => setAttributes(prev => prev.map((a, j) => j === i ? { ...a, value: e.target.value } : a))}
                      className="crypto-input flex-1"
                    />
                    <button onClick={() => setAttributes(a => a.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleMintSingle} disabled={minting} className="btn-primary w-full justify-center py-3">
              {minting ? <><div className="spinner w-4 h-4" /> Minting...</> : <><Zap size={16} /> Mint NFT</>}
            </button>
          </div>

          {/* Preview */}
          <div>
            <h2 className="font-semibold mb-4">Preview</h2>
            <div className="glass-card p-4 rounded-2xl">
              <div
                className="aspect-square rounded-xl mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6, #2563EB)' }}
              >
                {nftImageUrl ? (
                  <img src={nftImageUrl} alt="NFT Preview" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center">
                    <Image size={48} className="mx-auto text-white/50 mb-2" />
                    <p className="text-white/50 text-sm">Image Preview</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="font-bold">{nftName || 'NFT Name'}</div>
                <p className="text-xs text-muted-foreground">{nftDescription || 'NFT description will appear here'}</p>
                {attributes.filter(a => a.trait_type && a.value).length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1.5">Traits</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {attributes.filter(a => a.trait_type && a.value).map((attr, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-center">
                          <div className="text-[9px] text-muted-foreground uppercase">{attr.trait_type}</div>
                          <div className="text-xs font-semibold">{String(attr.value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent mints */}
            {nfts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2">Recently Minted</h3>
                <div className="space-y-2">
                  {nfts.slice(0, 3).map(nft => (
                    <div key={nft.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-xs font-bold">NFT</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{nft.name}</div>
                        <div className="text-[10px] text-muted-foreground">#{nft.tokenId}</div>
                      </div>
                      <CheckCircle2 size={12} className="text-green-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deploy Collection */}
      {activeTab === 'mint-collection' && (
        <div className="space-y-5">
          <h2 className="font-semibold">Deploy NFT Collection</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Collection Name <span className="text-red-400">*</span></label>
                  <input value={collName} onChange={e => setCollName(e.target.value)} placeholder="My NFT Collection" className="crypto-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Symbol</label>
                  <input value={collSymbol} onChange={e => setCollSymbol(e.target.value.toUpperCase())} placeholder="MNC" className="crypto-input" maxLength={8} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={collDesc} onChange={e => setCollDesc(e.target.value)} placeholder="Describe your collection..." className="crypto-input resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Max Supply</label>
                  <input type="number" value={collMaxSupply} onChange={e => setCollMaxSupply(e.target.value)} className="crypto-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mint Price (ETH)</label>
                  <input type="number" step="0.001" value={collMintPrice} onChange={e => setCollMintPrice(e.target.value)} className="crypto-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Royalty (BPS)</label>
                  <input type="number" min="0" max="1000" value={collRoyalty} onChange={e => setCollRoyalty(e.target.value)} className="crypto-input" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">{(parseInt(collRoyalty) / 100).toFixed(1)}% per sale</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Network</label>
                <select value={collNetwork} onChange={e => setCollNetwork(e.target.value)} className="crypto-input">
                  {Object.values(NETWORKS).map(n => (
                    <option key={n.shortName} value={n.shortName}>{n.name} {n.isTestnet ? '(Testnet)' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'collRevealed', label: 'Start Revealed', desc: 'Metadata visible immediately', value: collRevealed, set: setCollRevealed },
                  { key: 'collWhitelist', label: 'Whitelist Phase', desc: 'Restricted minting initially', value: collWhitelist, set: setCollWhitelist },
                ].map(({ key, label, desc, value, set }) => (
                  <div
                    key={key}
                    onClick={() => set(!value)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${value ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/5 bg-white/[0.02]'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{label}</span>
                      <div className={`w-9 h-5 rounded-full relative transition-colors ${value ? 'bg-purple-600' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-4' : 'left-0.5'}`} />
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
              <button onClick={handleDeployCollection} disabled={deploying} className="btn-primary w-full justify-center py-3">
                {deploying ? <><div className="spinner w-4 h-4" /> Deploying...</> : <><Zap size={16} /> Deploy Collection</>}
              </button>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Included Features</h3>
              <div className="glass-card p-4 space-y-2">
                {[
                  { label: 'ERC721 Standard', desc: 'Non-fungible tokens on Ethereum' },
                  { label: 'EIP-2981 Royalties', desc: `${(parseInt(collRoyalty) / 100).toFixed(1)}% on secondary sales` },
                  { label: 'Reveal Mechanism', desc: collRevealed ? 'Revealed from mint' : 'Hidden until you reveal' },
                  { label: 'Whitelist Phase', desc: collWhitelist ? 'Whitelist-only initially' : 'Public minting from start' },
                  { label: 'Pausable', desc: 'Emergency transfer pause' },
                  { label: 'Enumerable', desc: 'Token enumeration support' },
                  { label: 'Burnable', desc: 'Holders can burn their NFTs' },
                  { label: 'Auto-Verification', desc: 'Source verified on block explorer' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <h2 className="font-semibold">Marketplace Integrations</h2>
          <div className="grid grid-cols-2 gap-4">
            {MARKETPLACE_INTEGRATIONS.map(mp => (
              <div key={mp.name} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mp.logo}</span>
                    <div>
                      <div className="font-bold">{mp.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {mp.status === 'active' ? '✓ Supported' : 'Invite Only'}
                      </div>
                    </div>
                  </div>
                  <a href={mp.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs h-8 px-3">
                    <ExternalLink size={12} /> Visit
                  </a>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {mp.chains.map(chain => (
                    <span key={chain} className="badge badge-purple text-[10px]">{chain}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-green-400" />
              Royalty Tracking
            </h3>
            <div className="overflow-x-auto">
              <table className="crypto-table">
                <thead>
                  <tr>
                    <th>Collection</th>
                    <th>Marketplace</th>
                    <th>Secondary Sales</th>
                    <th>Royalties Earned</th>
                    <th>Royalty %</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_COLLECTIONS.map(coll => (
                    <tr key={coll.id}>
                      <td className="font-medium">{coll.name}</td>
                      <td>OpenSea, Blur</td>
                      <td className="font-mono">{Math.floor(Math.random() * 500 + 100)}</td>
                      <td className="text-green-400 font-mono">{(Math.random() * 10).toFixed(3)} ETH</td>
                      <td>{(coll.royaltyBps / 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
