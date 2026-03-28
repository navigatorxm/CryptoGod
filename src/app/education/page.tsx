'use client';

import { useState } from 'react';
import {
  BookOpen,
  Code2,
  CheckCircle2,
  Clock,
  Star,
  Play,
  ChevronRight,
  Layers,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Search,
  Award,
  ArrowRight,
} from 'lucide-react';
import CodeBlock from '@/components/ui/CodeBlock';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const TUTORIALS = [
  {
    id: '1',
    title: 'Creating Your First ERC20 Token',
    category: 'tokens',
    difficulty: 'beginner' as const,
    estimatedTime: '30 min',
    description: 'Learn to deploy a fully functional ERC20 token from scratch using OpenZeppelin',
    completed: true,
    rating: 4.9,
    students: 12450,
    steps: [
      { title: 'Understanding ERC20 Standard', content: 'ERC20 defines a common interface for fungible tokens on Ethereum...', code: `// ERC20 interface\ninterface IERC20 {\n    function totalSupply() external view returns (uint256);\n    function balanceOf(address account) external view returns (uint256);\n    function transfer(address to, uint256 amount) external returns (bool);\n    // ... more functions\n}` },
      { title: 'Setting up OpenZeppelin', content: 'Install OpenZeppelin and import the base contract...', code: `// Install: npm install @openzeppelin/contracts\nimport "@openzeppelin/contracts/token/ERC20/ERC20.sol";\nimport "@openzeppelin/contracts/access/Ownable.sol";` },
      { title: 'Writing the Token Contract', content: 'Create your token with mint and burn capabilities...', code: `contract MyToken is ERC20, Ownable {\n    constructor() ERC20("My Token", "MTK") Ownable(msg.sender) {\n        _mint(msg.sender, 1_000_000 * 10 ** decimals());\n    }\n    \n    function mint(address to, uint256 amount) public onlyOwner {\n        _mint(to, amount);\n    }\n}` },
    ],
  },
  {
    id: '2',
    title: 'NFT Collection Deployment Guide',
    category: 'nft',
    difficulty: 'intermediate' as const,
    estimatedTime: '45 min',
    description: 'Build a complete NFT collection with reveal mechanism, whitelist, and royalties',
    completed: false,
    rating: 4.8,
    students: 8923,
    steps: [],
  },
  {
    id: '3',
    title: 'Understanding DeFi: AMMs & Liquidity Pools',
    category: 'defi',
    difficulty: 'intermediate' as const,
    estimatedTime: '60 min',
    description: 'Deep dive into how Uniswap, Curve, and AMMs work under the hood',
    completed: false,
    rating: 4.7,
    students: 6541,
    steps: [],
  },
  {
    id: '4',
    title: 'Smart Contract Security Best Practices',
    category: 'security',
    difficulty: 'advanced' as const,
    estimatedTime: '90 min',
    description: 'Comprehensive guide to writing secure Solidity contracts and avoiding common exploits',
    completed: false,
    rating: 4.9,
    students: 9234,
    steps: [],
  },
  {
    id: '5',
    title: 'Building a DAO from Scratch',
    category: 'advanced',
    difficulty: 'advanced' as const,
    estimatedTime: '120 min',
    description: 'Create a full governance system with proposals, voting, and timelock execution',
    completed: false,
    rating: 4.6,
    students: 3451,
    steps: [],
  },
  {
    id: '6',
    title: 'Cross-Chain Development Guide',
    category: 'advanced',
    difficulty: 'advanced' as const,
    estimatedTime: '75 min',
    description: 'Deploy contracts across multiple chains and implement cross-chain messaging',
    completed: false,
    rating: 4.5,
    students: 2341,
    steps: [],
  },
];

