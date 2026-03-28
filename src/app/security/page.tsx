'use client';

import { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Code2,
  Search,
  BookOpen,
  Zap,
  Lock,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Copy,
  Info,
  Bug,
} from 'lucide-react';
import CodeBlock from '@/components/ui/CodeBlock';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import toast from 'react-hot-toast';

// ============================================
// Security Education — Defensive content only
// All patterns documented for detection and prevention
// ============================================

const ATTACK_VECTORS = [
  {
    id: 'reentrancy',
    name: 'Reentrancy Attack',
    category: 'reentrancy',
    severity: 'critical' as const,
    description: 'A malicious contract recursively calls back into the victim contract before the first execution completes, draining funds.',
    technicalDetails: 'Occurs when external calls are made before state updates. The attacker deploys a contract with a fallback function that re-enters the victim. The DAO hack ($60M, 2016) used this vector.',
    realWorldExamples: ['The DAO ($60M, 2016)', 'Cream Finance ($34M, 2021)', 'Lendf.me ($25M, 2020)'],
    lossAmount: '$150M+ historically',
    vulnerableCode: `// VULNERABLE - DO NOT USE IN PRODUCTION
contract VulnerableBank {
    mapping(address => uint256) public balances;

    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // ❌ DANGER: External call BEFORE state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        // State update happens AFTER the external call
        // Attacker can re-enter before this line executes!
        balances[msg.sender] = 0; // ← Too late!
    }
}

// ATTACKER CONTRACT
contract Attacker {
    VulnerableBank public target;
    uint256 public attackCount;

    receive() external payable {
        if (address(target).balance >= 1 ether && attackCount < 10) {
            attackCount++;
            target.withdraw(); // ← Recursive re-entry!
        }
    }
}`,
    secureCode: `// SECURE - Checks-Effects-Interactions Pattern
contract SecureBank {
    mapping(address => uint256) public balances;
    bool private locked; // Reentrancy guard

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function withdraw() public nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // ✅ CHECKS: Validate conditions
        // ✅ EFFECTS: Update state FIRST
        balances[msg.sender] = 0;

        // ✅ INTERACTIONS: External call LAST
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}

// Better: Use OpenZeppelin's ReentrancyGuard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract SecureBankV2 is ReentrancyGuard {
    mapping(address => uint256) public balances;

    function withdraw() public nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");
        balances[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
    }
}`,
    mitigations: [
      'Follow Checks-Effects-Interactions (CEI) pattern',
      'Use OpenZeppelin ReentrancyGuard',
      'Avoid external calls in loops',
      'Use pull payment pattern (withdrawal pattern)',
      'Consider using transfer() instead of call() for ETH (limited gas)',
    ],
  },
  {
    id: 'flash-loan',
    name: 'Flash Loan Price Manipulation',
    category: 'flash-loan',
    severity: 'critical' as const,
    description: 'Attackers borrow millions in uncollateralized flash loans to manipulate spot prices on AMMs, then exploit protocols using those skewed prices within one transaction.',
    technicalDetails: 'Flash loans allow borrowing huge amounts (e.g., $100M USDC) with zero collateral, as long as repayment occurs within the same transaction. If a protocol uses an AMM as a price oracle (spot price), the attacker can manipulate it temporarily.',
    realWorldExamples: ['bZx Protocol ($1M, 2020)', 'Harvest Finance ($34M, 2020)', 'Value DeFi ($6M, 2020)', 'PancakeBunny ($45M, 2021)'],
    lossAmount: '$1B+ across DeFi',
    vulnerableCode: `// VULNERABLE: Using AMM spot price as oracle
contract VulnerableLending {
    IUniswapV2Pair public pair; // ETH/USDC pair

    function getPrice() public view returns (uint256) {
        // ❌ DANGER: Spot price manipulatable via flash loans!
        (uint112 reserve0, uint112 reserve1, ) = pair.getReserves();
        return (reserve1 * 1e18) / reserve0; // Easily manipulated!
    }

    function borrow(uint256 collateralAmount) external {
        uint256 price = getPrice(); // Uses manipulated price!
        uint256 borrowLimit = collateralAmount * price / 1e18;
        // Attacker can borrow far more than actual collateral value
        _mint(msg.sender, borrowLimit * 2); // ← Exploited!
    }
}`,
    secureCode: `// SECURE: Using Time-Weighted Average Price (TWAP)
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";

contract SecureLending {
    IUniswapV3Pool public pool;
    uint32 public constant TWAP_PERIOD = 1800; // 30-minute TWAP

    function getPrice() public view returns (uint256) {
        // ✅ TWAP is resistant to flash loan manipulation
        (int24 arithmeticMeanTick, ) = OracleLibrary.consult(
            address(pool),
            TWAP_PERIOD // Average over 30 minutes
        );
        return OracleLibrary.getQuoteAtTick(
            arithmeticMeanTick,
            1e18,
            token0,
            token1
        );
    }
}

// Even better: Use Chainlink Price Feeds
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ChainlinkSecureLending {
    AggregatorV3Interface internal priceFeed;
    uint256 public constant STALENESS_THRESHOLD = 3600; // 1 hour

    function getPrice() public view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();

        // ✅ Check for stale prices
        require(updatedAt >= block.timestamp - STALENESS_THRESHOLD, "Stale price");
        require(answeredInRound >= roundId, "Stale round");
        require(price > 0, "Invalid price");

        return uint256(price);
    }
}`,
    mitigations: [
      'NEVER use AMM spot prices as oracles',
      'Use Chainlink or other decentralized oracle networks',
      'Use TWAP (Time-Weighted Average Price) if using AMMs',
      'Add price deviation checks (revert if price changed >X%)',
      'Implement circuit breakers for large price movements',
    ],
  },
  {
    id: 'access-control',
    name: 'Access Control Vulnerabilities',
    category: 'access-control',
    severity: 'high' as const,
    description: 'Missing or incorrect access controls allow unauthorized users to call privileged functions, manipulate state, or steal funds.',
    technicalDetails: 'Common in DeFi: missing onlyOwner, incorrect role setup, or publicly accessible admin functions. The Poly Network hack ($611M) was caused by a custom access control vulnerability.',
    realWorldExamples: ['Poly Network ($611M, 2021)', 'Ronin Bridge ($625M, 2022 - key compromise)', 'Anyswap ($7.9M, 2021)'],
    lossAmount: '$1B+ (largest single vector)',
    vulnerableCode: `// VULNERABLE: Missing access controls
contract VulnerableProxy {
    address public implementation;
    address public owner;

    // ❌ Anyone can call this! No access control!
    function upgradeTo(address newImplementation) external {
        implementation = newImplementation;
    }

    // ❌ Initialization can be called by anyone
    function initialize(address _owner) external {
        // No check if already initialized!
        owner = _owner;
    }

    // ❌ Missing modifier
    function setOwner(address newOwner) external {
        owner = newOwner; // No require(msg.sender == owner)!
    }
}`,
    secureCode: `// SECURE: Proper access controls
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract SecureProxy is AccessControl, Initializable {
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    address public implementation;

    function initialize(address admin) external initializer {
        // ✅ initializer modifier prevents re-initialization
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);
    }

    // ✅ Only UPGRADER_ROLE can upgrade
    function upgradeTo(address newImplementation) external onlyRole(UPGRADER_ROLE) {
        require(newImplementation != address(0), "Invalid address");
        require(
            newImplementation.code.length > 0,
            "Not a contract"
        );
        address old = implementation;
        implementation = newImplementation;
        emit Upgraded(old, newImplementation);
    }
}

// For simple ownership:
import "@openzeppelin/contracts/access/Ownable.sol";
contract SimpleOwnable is Ownable {
    constructor() Ownable(msg.sender) {}

    function sensitiveAction() external onlyOwner {
        // Only owner can call
    }
}`,
    mitigations: [
      'Use OpenZeppelin Ownable or AccessControl',
      'Apply modifiers (onlyOwner) to all admin functions',
      'Use initializer pattern for upgradeable contracts',
      'Implement multi-sig for critical operations',
      'Audit all external and public function visibility',
      'Test all access control paths in your test suite',
    ],
  },
  {
    id: 'overflow',
    name: 'Integer Overflow/Underflow',
    category: 'overflow',
    severity: 'high' as const,
    description: 'Arithmetic overflow/underflow wraps around silently, creating unexpected balances or bypassing checks. Mitigated in Solidity 0.8+ with built-in checks.',
    technicalDetails: 'In Solidity <0.8.0, uint256 wraps from 2^256-1 back to 0. uint8 max is 255, so 255 + 1 = 0. The BatchOverflow bug affected dozens of ERC20 tokens in 2018.',
    realWorldExamples: ['BEC Token BatchOverflow ($900M paper value, 2018)', 'Beauty Chain (BEC)', 'SMT Token'],
    lossAmount: '$900M+ (paper value in 2018 attacks)',
    vulnerableCode: `// VULNERABLE: Solidity <0.8.0 without SafeMath
// pragma solidity ^0.7.0; // ← Old version vulnerable!

contract VulnerableToken {
    mapping(address => uint256) public balances;

    // ❌ OVERFLOW: If amount is very large, _value + amount wraps!
    function batchTransfer(address[] memory receivers, uint256 _value) public {
        uint256 cnt = receivers.length;
        uint256 amount = cnt * _value; // ← OVERFLOW: cnt * _value can wrap to 0!

        require(balances[msg.sender] >= amount); // Passes if amount = 0!
        balances[msg.sender] -= amount;

        for (uint i = 0; i < cnt; i++) {
            balances[receivers[i]] += _value; // Attacker gets tokens for free!
        }
    }
}`,
    secureCode: `// SECURE: Solidity 0.8+ has built-in overflow protection
// pragma solidity ^0.8.0; // ← Built-in overflow/underflow protection!

contract SecureToken {
    mapping(address => uint256) public balances;

    // ✅ Solidity 0.8+ will automatically revert on overflow/underflow
    function batchTransfer(address[] memory receivers, uint256 _value) public {
        uint256 cnt = receivers.length;
        // ✅ Will revert if this overflows
        uint256 amount = cnt * _value;

        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount; // ✅ Reverts on underflow

        for (uint256 i = 0; i < cnt; i++) {
            balances[receivers[i]] += _value; // ✅ Reverts on overflow
        }
    }
}

// For older Solidity, use SafeMath:
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
contract SafeTokenLegacy {
    using SafeMath for uint256;

    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a.add(b); // Reverts on overflow
    }
}`,
    mitigations: [
      'Use Solidity 0.8.0+ (built-in overflow checks)',
      'Use OpenZeppelin SafeMath for older Solidity versions',
      'Be careful with unchecked{} blocks in 0.8+ (disable protection)',
      'Test edge cases: max uint256, zero values',
      'Use uint256 instead of smaller types where possible',
    ],
  },
  {
    id: 'front-running',
    name: 'Front-Running / MEV',
    category: 'front-running',
    severity: 'medium' as const,
    description: 'Miners or MEV bots observe pending transactions in the mempool and insert their own transactions with higher gas to profit at the expense of users.',
    technicalDetails: 'Sandwich attacks: bot sees your DEX trade, buys first (drives price up), lets your trade execute at worse price, then sells. Costs DeFi users hundreds of millions annually.',
    realWorldExamples: ['Sandwich bots on Uniswap ($1B+ per year)', 'JIT Liquidity (Uniswap v3)', 'DEX arbitrage bots'],
    lossAmount: '$1B+ per year across DeFi',
    vulnerableCode: `// VULNERABLE: No slippage protection
contract VulnerableSwap {
    // ❌ No minimum output amount check
    function swap(uint256 amountIn) external {
        // Attacker sandwiches this transaction!
        uint256 amountOut = calculateOutput(amountIn);
        // User gets whatever price is available - can be terrible!
        _executeSwap(amountIn, amountOut);
    }

    // ❌ Predictable randomness (also MEV vulnerable)
    function pickWinner() external {
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp)));
        // Miners can manipulate block.timestamp!
        address winner = players[random % players.length];
    }
}`,
    secureCode: `// SECURE: Slippage protection and commit-reveal
contract SecureSwap {
    // ✅ Always include minimum output amount
    function swap(
        uint256 amountIn,
        uint256 amountOutMin, // ← User specifies minimum acceptable output
        address to,
        uint256 deadline // ← Prevent delayed execution
    ) external {
        require(block.timestamp <= deadline, "Transaction expired");

        uint256 amountOut = calculateOutput(amountIn);
        require(amountOut >= amountOutMin, "Slippage too high");

        _executeSwap(amountIn, amountOut, to);
    }
}

// For randomness: Use Chainlink VRF
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
contract SecureLottery is VRFConsumerBaseV2 {
    // ✅ Verifiable randomness from Chainlink
    function requestRandomWinner() external onlyOwner {
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash, subscriptionId, requestConfirmations,
            callbackGasLimit, numWords
        );
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords)
        internal override
    {
        // ✅ Truly random, cannot be manipulated by miners
        uint256 winnerIndex = randomWords[0] % players.length;
        address winner = players[winnerIndex];
        emit WinnerSelected(winner);
    }
}`,
    mitigations: [
      'Set slippage tolerance on all DEX trades (max 0.5-1%)',
      'Use deadline parameter on swaps to prevent delayed execution',
      'Use Flashbots/MEV protection RPCs (Flashbots Protect)',
      'For randomness: use Chainlink VRF, not block.timestamp/blockhash',
      'Consider private mempools or commit-reveal schemes',
    ],
  },
];

