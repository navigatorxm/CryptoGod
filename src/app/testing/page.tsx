'use client';

import { useState } from 'react';
import {
  FlaskConical,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Zap,
  Code2,
  AlertTriangle,
  Plus,
  Download,
  ExternalLink,
  Shield,
  Activity,
  Bug,
} from 'lucide-react';
import CodeBlock from '@/components/ui/CodeBlock';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import toast from 'react-hot-toast';

type TestStatus = 'passed' | 'failed' | 'pending' | 'running' | 'skipped';

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: TestStatus;
  duration?: number;
  gasUsed?: number;
  error?: string;
  assertions?: { desc: string; passed: boolean }[];
}

interface TestSuite {
  id: string;
  name: string;
  contract: string;
  network: string;
  tests: TestCase[];
  status: 'idle' | 'running' | 'done';
}

const SAMPLE_TEST_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MyToken.sol";

contract MyTokenTest is Test {
    MyToken token;
    address owner = address(1);
    address alice = address(2);
    address bob = address(3);

    function setUp() public {
        vm.startPrank(owner);
        token = new MyToken(owner);
        vm.stopPrank();
    }

    function test_InitialSupply() public {
        assertEq(token.totalSupply(), 1_000_000_000 * 1e18);
        assertEq(token.balanceOf(owner), 1_000_000_000 * 1e18);
    }

    function test_Transfer() public {
        vm.prank(owner);
        token.transfer(alice, 1000 * 1e18);
        assertEq(token.balanceOf(alice), 1000 * 1e18);
    }

    function test_Mint_OnlyOwner() public {
        vm.expectRevert();
        vm.prank(alice);
        token.mint(alice, 1000 * 1e18);
    }

    function test_Mint_Success() public {
        vm.prank(owner);
        token.mint(alice, 5000 * 1e18);
        assertEq(token.balanceOf(alice), 5000 * 1e18);
    }

    function test_Pause_Transfer() public {
        vm.prank(owner);
        token.pause();

        vm.expectRevert("Pausable: paused");
        vm.prank(owner);
        token.transfer(alice, 100 * 1e18);
    }

    function test_Burn() public {
        uint256 initialSupply = token.totalSupply();
        vm.prank(owner);
        token.burn(1000 * 1e18);
        assertEq(token.totalSupply(), initialSupply - 1000 * 1e18);
    }

    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 1, token.balanceOf(owner));
        vm.prank(owner);
        token.transfer(alice, amount);
        assertEq(token.balanceOf(alice), amount);
    }
}`;

const INITIAL_SUITES: TestSuite[] = [
  {
    id: '1',
    name: 'ERC20 Token Tests',
    contract: 'MyToken.sol',
    network: 'Hardhat Local',
    status: 'idle',
    tests: [
      { id: '1-1', name: 'test_InitialSupply', description: 'Verify correct initial supply and owner balance', status: 'pending' },
      { id: '1-2', name: 'test_Transfer', description: 'Token transfer from owner to alice', status: 'pending' },
      { id: '1-3', name: 'test_Mint_OnlyOwner', description: 'Non-owner mint should revert', status: 'pending' },
      { id: '1-4', name: 'test_Mint_Success', description: 'Owner can mint to any address', status: 'pending' },
      { id: '1-5', name: 'test_Pause_Transfer', description: 'Transfers revert when paused', status: 'pending' },
      { id: '1-6', name: 'test_Burn', description: 'Burn reduces total supply correctly', status: 'pending' },
      { id: '1-7', name: 'testFuzz_Transfer', description: 'Fuzz: random amounts always transfer correctly', status: 'pending', error: undefined },
    ],
  },
  {
    id: '2',
    name: 'ERC721 NFT Collection Tests',
    contract: 'NFTCollection.sol',
    network: 'Hardhat Local',
    status: 'idle',
    tests: [
      { id: '2-1', name: 'test_SafeMint', description: 'Owner can mint NFT with URI', status: 'pending' },
      { id: '2-2', name: 'test_MaxSupply', description: 'Minting beyond max supply reverts', status: 'pending' },
      { id: '2-3', name: 'test_Royalties', description: 'EIP-2981 royalty info is correct', status: 'pending' },
      { id: '2-4', name: 'test_Reveal', description: 'Hidden URI before reveal, real URI after', status: 'pending' },
    ],
  },
];

const CONSOLE_LOGS = [
  '> forge test --fork-url http://localhost:8545 -vv',
  'Compiling...',
  '[⠊] Compiling 12 files with 0.8.20',
  '[⠊] Solc 0.8.20 finished in 2.34s',
  'Compiler run successful!',
  '',
  'Running 7 tests for test/MyTokenTest.t.sol:MyTokenTest',
  '[PASS] test_InitialSupply() (gas: 12891)',
  '[PASS] test_Transfer() (gas: 34521)',
  '[PASS] test_Mint_OnlyOwner() (gas: 18234)',
  '[PASS] test_Mint_Success() (gas: 56789)',
  '[PASS] test_Pause_Transfer() (gas: 41233)',
  '[PASS] test_Burn() (gas: 28901)',
  '[PASS] testFuzz_Transfer(uint256) (runs: 256, μ: 35234, ~: 34891)',
  '',
  'Test result: OK. 7 passed; 0 failed; 0 skipped; finished in 1.23s',
  'Ran 1 test suite.',
];

const TESTNET_CONFIGS = [
  { name: 'Hardhat Local', port: 8545, chainId: 31337, accounts: 20, balance: '10000 ETH', color: '#F59E0B' },
  { name: 'Ethereum Sepolia', rpc: 'https://rpc.sepolia.org', chainId: 11155111, color: '#627EEA' },
  { name: 'BSC Testnet', rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545', chainId: 97, color: '#F3BA2F' },
  { name: 'Polygon Amoy', rpc: 'https://rpc-amoy.polygon.technology', chainId: 80002, color: '#8247E5' },
  { name: 'Solana Devnet', rpc: 'https://api.devnet.solana.com', color: '#9945FF' },
];

function StatusIcon({ status }: { status: TestStatus | 'idle' | 'done' | 'running' }) {
  if (status === 'passed' || status === 'done') return <CheckCircle2 size={14} className="text-green-400" />;
  if (status === 'failed') return <XCircle size={14} className="text-red-400" />;
  if (status === 'running') return <div className="spinner w-3.5 h-3.5 border-purple-400" />;
  if (status === 'skipped') return <div className="w-3.5 h-3.5 rounded-full bg-gray-600" />;
  return <div className="w-3.5 h-3.5 rounded-full border border-white/20" />;
}

type Tab = 'suites' | 'editor' | 'testnet' | 'debug';

export default function TestingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('suites');
  const [suites, setSuites] = useState<TestSuite[]>(INITIAL_SUITES);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [testCode, setTestCode] = useState(SAMPLE_TEST_CODE);
  const [activeTestnet, setActiveTestnet] = useState<string | null>(null);

  const runTests = async (suiteId?: string) => {
    setRunning(true);
    setConsoleLogs([]);
    setActiveTab('suites');

    const targetSuites = suiteId ? suites.filter(s => s.id === suiteId) : suites;

    // Mark as running
    setSuites(prev => prev.map(s =>
      (!suiteId || s.id === suiteId)
        ? { ...s, status: 'running', tests: s.tests.map(t => ({ ...t, status: 'running' })) }
        : s
    ));

    // Simulate console output
    for (const log of CONSOLE_LOGS) {
      await new Promise(r => setTimeout(r, 80));
      setConsoleLogs(prev => [...prev, log]);
    }

    // Simulate test results
    for (const suite of targetSuites) {
      for (const test of suite.tests) {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
        const pass = Math.random() > 0.1; // 90% pass rate
        setSuites(prev => prev.map(s =>
          s.id === suite.id
            ? {
              ...s,
              tests: s.tests.map(t =>
                t.id === test.id
                  ? {
                    ...t,
                    status: pass ? 'passed' : 'failed',
                    duration: Math.floor(Math.random() * 200 + 50),
                    gasUsed: Math.floor(Math.random() * 80000 + 20000),
                    error: pass ? undefined : 'AssertionError: expected 0 to equal 1',
                  }
                  : t
              ),
            }
            : s
        ));
      }
    }

    setSuites(prev => prev.map(s =>
      (!suiteId || s.id === suiteId) ? { ...s, status: 'done' } : s
    ));
    setRunning(false);
    toast.success('Test run complete!');
  };

  const totalTests = suites.reduce((acc, s) => acc + s.tests.length, 0);
  const passedTests = suites.reduce((acc, s) => acc + s.tests.filter(t => t.status === 'passed').length, 0);
  const failedTests = suites.reduce((acc, s) => acc + s.tests.filter(t => t.status === 'failed').length, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FlaskConical className="text-green-400" size={24} />
            Test Environment
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Isolated testnet environments, automated testing, and contract debugging
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => runTests()} disabled={running} className="btn-primary">
            {running ? <div className="spinner w-4 h-4" /> : <Play size={16} />}
            {running ? 'Running...' : 'Run All Tests'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: totalTests, color: 'text-foreground' },
          { label: 'Passed', value: passedTests, color: 'text-green-400' },
          { label: 'Failed', value: failedTests, color: 'text-red-400' },
          { label: 'Pass Rate', value: totalTests > 0 ? `${Math.round((passedTests / totalTests) * 100)}%` : 'N/A', color: passedTests === totalTests ? 'text-green-400' : 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-white/[0.04] border border-white/[0.06]">
        {(['suites', 'editor', 'testnet', 'debug'] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button capitalize ${activeTab === tab ? 'active' : ''}`}>
            {tab === 'suites' ? 'Test Suites' : tab === 'editor' ? 'Test Editor' : tab === 'testnet' ? 'Environments' : 'Debugger'}
          </button>
        ))}
      </div>

      {/* Test Suites */}
      {activeTab === 'suites' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Suite List */}
          <div className="space-y-3">
            {suites.map(suite => (
              <div key={suite.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusIcon status={suite.status} />
                      <span className="font-semibold text-sm">{suite.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{suite.contract} · {suite.network}</div>
                  </div>
                  <button
                    onClick={() => runTests(suite.id)}
                    disabled={running}
                    className="btn-secondary text-xs h-7 px-3"
                  >
                    <Play size={11} /> Run
                  </button>
                </div>
                <div className="space-y-1.5">
                  {suite.tests.map(test => (
                    <div key={test.id} className="flex items-center gap-2.5 text-xs p-2 rounded-lg bg-white/[0.02]">
                      <StatusIcon status={test.status} />
                      <span className="font-mono flex-1 truncate">{test.name}</span>
                      {test.duration && <span className="text-muted-foreground">{test.duration}ms</span>}
                      {test.gasUsed && <span className="text-yellow-400/70">{(test.gasUsed / 1000).toFixed(1)}K gas</span>}
                    </div>
                  ))}
                </div>
                {suite.tests.some(t => t.status === 'failed') && (
                  <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    {suite.tests.find(t => t.status === 'failed')?.error}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Console */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Terminal size={14} className="text-green-400" />
              <span className="text-sm font-semibold">Console Output</span>
              {running && <span className="badge badge-yellow text-[9px]">RUNNING</span>}
            </div>
            <div
              className="font-mono text-xs space-y-0.5 rounded-lg p-3 overflow-auto"
              style={{ background: 'hsl(240 15% 7%)', border: '1px solid rgba(255,255,255,0.05)', minHeight: '350px', maxHeight: '450px' }}
            >
              {consoleLogs.length === 0 ? (
                <div className="text-muted-foreground">Run tests to see output...</div>
              ) : consoleLogs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.includes('[PASS]') ? 'text-green-400' :
                    log.includes('[FAIL]') ? 'text-red-400' :
                    log.includes('OK.') ? 'text-green-300' :
                    log.includes('FAILED') ? 'text-red-300' :
                    log.startsWith('>') ? 'text-cyan-400' :
                    log.includes('Compiling') ? 'text-yellow-400' :
                    'text-muted-foreground'
                  }
                >
                  {log || ' '}
                </div>
              ))}
              {running && <div className="text-purple-400 animate-pulse">▋</div>}
            </div>
          </div>
        </div>
      )}

      {/* Test Editor */}
      {activeTab === 'editor' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Foundry/Hardhat Test Editor</h2>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs h-8"><Download size={12} /> Export</button>
              <button onClick={() => runTests()} disabled={running} className="btn-primary text-xs h-8">
                {running ? <div className="spinner w-3 h-3" /> : <Play size={12} />}
                Run Test File
              </button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5" style={{ background: 'hsl(240 15% 8%)' }}>
              <span className="text-xs font-mono text-muted-foreground">MyTokenTest.t.sol</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Solidity 0.8.20</span>
                <span>•</span>
                <span>Foundry</span>
              </div>
            </div>
            <CodeBlock
              language="solidity"
              style={atomOneDark}
              customStyle={{ margin: 0, background: 'hsl(240 15% 9%)', fontSize: '12px', minHeight: '500px' }}
              showLineNumbers
            >
              {testCode}
            </CodeBlock>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Test Framework', value: 'Foundry (forge test)' },
              { label: 'Coverage', value: '94.3% (estimated)' },
              { label: 'Gas Reporting', value: 'Enabled (--gas-report)' },
            ].map(({ label, value }) => (
              <div key={label} className="glass-card p-3 text-sm">
                <div className="text-muted-foreground text-xs mb-1">{label}</div>
                <div className="font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testnet Environments */}
      {activeTab === 'testnet' && (
        <div className="space-y-4">
          <h2 className="font-semibold">Available Test Environments</h2>
          <div className="grid grid-cols-2 gap-4">
            {TESTNET_CONFIGS.map(env => (
              <div key={env.name} className={`glass-card p-5 border ${activeTestnet === env.name ? 'border-green-500/30' : 'border-white/5'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: env.color }} />
                    <span className="font-semibold text-sm">{env.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTestnet === env.name && (
                      <span className="badge badge-green text-[9px]">ACTIVE</span>
                    )}
                    <button
                      onClick={() => {
                        setActiveTestnet(activeTestnet === env.name ? null : env.name);
                        toast.success(activeTestnet === env.name ? `Disconnected from ${env.name}` : `Connected to ${env.name}`);
                      }}
                      className={activeTestnet === env.name ? 'btn-secondary text-xs h-7 px-3' : 'btn-primary text-xs h-7 px-3'}
                    >
                      {activeTestnet === env.name ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {'chainId' in env && <div className="flex justify-between"><span className="text-muted-foreground">Chain ID</span><span className="font-mono">{env.chainId}</span></div>}
                  {'port' in env && <div className="flex justify-between"><span className="text-muted-foreground">Port</span><span className="font-mono">{env.port}</span></div>}
                  {'rpc' in env && <div className="flex justify-between"><span className="text-muted-foreground">RPC</span><span className="font-mono truncate max-w-[180px]">{env.rpc}</span></div>}
                  {'accounts' in env && <div className="flex justify-between"><span className="text-muted-foreground">Accounts</span><span>{env.accounts} pre-funded</span></div>}
                  {'balance' in env && <div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className="text-green-400">{env.balance} each</span></div>}
                </div>
                {env.name === 'Hardhat Local' && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <button className="text-xs text-purple-400 hover:underline">Get Test Accounts →</button>
                  </div>
                )}
                {env.name !== 'Hardhat Local' && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <a href="#" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                      <Zap size={11} /> Get Testnet Tokens (Faucet) <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debugger */}
      {activeTab === 'debug' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-300">
            <AlertTriangle size={16} className="flex-shrink-0" />
            Connect to a local Hardhat/Anvil node for step-by-step execution tracing. Use --debug flag with forge.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Bug size={16} className="text-red-400" />
                Step Debugger
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'PC', value: '0x004f', desc: 'Program Counter' },
                  { label: 'OP', value: 'SSTORE', desc: 'Current Opcode' },
                  { label: 'Gas', value: '23,456', desc: 'Remaining Gas' },
                  { label: 'Stack Depth', value: '3', desc: 'Call Stack' },
                  { label: 'Memory', value: '128 bytes', desc: 'Memory Size' },
                ].map(({ label, value, desc }) => (
                  <div key={label} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                    <div>
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <div className="text-[10px] text-muted-foreground">{desc}</div>
                    </div>
                    <span className="font-mono text-green-400">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn-secondary text-xs h-8 flex-1 justify-center">⏮ Back</button>
                <button className="btn-primary text-xs h-8 flex-1 justify-center">Step ⏭</button>
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity size={16} className="text-blue-400" />
                Gas Profiler
              </h3>
              <div className="space-y-2">
                {[
                  { func: 'mint()', gas: 65432, pct: 100 },
                  { func: '_mint() internal', gas: 45231, pct: 69 },
                  { func: '_update() hook', gas: 12341, pct: 19 },
                  { func: 'emit Transfer()', gas: 3456, pct: 5 },
                  { func: 'balanceOf (SLOAD)', gas: 2100, pct: 3 },
                ].map(({ func, gas, pct }) => (
                  <div key={func} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono">{func}</span>
                      <span className="text-yellow-400">{gas.toLocaleString()} gas</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
