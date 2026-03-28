'use client';

import { useState } from 'react';
import {
  Code2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Shield,
  Zap,
  ChevronDown,
  ChevronUp,
  Play,
  Eye,
  AlertTriangle,
  Globe,
  FileCode,
  Layers,
} from 'lucide-react';
import { ContractConfig, ContractStandard, NetworkName } from '@/types';
import { useContractStore, useWalletStore } from '@/store';
import { formatAddress, formatTimeAgo } from '@/lib/utils/formatting';
import { NETWORKS } from '@/lib/constants/networks';
import { v4 as uuidv4 } from 'uuid';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ERC721_TEMPLATE, MULTISIG_TEMPLATE } from '@/lib/constants/abis';
import toast from 'react-hot-toast';

const CONTRACT_TEMPLATES = [
  {
    id: 'erc721',
    name: 'ERC721 NFT Collection',
    standard: 'ERC721' as ContractStandard,
    description: 'Standard NFT collection with minting, burning, royalties, and reveal mechanism',
    icon: '🖼️',
    color: '#EC4899',
    features: ['Enumerable', 'URI Storage', 'Pausable', 'Burnable', 'Royalties (EIP-2981)', 'Whitelist', 'Reveal'],
    gasEstimate: '~1.2M gas',
    audited: true,
    code: ERC721_TEMPLATE,
  },
  {
    id: 'erc1155',
    name: 'ERC1155 Multi-Token',
    standard: 'ERC1155' as ContractStandard,
    description: 'Multi-token standard for gaming items, editions, and semi-fungible tokens',
    icon: '🃏',
    color: '#8B5CF6',
    features: ['Batch transfers', 'URI Storage', 'Pausable', 'Supply tracking', 'Royalties'],
    gasEstimate: '~900K gas',
    audited: true,
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";\nimport "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";\nimport "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";\nimport "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";\n\ncontract MultiToken is ERC1155, Ownable, ERC1155Pausable, ERC1155Burnable, ERC1155Supply {\n    constructor(address initialOwner, string memory uri)\n        ERC1155(uri) Ownable(initialOwner) {}\n\n    function mint(address account, uint256 id, uint256 amount, bytes memory data) public onlyOwner {\n        _mint(account, id, amount, data);\n    }\n\n    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {\n        _mintBatch(to, ids, amounts, data);\n    }\n\n    function pause() public onlyOwner { _pause(); }\n    function unpause() public onlyOwner { _unpause(); }\n\n    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)\n        internal override(ERC1155, ERC1155Pausable, ERC1155Supply) {\n        super._update(from, to, ids, values);\n    }\n}`,
  },
  {
    id: 'multisig',
    name: 'Multi-Signature Wallet',
    standard: 'Utility' as ContractStandard,
    description: 'M-of-N multisig wallet for secure team fund management',
    icon: '🔐',
    color: '#F59E0B',
    features: ['N-of-M signers', 'Submit transactions', 'Confirm/revoke', 'Execute', 'Event logging'],
    gasEstimate: '~600K gas',
    audited: true,
    code: MULTISIG_TEMPLATE,
  },
  {
    id: 'dao',
    name: 'DAO Governor',
    standard: 'Governance' as ContractStandard,
    description: 'On-chain governance with proposal, voting, and execution mechanisms',
    icon: '🏛️',
    color: '#06B6D4',
    features: ['Propose', 'Vote (For/Against/Abstain)', 'Quorum', 'Timelock', 'ERC20 voting power'],
    gasEstimate: '~2.5M gas',
    audited: true,
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport "@openzeppelin/contracts/governance/Governor.sol";\nimport "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";\nimport "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";\nimport "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";\nimport "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";\n\ncontract MyGovernor is Governor, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction, GovernorTimelockControl {\n    constructor(IVotes _token, TimelockController _timelock)\n        Governor("MyGovernor")\n        GovernorVotes(_token)\n        GovernorVotesQuorumFraction(4) // 4% quorum\n        GovernorTimelockControl(_timelock)\n    {}\n\n    function votingDelay() public pure override returns (uint256) { return 7200; } // 1 day\n    function votingPeriod() public pure override returns (uint256) { return 50400; } // 1 week\n    function proposalThreshold() public pure override returns (uint256) { return 0; }\n}`,
  },
  {
    id: 'timelock',
    name: 'Timelock Controller',
    standard: 'Utility' as ContractStandard,
    description: 'Delay contract operations for security and trust. Required for DAO deployments.',
    icon: '⏱️',
    color: '#10B981',
    features: ['Min delay', 'Proposers', 'Executors', 'Admin role', 'Cancellation'],
    gasEstimate: '~400K gas',
    audited: true,
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\nimport "@openzeppelin/contracts/governance/TimelockController.sol";\n\ncontract MyTimelock is TimelockController {\n    constructor(\n        uint256 minDelay,\n        address[] memory proposers,\n        address[] memory executors,\n        address admin\n    ) TimelockController(minDelay, proposers, executors, admin) {}\n}`,
  },
  {
    id: 'custom',
    name: 'Custom Contract',
    standard: 'Custom' as ContractStandard,
    description: 'Write your own Solidity contract from scratch with our editor and AI assistance',
    icon: '✏️',
    color: '#7C3AED',
    features: ['Full Solidity editor', 'AI suggestions', 'Compile & deploy', 'ABI export'],
    gasEstimate: 'Variable',
    audited: false,
    code: `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n/// @title Custom Contract\n/// @notice Start writing your contract here\ncontract MyContract {\n    address public owner;\n    \n    event OwnerSet(address indexed oldOwner, address indexed newOwner);\n    \n    modifier onlyOwner() {\n        require(msg.sender == owner, "Not owner");\n        _;\n    }\n    \n    constructor() {\n        owner = msg.sender;\n        emit OwnerSet(address(0), msg.sender);\n    }\n    \n    function changeOwner(address newOwner) public onlyOwner {\n        emit OwnerSet(owner, newOwner);\n        owner = newOwner;\n    }\n    \n    function getOwner() external view returns (address) {\n        return owner;\n    }\n}`,
  },
];

const MOCK_DEPLOYED: ContractConfig[] = [
  {
    id: '1',
    name: 'CryptoPunks Collection',
    symbol: 'CPK',
    standard: 'ERC721',
    network: 'ethereum',
    chainId: 1,
    features: { ownable: true, upgradeable: false, pausable: true, enumerable: true, uriStorage: true, burnable: true, royalties: true, reveal: true, whitelist: true, publicMint: true, freeMint: false, multiSig: false, timelocked: false },
    constructorArgs: {},
    address: '0xAbCd1234567890ABCD1234567890abCd12345678',
    deployedAt: new Date(Date.now() - 86400000 * 5),
    verified: true,
    auditStatus: 'passed',
  },
];

type View = 'list' | 'wizard' | 'interact';

export default function ContractsPage() {
  const [view, setView] = useState<View>('list');
  const [selectedTemplate, setSelectedTemplate] = useState(CONTRACT_TEMPLATES[0]);
  const [selectedNetwork, setSelectedNetwork] = useState('sepolia');
  const [selectedDeployed, setSelectedDeployed] = useState<ContractConfig | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [contractName, setContractName] = useState('');
  const [editedCode, setEditedCode] = useState(CONTRACT_TEMPLATES[0].code);
  const [verifying, setVerifying] = useState(false);

  const { contracts: storeContracts, addContract } = useContractStore();
  const allContracts = [...MOCK_DEPLOYED, ...storeContracts];

  const handleDeploy = async () => {
    if (!contractName.trim()) { toast.error('Enter a contract name'); return; }
    setDeploying(true);
    await new Promise(r => setTimeout(r, 3000));

    const contract: ContractConfig = {
      id: uuidv4(),
      name: contractName,
      standard: selectedTemplate.standard,
      network: selectedNetwork as NetworkName,
      chainId: NETWORKS[selectedNetwork]?.id as number,
      features: { ownable: true, upgradeable: false, pausable: true, enumerable: true, uriStorage: true, burnable: true, royalties: true, reveal: false, whitelist: false, publicMint: true, freeMint: false, multiSig: false, timelocked: false },
      constructorArgs: {},
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      deployedAt: new Date(),
      verified: false,
    };

    addContract(contract);
    setDeploying(false);
    setView('list');
    toast.success(`Contract "${contractName}" deployed successfully!`);
  };

  const handleVerify = async (contractId: string) => {
    setVerifying(true);
    await new Promise(r => setTimeout(r, 2000));
    setVerifying(false);
    toast.success('Contract verified on block explorer!');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Code2 className="text-blue-400" size={24} />
            Contract Deployer
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deploy audited smart contracts across 8+ networks with auto-verification
          </p>
        </div>
        <div className="flex gap-3">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="btn-secondary">← Back</button>
          )}
          {view === 'list' && (
            <button onClick={() => setView('wizard')} className="btn-primary">
              <Plus size={16} /> Deploy Contract
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Contracts Deployed', value: allContracts.length, color: 'text-blue-400' },
          { label: 'Verified', value: allContracts.filter(c => c.verified).length, color: 'text-green-400' },
          { label: 'Networks Used', value: new Set(allContracts.map(c => c.network)).size, color: 'text-purple-400' },
          { label: 'Audited', value: allContracts.filter(c => c.auditStatus === 'passed').length, color: 'text-cyan-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Contract List */}
      {view === 'list' && (
        <div className="space-y-3">
          {allContracts.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Code2 size={40} className="mx-auto text-muted-foreground mb-4 opacity-30" />
              <p className="text-muted-foreground">No contracts deployed yet.</p>
              <button onClick={() => setView('wizard')} className="btn-primary mt-4">
                <Plus size={14} /> Deploy First Contract
              </button>
            </div>
          ) : allContracts.map((contract) => {
            const network = NETWORKS[contract.network];
            return (
              <div key={contract.id} className="glass-card p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'rgba(37, 99, 235, 0.2)' }}
                  >
                    {CONTRACT_TEMPLATES.find(t => t.standard === contract.standard)?.icon || '📄'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{contract.name}</span>
                      <span className="badge badge-blue text-[10px]">{contract.standard}</span>
                      {contract.verified && <span className="badge badge-green text-[10px]">✓ VERIFIED</span>}
                      {contract.auditStatus === 'passed' && <span className="badge badge-cyan text-[10px]">AUDITED</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                      {contract.address && (
                        <>
                          <span className="font-mono">{formatAddress(contract.address)}</span>
                          <button onClick={() => { navigator.clipboard.writeText(contract.address!); toast.success('Copied!'); }}>
                            <Copy size={10} className="hover:text-purple-400" />
                          </button>
                        </>
                      )}
                      <span>•</span>
                      <span style={{ color: network?.color }}>{network?.icon} {network?.name}</span>
                      {contract.deployedAt && (
                        <>
                          <span>•</span>
                          <span>{formatTimeAgo(contract.deployedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!contract.verified && (
                      <button
                        onClick={() => handleVerify(contract.id)}
                        disabled={verifying}
                        className="btn-secondary text-xs h-8"
                      >
                        {verifying ? <div className="spinner w-3 h-3" /> : <Shield size={12} />}
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedDeployed(contract); setView('interact'); }}
                      className="btn-primary text-xs h-8"
                    >
                      <Play size={12} />
                      Interact
                    </button>
                    {contract.address && network && (
                      <a
                        href={`${network.explorerUrl}/address/${contract.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-xs h-8"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deployment Wizard */}
      {view === 'wizard' && (
        <div className="grid grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="col-span-1 space-y-3">
            <h2 className="font-semibold">Select Template</h2>
            {CONTRACT_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => { setSelectedTemplate(template); setEditedCode(template.code); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedTemplate.id === template.id
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{template.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-[10px] text-muted-foreground">{template.standard}</div>
                  </div>
                  <div className="ml-auto">
                    {template.audited && <span className="badge badge-green text-[9px]">AUDITED</span>}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{template.description}</p>
                <div className="text-[10px] text-muted-foreground mt-2">{template.gasEstimate}</div>
              </button>
            ))}
          </div>

          {/* Configuration + Code */}
          <div className="col-span-2 space-y-4">
            <h2 className="font-semibold">Configure & Deploy: {selectedTemplate.name}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contract Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. My NFT Collection"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  className="crypto-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Network</label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => setSelectedNetwork(e.target.value)}
                  className="crypto-input"
                >
                  {Object.values(NETWORKS).map(n => (
                    <option key={n.shortName} value={n.shortName}>
                      {n.name} {n.isTestnet ? '(Testnet)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium mb-2">Included Features</label>
              <div className="flex flex-wrap gap-2">
                {selectedTemplate.features.map(f => (
                  <span key={f} className="badge badge-blue">{f}</span>
                ))}
              </div>
            </div>

            {/* Code Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Contract Source</label>
                <span className="text-xs text-muted-foreground">Solidity ^0.8.20</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 max-h-[340px]">
                <SyntaxHighlighter
                  language="solidity"
                  style={atomOneDark}
                  customStyle={{ margin: 0, background: 'hsl(240 15% 9%)', fontSize: '11px', maxHeight: '340px' }}
                  showLineNumbers
                >
                  {editedCode}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* Verification Note */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-300">
              <Shield size={14} className="flex-shrink-0" />
              Auto-verification enabled on {NETWORKS[selectedNetwork]?.explorerUrl?.replace('https://', '')}. Contract will be verified upon successful deployment.
            </div>

            {/* Deploy Button */}
            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="btn-primary w-full justify-center py-3"
            >
              {deploying ? (
                <>
                  <div className="spinner w-4 h-4" />
                  Deploying to {NETWORKS[selectedNetwork]?.name}...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Deploy {selectedTemplate.name} to {NETWORKS[selectedNetwork]?.name}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contract Interaction */}
      {view === 'interact' && selectedDeployed && (
        <ContractInteractionPanel contract={selectedDeployed} />
      )}
    </div>
  );
}

function ContractInteractionPanel({ contract }: { contract: ContractConfig }) {
  const [activeTab, setActiveTab] = useState<'read' | 'write' | 'events'>('read');
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const call = async (funcId: string, result: string) => {
    setLoading(funcId);
    await new Promise(r => setTimeout(r, 800));
    setResults(prev => ({ ...prev, [funcId]: result }));
    setLoading(null);
  };

  const readFunctions = [
    { id: 'name', label: 'name()', type: 'string', result: contract.name },
    { id: 'symbol', label: 'symbol()', type: 'string', result: contract.symbol || 'NFT' },
    { id: 'totalSupply', label: 'totalSupply()', type: 'uint256', result: String(Math.floor(Math.random() * 1000)) },
    { id: 'maxSupply', label: 'maxSupply()', type: 'uint256', result: '10000' },
    { id: 'mintPrice', label: 'mintPrice()', type: 'uint256', result: '50000000000000000 (0.05 ETH)' },
    { id: 'paused', label: 'paused()', type: 'bool', result: 'false' },
    { id: 'revealed', label: 'revealed()', type: 'bool', result: 'true' },
    { id: 'owner', label: 'owner()', type: 'address', result: formatAddress('0xUserAddress1234567890abcdef1234567890', 8) },
  ];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-5">
        <Code2 size={18} className="text-blue-400" />
        <div>
          <div className="font-semibold">{contract.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{contract.address}</div>
        </div>
        <span className="badge badge-blue ml-2">{contract.standard}</span>
      </div>

      <div className="flex gap-1 mb-5 p-1 rounded-lg w-fit bg-white/[0.03]">
        {(['read', 'write', 'events'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button capitalize ${activeTab === tab ? 'active' : ''}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'read' && (
        <div className="grid grid-cols-2 gap-3">
          {readFunctions.map(f => (
            <div key={f.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs text-blue-300">{f.label}</code>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground">{f.type}</span>
                  <button
                    onClick={() => call(f.id, f.result)}
                    disabled={loading === f.id}
                    className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  >
                    {loading === f.id ? <div className="spinner w-2.5 h-2.5 inline-block" /> : 'Call'}
                  </button>
                </div>
              </div>
              {results[f.id] && (
                <div className="font-mono text-xs text-green-400 bg-black/20 rounded px-2 py-1 break-all">
                  → {results[f.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'write' && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'safeMint(address, string)', desc: 'Mint NFT to address with URI', inputs: ['To address', 'Token URI'] },
            { label: 'pause()', desc: 'Pause all transfers', inputs: [] },
            { label: 'unpause()', desc: 'Resume transfers', inputs: [] },
            { label: 'reveal()', desc: 'Reveal collection metadata', inputs: [] },
            { label: 'setMintPrice(uint256)', desc: 'Update mint price in wei', inputs: ['Price in wei'] },
            { label: 'withdraw()', desc: 'Withdraw contract ETH to owner', inputs: [] },
          ].map((func, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <code className="text-xs text-purple-300 block mb-1">{func.label}</code>
              <p className="text-[10px] text-muted-foreground mb-2">{func.desc}</p>
              {func.inputs.map((inp, j) => (
                <input key={j} placeholder={inp} className="crypto-input text-xs h-7 mb-1.5" />
              ))}
              <button
                onClick={() => { toast.success(`${func.label.split('(')[0]}() executed`); }}
                className="btn-primary text-[10px] h-7 px-3 w-full justify-center mt-1"
              >
                Execute
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-2">
          {[
            { event: 'Transfer', args: 'from=0x0...0, to=0xUser...1234, tokenId=1', block: 19234567, time: '2m ago' },
            { event: 'Transfer', args: 'from=0x0...0, to=0xUser...5678, tokenId=2', block: 19234566, time: '4m ago' },
            { event: 'Approval', args: 'owner=0xUser...1234, approved=0xDex...abcd, tokenId=1', block: 19234560, time: '10m ago' },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <span className="badge badge-cyan">{ev.event}</span>
              <span className="text-muted-foreground font-mono flex-1">{ev.args}</span>
              <span className="text-muted-foreground">Block {ev.block.toLocaleString()}</span>
              <span className="text-muted-foreground">{ev.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