const CODE_TEMPLATES = [
  {
    id: 'erc20-basic',
    name: 'Basic ERC20 Token',
    category: 'Tokens',
    language: 'solidity' as const,
    audited: true,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("Basic Token", "BTK")
        Ownable(initialOwner)
    {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`,
  },
  {
    id: 'nft-basic',
    name: 'Basic ERC721 NFT',
    category: 'NFTs',
    language: 'solidity' as const,
    audited: true,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("Basic NFT", "BNFT")
        Ownable(initialOwner)
    {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage) returns (string memory)
    { return super.tokenURI(tokenId); }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage) returns (bool)
    { return super.supportsInterface(interfaceId); }
}`,
  },
  {
    id: 'staking',
    name: 'Token Staking Contract',
    category: 'DeFi',
    language: 'solidity' as const,
    audited: false,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Simple Token Staking
/// @notice Stake tokens and earn rewards proportional to time staked
contract Staking is ReentrancyGuard {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    uint256 public rewardRate; // rewards per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    constructor(address _stakingToken, address _rewardToken, uint256 _rewardRate) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) return rewardPerTokenStored;
        return rewardPerTokenStored + (rewardRate * (block.timestamp - lastUpdateTime) * 1e18) / totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return (balanceOf[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18 + rewards[account];
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        stakingToken.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
    }

    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.transfer(msg.sender, reward);
        }
    }
}`,
  },
  {
    id: 'multisig-simple',
    name: 'Simple 2-of-3 Multisig',
    category: 'Security',
    language: 'solidity' as const,
    audited: true,
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Simple 2-of-3 Multi-Signature Wallet
contract SimpleMultiSig {
    address[3] public owners;
    uint256 public constant THRESHOLD = 2;

    struct Tx {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 approvals;
    }

    Tx[] public transactions;
    mapping(uint256 => mapping(address => bool)) public approved;

    modifier onlyOwner() {
        bool isOwner = false;
        for (uint i = 0; i < 3; i++) if (owners[i] == msg.sender) isOwner = true;
        require(isOwner, "Not owner");
        _;
    }

    constructor(address[3] memory _owners) {
        owners = _owners;
    }

    receive() external payable {}

    function submit(address _to, uint256 _value, bytes calldata _data) external onlyOwner returns (uint256) {
        transactions.push(Tx(_to, _value, _data, false, 0));
        return transactions.length - 1;
    }

    function approve(uint256 txId) external onlyOwner {
        require(!approved[txId][msg.sender], "Already approved");
        approved[txId][msg.sender] = true;
        transactions[txId].approvals++;
    }

    function execute(uint256 txId) external onlyOwner {
        Tx storage tx = transactions[txId];
        require(tx.approvals >= THRESHOLD, "Not enough approvals");
        require(!tx.executed, "Already executed");
        tx.executed = true;
        (bool success, ) = tx.to.call{value: tx.value}(tx.data);
        require(success, "Execution failed");
    }
}`,
  },
];