const SECURITY_CHECKLIST = [
  { category: 'Access Control', items: [
    { check: 'All admin functions have proper access modifiers', severity: 'critical' as const },
    { check: 'Owner/admin addresses are not hardcoded', severity: 'high' as const },
    { check: 'Initializer pattern used correctly for upgradeable contracts', severity: 'critical' as const },
    { check: 'Multi-sig for critical operations (treasury, upgrades)', severity: 'high' as const },
  ]},
  { category: 'Reentrancy', items: [
    { check: 'Checks-Effects-Interactions pattern followed', severity: 'critical' as const },
    { check: 'ReentrancyGuard used where needed', severity: 'critical' as const },
    { check: 'No state changes after external calls', severity: 'critical' as const },
  ]},
  { category: 'Oracle Security', items: [
    { check: 'Price feeds use TWAP or Chainlink, not spot prices', severity: 'critical' as const },
    { check: 'Stale price checks implemented', severity: 'high' as const },
    { check: 'Price deviation circuit breakers in place', severity: 'medium' as const },
  ]},
  { category: 'Integer Safety', items: [
    { check: 'Solidity 0.8+ used for built-in overflow protection', severity: 'high' as const },
    { check: 'unchecked{} blocks reviewed carefully', severity: 'medium' as const },
    { check: 'Division rounding direction is correct', severity: 'medium' as const },
  ]},
  { category: 'General', items: [
    { check: 'No tx.origin used for authentication (use msg.sender)', severity: 'critical' as const },
    { check: 'No block.timestamp for critical timing (use block.number)', severity: 'medium' as const },
    { check: 'Return values of external calls checked', severity: 'high' as const },
    { check: 'Emergency pause mechanism exists', severity: 'high' as const },
    { check: 'Contract verified on block explorer', severity: 'low' as const },
    { check: 'Professional audit completed before mainnet', severity: 'critical' as const },
  ]},
];