const CATEGORIES = ['All', 'Tokens', 'NFTs', 'DeFi', 'Security', 'Advanced'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

type View = 'tutorials' | 'templates' | 'tutorial-detail';

export default function EducationPage() {
  const [activeView, setActiveView] = useState<View>('tutorials');
  const [selectedTutorial, setSelectedTutorial] = useState(TUTORIALS[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof CODE_TEMPLATES[0] | null>(null);

  const filteredTutorials = TUTORIALS.filter(t => {
    const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'All' || t.category === filterCategory.toLowerCase();
    const matchDiff = filterDifficulty === 'All' || t.difficulty === filterDifficulty.toLowerCase();
    return matchSearch && matchCat && matchDiff;
  });

  const difficultyColor = (d: string) => ({
    beginner: 'badge-green',
    intermediate: 'badge-yellow',
    advanced: 'badge-red',
  }[d] || 'badge-gray');

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BookOpen className="text-cyan-400" size={24} />
            Web3 Learning Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Interactive tutorials, code templates, and step-by-step guides for blockchain development
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tutorials', value: TUTORIALS.length, icon: <BookOpen size={16} />, color: 'text-cyan-400' },
          { label: 'Code Templates', value: CODE_TEMPLATES.length, icon: <Code2 size={16} />, color: 'text-blue-400' },
          { label: 'Completed', value: TUTORIALS.filter(t => t.completed).length, icon: <CheckCircle2 size={16} />, color: 'text-green-400' },
          { label: 'Total Students', value: '42.9K', icon: <Users size={16} />, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <div className={`flex items-center gap-2 mb-2 ${s.color}`}>{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-white/[0.04] border border-white/[0.06]">
        {(['tutorials', 'templates'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveView(tab)} className={`tab-button capitalize ${activeView === tab ? 'active' : ''}`}>
            {tab === 'tutorials' ? '📚 Tutorials' : '📋 Code Templates'}
          </button>
        ))}
      </div>

      {/* Tutorials */}
      {activeView === 'tutorials' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tutorials..."
                className="crypto-input pl-9 h-9 text-sm w-56"
              />
            </div>
            <div className="flex gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`tab-button text-xs ${filterCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  onClick={() => setFilterDifficulty(diff)}
                  className={`tab-button text-xs ${filterDifficulty === diff ? 'active' : ''}`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutorials.map(tutorial => (
              <div
                key={tutorial.id}
                className={`glass-card p-5 cursor-pointer transition-all hover:border-white/10 ${tutorial.completed ? 'border border-green-500/20' : ''}`}
                onClick={() => { setSelectedTutorial(tutorial); setCurrentStep(0); setActiveView('tutorial-detail'); }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${difficultyColor(tutorial.difficulty)} text-[10px]`}>
                      {tutorial.difficulty}
                    </span>
                    <span className="badge badge-gray text-[10px]">{tutorial.category}</span>
                  </div>
                  {tutorial.completed && <CheckCircle2 size={16} className="text-green-400" />}
                </div>
                <h3 className="font-bold mb-2">{tutorial.title}</h3>
                <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{tutorial.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Clock size={11} />{tutorial.estimatedTime}</span>
                    <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400" />{tutorial.rating}</span>
                  </div>
                  <span className="flex items-center gap-1 text-purple-400">
                    Start <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tutorial Detail */}
      {activeView === 'tutorial-detail' && (
        <div className="space-y-4">
          <button onClick={() => setActiveView('tutorials')} className="btn-secondary text-xs h-8">
            ← Back to Tutorials
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Steps sidebar */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Steps</h3>
              {selectedTutorial.steps.length === 0 ? (
                <p className="text-xs text-muted-foreground">No steps available for preview</p>
              ) : selectedTutorial.steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${currentStep === i ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' : 'border-white/5 text-muted-foreground hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: currentStep === i ? '#06B6D4' : 'rgba(255,255,255,0.1)' }}>
                      {i + 1}
                    </span>
                    <span className="text-xs truncate">{step.title}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Step content */}
            <div className="col-span-3">
              <div className="glass-card p-5">
                <h2 className="text-xl font-bold mb-2">{selectedTutorial.title}</h2>
                <div className="flex items-center gap-3 mb-4 text-sm">
                  <span className={`badge ${difficultyColor(selectedTutorial.difficulty)}`}>{selectedTutorial.difficulty}</span>
                  <span className="text-muted-foreground flex items-center gap-1"><Clock size={12} />{selectedTutorial.estimatedTime}</span>
                  <span className="text-muted-foreground flex items-center gap-1"><Star size={12} className="text-yellow-400" />{selectedTutorial.rating}</span>
                </div>

                {selectedTutorial.steps.length > 0 && selectedTutorial.steps[currentStep] ? (
                  <div className="space-y-4">
                    <h3 className="font-bold text-base">{selectedTutorial.steps[currentStep].title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedTutorial.steps[currentStep].content}
                    </p>
                    {selectedTutorial.steps[currentStep].code && (
                      <div className="rounded-xl overflow-hidden border border-white/10">
                        <CodeBlock language="solidity" style={atomOneDark} customStyle={{ margin: 0, background: 'hsl(240 15% 9%)', fontSize: '12px' }} showLineNumbers>
                          {selectedTutorial.steps[currentStep].code!}
                        </CodeBlock>
                      </div>
                    )}
                    <div className="flex gap-3 pt-2">
                      {currentStep > 0 && (
                        <button onClick={() => setCurrentStep(s => s - 1)} className="btn-secondary text-sm">← Previous</button>
                      )}
                      {currentStep < selectedTutorial.steps.length - 1 && (
                        <button onClick={() => setCurrentStep(s => s + 1)} className="btn-primary text-sm">
                          Next Step <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">{selectedTutorial.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Code Templates */}
      {activeView === 'templates' && (
        <div className="space-y-4">
          {selectedTemplate ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg">{selectedTemplate.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-blue text-[10px]">{selectedTemplate.category}</span>
                    {selectedTemplate.audited && <span className="badge badge-green text-[10px]">✓ AUDITED</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedTemplate(null)} className="btn-secondary text-xs h-8">← Back</button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(selectedTemplate.code); }}
                    className="btn-primary text-xs h-8"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <CodeBlock language={selectedTemplate.language} style={atomOneDark} customStyle={{ margin: 0, background: 'hsl(240 15% 9%)', fontSize: '13px', minHeight: '500px' }} showLineNumbers>
                  {selectedTemplate.code}
                </CodeBlock>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {CODE_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className="glass-card p-5 cursor-pointer hover:border-white/10 transition-all"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-blue text-[10px]">{template.category}</span>
                      {template.audited && <span className="badge badge-green text-[10px]">✓ AUDITED</span>}
                    </div>
                    <Code2 size={16} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-bold mb-2">{template.name}</h3>
                  <div className="rounded-lg overflow-hidden border border-white/5 max-h-24 mb-3">
                    <CodeBlock language={template.language} style={atomOneDark} customStyle={{ margin: 0, background: 'hsl(240 15% 9%)', fontSize: '10px', maxHeight: '96px', overflow: 'hidden' }}>
                      {template.code.slice(0, 200) + '...'}
                    </CodeBlock>
                  </div>
                  <button className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                    View Template <ArrowRight size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