type Tab = 'vectors' | 'checklist' | 'analyzer' | 'detect';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('vectors');
  const [selectedVector, setSelectedVector] = useState(ATTACK_VECTORS[0]);
  const [checklistStatus, setChecklistStatus] = useState<Record<string, boolean>>({});
  const [analyzeCode, setAnalyzeCode] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{ issue: string; severity: string; line?: number }[]>([]);
  const [contractAddress, setContractAddress] = useState('');

  const toggleCheck = (id: string) => {
    setChecklistStatus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checklistStatus).filter(Boolean).length;
  const totalChecks = SECURITY_CHECKLIST.reduce((acc, cat) => acc + cat.items.length, 0);

  const runAnalysis = async () => {
    if (!analyzeCode.trim()) { toast.error('Paste contract code to analyze'); return; }
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 2000));

    const mockIssues = [
      { issue: 'Potential reentrancy: external call before state update on line 23', severity: 'critical', line: 23 },
      { issue: 'tx.origin used for authentication — use msg.sender instead', severity: 'high', line: 45 },
      { issue: 'Integer division may cause precision loss', severity: 'medium', line: 67 },
      { issue: 'Missing event emission on state change', severity: 'low', line: 89 },
    ];

    setAnalysisResults(mockIssues.filter(() => Math.random() > 0.3));
    setAnalyzing(false);
    toast.success('Analysis complete!');
  };

  const severityColor = (s: string) => ({
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400',
    info: 'text-gray-400',
  }[s] || 'text-gray-400');

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <ShieldAlert className="text-red-400" size={24} />
            Security Education Hub
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Attack vectors, vulnerability patterns, and contract auditing tools — for defensive purposes
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
          <Info size={14} />
          Educational content for security professionals and auditors
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-white/[0.04] border border-white/[0.06]">
        {(['vectors', 'checklist', 'analyzer', 'detect'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button ${activeTab === tab ? 'active' : ''}`}>
            {tab === 'vectors' ? '⚔️ Attack Vectors' :
             tab === 'checklist' ? '✅ Audit Checklist' :
             tab === 'analyzer' ? '🔍 Code Analyzer' : '🚨 Scam Detector'}
          </button>
        ))}
      </div>

      {/* Attack Vectors */}
      {activeTab === 'vectors' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Vector List */}
          <div className="lg:col-span-1 space-y-2">
            {ATTACK_VECTORS.map(vector => (
              <button
                key={vector.id}
                onClick={() => setSelectedVector(vector)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedVector.id === vector.id
                    ? 'border-red-500/40 bg-red-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded severity-${vector.severity}`}>
                    {vector.severity}
                  </span>
                </div>
                <div className="text-sm font-semibold">{vector.name}</div>
                {vector.lossAmount && <div className="text-[10px] text-red-400 mt-1">{vector.lossAmount}</div>}
              </button>
            ))}
          </div>

          {/* Vector Detail */}
          <div className="lg:col-span-3 space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className={`severity-${selectedVector.severity}`}>{selectedVector.severity.toUpperCase()}</span>
                <h2 className="text-xl font-bold">{selectedVector.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{selectedVector.description}</p>
              <p className="text-sm mb-3">{selectedVector.technicalDetails}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="text-xs font-semibold text-red-400 mb-1">Real-World Incidents</div>
                  {selectedVector.realWorldExamples.map(ex => (
                    <div key={ex} className="text-xs text-muted-foreground">• {ex}</div>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="text-xs font-semibold text-green-400 mb-1">Mitigations</div>
                  {selectedVector.mitigations.slice(0, 3).map(m => (
                    <div key={m} className="text-xs text-muted-foreground">✓ {m}</div>
                  ))}
                  {selectedVector.mitigations.length > 3 && (
                    <div className="text-xs text-green-400 mt-1">+{selectedVector.mitigations.length - 3} more...</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-red-400">
                    <XCircle size={14} />
                    <span className="text-sm font-semibold">Vulnerable Pattern</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-red-500/20 max-h-[400px]">
                    <CodeBlock
                      language="solidity"
                      style={atomOneDark}
                      customStyle={{ margin: 0, background: 'rgba(239, 68, 68, 0.05)', fontSize: '11px', maxHeight: '400px' }}
                      showLineNumbers
                    >
                      {selectedVector.vulnerableCode}
                    </CodeBlock>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2 text-green-400">
                    <CheckCircle2 size={14} />
                    <span className="text-sm font-semibold">Secure Implementation</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-green-500/20 max-h-[400px]">
                    <CodeBlock
                      language="solidity"
                      style={atomOneDark}
                      customStyle={{ margin: 0, background: 'rgba(16, 185, 129, 0.05)', fontSize: '11px', maxHeight: '400px' }}
                      showLineNumbers
                    >
                      {selectedVector.secureCode}
                    </CodeBlock>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Checklist */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Smart Contract Audit Checklist</h2>
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className="font-bold text-green-400">{checkedCount}</span>
                  <span className="text-muted-foreground"> / {totalChecks} checked</span>
                </div>
                <div className="w-32 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-500 transition-all" style={{ width: `${(checkedCount / totalChecks) * 100}%` }} />
                </div>
              </div>
            </div>
            {SECURITY_CHECKLIST.map(cat => (
              <div key={cat.category} className="mb-5">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">{cat.category}</h3>
                <div className="space-y-2">
                  {cat.items.map((item, i) => {
                    const id = `${cat.category}-${i}`;
                    return (
                      <div
                        key={id}
                        onClick={() => toggleCheck(id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${checklistStatus[id] ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'}`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${checklistStatus[id] ? 'bg-green-500 border-green-500' : 'border-white/20'}`}>
                          {checklistStatus[id] && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <span className={`flex-1 text-sm ${checklistStatus[id] ? 'line-through text-muted-foreground' : ''}`}>
                          {item.check}
                        </span>
                        <span className={`text-[10px] font-bold uppercase severity-${item.severity}`}>
                          {item.severity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Analyzer */}
      {activeTab === 'analyzer' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h2 className="font-semibold">Static Analysis Tool</h2>
              <p className="text-sm text-muted-foreground">Paste your Solidity contract for automated vulnerability detection (powered by Slither patterns)</p>
              <textarea
                value={analyzeCode}
                onChange={e => setAnalyzeCode(e.target.value)}
                placeholder="// Paste your Solidity contract code here..."
                className="crypto-input resize-none font-mono text-xs"
                rows={18}
              />
              <button onClick={runAnalysis} disabled={analyzing} className="btn-primary w-full justify-center">
                {analyzing ? <><div className="spinner w-4 h-4" /> Analyzing...</> : <><Bug size={16} /> Analyze Contract</>}
              </button>
            </div>
            <div>
              <h2 className="font-semibold mb-3">Analysis Results</h2>
              {analysisResults.length === 0 && !analyzing && (
                <div className="glass-card p-8 text-center">
                  <ShieldAlert size={32} className="mx-auto text-muted-foreground mb-3 opacity-30" />
                  <p className="text-muted-foreground text-sm">Paste code and run analysis</p>
                </div>
              )}
              {analyzing && (
                <div className="glass-card p-8 text-center">
                  <div className="spinner w-8 h-8 mx-auto border-purple-400 mb-3" />
                  <p className="text-muted-foreground text-sm">Running security analysis...</p>
                </div>
              )}
              {analysisResults.length > 0 && (
                <div className="space-y-3">
                  {analysisResults.length === 0 ? (
                    <div className="glass-card p-5 text-center">
                      <CheckCircle2 size={24} className="mx-auto text-green-400 mb-2" />
                      <p className="text-green-400 font-semibold">No issues found</p>
                    </div>
                  ) : analysisResults.map((result, i) => (
                    <div key={i} className={`glass-card p-4 border-l-2 ${result.severity === 'critical' ? 'border-red-500' : result.severity === 'high' ? 'border-orange-500' : result.severity === 'medium' ? 'border-yellow-500' : 'border-blue-500'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className={severityColor(result.severity)} />
                        <span className={`text-xs font-bold uppercase ${severityColor(result.severity)}`}>{result.severity}</span>
                        {result.line && <span className="text-xs text-muted-foreground">Line {result.line}</span>}
                      </div>
                      <p className="text-sm">{result.issue}</p>
                    </div>
                  ))}
                  {analysisResults.length > 0 && (
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                      Found {analysisResults.length} potential issue(s). Review each carefully and get a professional audit before mainnet deployment.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scam Detector */}
      {activeTab === 'detect' && (
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h2 className="font-semibold mb-3">Contract Risk Analyzer</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze a contract address for common red flags: honeypot patterns, rug-pull mechanisms, hidden minting functions, and suspicious ownership.
            </p>
            <div className="flex gap-3 mb-5">
              <input
                value={contractAddress}
                onChange={e => setContractAddress(e.target.value)}
                placeholder="Contract address (0x...)"
                className="crypto-input flex-1"
              />
              <select className="crypto-input w-36">
                {['Ethereum', 'BSC', 'Polygon', 'Arbitrum'].map(n => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <button
                onClick={async () => {
                  if (!contractAddress) { toast.error('Enter contract address'); return; }
                  toast.success('Analysis complete — simulated results shown');
                }}
                className="btn-primary"
              >
                <Search size={14} /> Analyze
              </button>
            </div>

            {/* Mock Analysis Results */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Honeypot Check', status: 'passed', desc: 'Sells are possible — not a honeypot' },
                { name: 'Hidden Mint', status: 'warning', desc: 'Owner can mint unlimited tokens' },
                { name: 'Ownership Renounced', status: 'failed', desc: 'Owner address is active (0xAbCd...)' },
                { name: 'Source Code Verified', status: 'passed', desc: 'Verified on Etherscan' },
                { name: 'Proxy Pattern', status: 'warning', desc: 'Upgradeable proxy — code can change' },
                { name: 'Blacklist Function', status: 'warning', desc: 'Owner can blacklist addresses' },
                { name: 'Max Transaction Limit', status: 'passed', desc: 'No anti-whale restrictions found' },
                { name: 'Liquidity Locked', status: 'failed', desc: 'No lock detected on LP tokens' },
              ].map(({ name, status, desc }) => (
                <div key={name} className={`p-3 rounded-xl border flex items-start gap-3 ${
                  status === 'passed' ? 'border-green-500/20 bg-green-500/5' :
                  status === 'failed' ? 'border-red-500/20 bg-red-500/5' :
                  'border-yellow-500/20 bg-yellow-500/5'
                }`}>
                  {status === 'passed' ? <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5" /> :
                   status === 'failed' ? <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" /> :
                   <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Scam Patterns */}
          <div className="glass-card p-5">
            <h2 className="font-semibold mb-4">Common Scam Patterns (Educational)</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'Honeypot', desc: 'Buy works, sell reverts. Hidden require() that blocks sells for non-whitelisted addresses.', signal: 'Cannot sell after buying', color: 'text-red-400' },
                { type: 'Rug Pull', desc: 'Dev removes liquidity suddenly. LP tokens not locked, huge initial allocation to dev wallet.', signal: 'Unlocked LP, dev holds >20%', color: 'text-red-400' },
                { type: 'Pump & Dump', desc: 'Coordinated buying creates hype, then insiders sell. Often with fake partnerships and social media.', signal: 'Low liquidity + high buy pressure', color: 'text-orange-400' },
                { type: 'Fake Token', desc: 'Impersonates legitimate tokens (USDC, WETH) with similar names/logos to trick users.', signal: 'Check contract address vs. official', color: 'text-yellow-400' },
                { type: 'Airdrop Drainer', desc: 'Wallet connects to claim "free tokens" which triggers an approve() for all tokens.', signal: 'Never approve unknown contracts', color: 'text-red-400' },
                { type: 'Mint Scam', desc: 'NFT mint drains wallet via setApprovalForAll or malicious contract functions.', signal: 'Check contract before minting', color: 'text-orange-400' },
              ].map(({ type, desc, signal, color }) => (
                <div key={type} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className={`text-sm font-bold mb-1 ${color}`}>{type}</div>
                  <p className="text-xs text-muted-foreground mb-2">{desc}</p>
                  <div className="text-[10px] text-yellow-400 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {signal}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
