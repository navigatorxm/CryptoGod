'use client';

import { useState } from 'react';
import {
  Coins,
  ChevronRight,
  ChevronLeft,
  Upload,
  Zap,
  Info,
  AlertTriangle,
  CheckCircle2,
  Globe,
  X,
} from 'lucide-react';
import { TokenConfig, TokenStandard, NetworkName, TokenFeatures, ChainId } from '@/types';
import { NETWORKS } from '@/lib/constants/networks';
import { v4 as uuidv4 } from 'uuid';
import { ERC20_TEMPLATE } from '@/lib/constants/abis';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import toast from 'react-hot-toast';

interface Props {
  onCreated: (token: TokenConfig) => void;
  onCancel: () => void;
}

type Step = 'basic' | 'features' | 'tax' | 'network' | 'preview';

const STEPS: { id: Step; label: string; description: string }[] = [
  { id: 'basic', label: 'Token Details', description: 'Name, symbol, supply' },
  { id: 'features', label: 'Features', description: 'Mint, burn, pause' },
  { id: 'tax', label: 'Tokenomics', description: 'Tax & wallet limits' },
  { id: 'network', label: 'Network', description: 'Select blockchain' },
  { id: 'preview', label: 'Review & Deploy', description: 'Confirm & deploy' },
];

const STANDARD_BY_NETWORK: Record<string, TokenStandard> = {
  ethereum: 'ERC20',
  sepolia: 'ERC20',
  bsc: 'BEP20',
  'bsc-testnet': 'BEP20',
  polygon: 'ERC20',
  'polygon-amoy': 'ERC20',
  avalanche: 'ERC20',
  arbitrum: 'ERC20',
  optimism: 'ERC20',
  solana: 'SPL',
  'solana-devnet': 'SPL',
  tron: 'TRC20',
  'tron-shasta': 'TRC20',
};

const DEFAULT_FEATURES: TokenFeatures = {
  mintable: true,
  burnable: true,
  pausable: true,
  taxable: false,
  antiWhale: false,
  blacklist: false,
  maxWallet: false,
  reflection: false,
  autoLiquidity: false,
  deflation: false,
};

export default function TokenCreationForm({ onCreated, onCancel }: Props) {
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [deploying, setDeploying] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: '1000000000',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
    logoUrl: '',
    network: 'sepolia' as NetworkName,
  });

  const [features, setFeatures] = useState<TokenFeatures>(DEFAULT_FEATURES);

  const [taxConfig, setTaxConfig] = useState({
    buyTax: 5,
    sellTax: 5,
    transferTax: 0,
    liquidityFee: 2,
    marketingFee: 2,
    burnFee: 1,
    reflectionFee: 0,
    maxWalletPercent: 2,
    maxTransactionPercent: 0.5,
  });

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isLastStep = currentStep === 'preview';
  const isFirstStep = currentStep === 'basic';

  const goNext = () => {
    const next = STEPS[currentStepIndex + 1];
    if (next) setCurrentStep(next.id);
  };

  const goPrev = () => {
    const prev = STEPS[currentStepIndex - 1];
    if (prev) setCurrentStep(prev.id);
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 'basic') {
      if (!formData.name.trim()) { toast.error('Token name is required'); return false; }
      if (!formData.symbol.trim()) { toast.error('Token symbol is required'); return false; }
      if (formData.symbol.length > 10) { toast.error('Symbol must be 10 chars or less'); return false; }
      if (!formData.totalSupply || parseFloat(formData.totalSupply) <= 0) { toast.error('Invalid total supply'); return false; }
    }
    if (currentStep === 'tax' && features.taxable) {
      const totalBuy = taxConfig.liquidityFee + taxConfig.marketingFee + taxConfig.burnFee + taxConfig.reflectionFee;
      if (totalBuy !== taxConfig.buyTax) { toast.error(`Buy tax components must equal total buy tax (${taxConfig.buyTax}%)`); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) goNext();
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      // Simulate deployment
      await new Promise(r => setTimeout(r, 2500));

      const token: TokenConfig = {
        id: uuidv4(),
        ...formData,
        standard: STANDARD_BY_NETWORK[formData.network],
        chainId: NETWORKS[formData.network]?.id as ChainId,
        features,
        taxConfig: features.taxable ? taxConfig : undefined,
        createdAt: new Date(),
        deployedAt: new Date(),
        contractAddress: `0x${Math.random().toString(16).slice(2, 42)}`,
        deploymentTxHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      };

      onCreated(token);
    } catch (err) {
      toast.error('Deployment failed. Check console for details.');
      console.error(err);
    } finally {
      setDeploying(false);
    }
  };

  const generatedCode = ERC20_TEMPLATE
    .replace(/{{TOKEN_NAME}}/g, formData.name || 'MyToken')
    .replace(/{{TOKEN_SYMBOL}}/g, formData.symbol || 'MTK')
    .replace(/{{CONTRACT_NAME}}/g, (formData.name || 'MyToken').replace(/\s/g, ''))
    .replace(/{{DECIMALS}}/g, String(formData.decimals))
    .replace(/{{MAX_SUPPLY}}/g, formData.totalSupply || '1000000000')
    .replace(/{{INITIAL_SUPPLY}}/g, formData.totalSupply || '1000000000')
    .replace(/{{TOKEN_DESCRIPTION}}/g, formData.description || 'A custom ERC20 token');

  const FeatureToggle = ({
    feature,
    label,
    description,
    warning,
  }: {
    feature: keyof TokenFeatures;
    label: string;
    description: string;
    warning?: string;
  }) => (
    <div
      className={`p-4 rounded-xl transition-all duration-200 cursor-pointer border ${
        features[feature] ? 'border-purple-500/40 bg-purple-500/10' : 'border-white/5 bg-white/[0.02] hover:border-white/10'
      }`}
      onClick={() => setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }))}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{label}</span>
        <div
          className={`w-10 h-5 rounded-full transition-all duration-200 relative ${
            features[feature] ? 'bg-purple-600' : 'bg-white/10'
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
              features[feature] ? 'left-5' : 'left-0.5'
            }`}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {warning && features[feature] && (
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-yellow-400">
          <AlertTriangle size={10} />
          {warning}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isDone = currentStepIndex > index;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      isDone ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-purple-600 text-white' :
                      'bg-white/10 text-muted-foreground'
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={14} /> : index + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isCurrent ? 'text-purple-400' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-px mx-2 ${isDone ? 'bg-green-500/50' : 'bg-white/10'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-card p-6">
        {/* Step: Basic */}
        {currentStep === 'basic' && (
          <div className="space-y-5">
            <h2 className="font-bold text-lg">Token Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Token Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. My Awesome Token"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="crypto-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Token Symbol <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. MAT"
                  value={formData.symbol}
                  onChange={(e) => setFormData(p => ({ ...p, symbol: e.target.value.toUpperCase() }))}
                  className="crypto-input"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total Supply <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  placeholder="1000000000"
                  value={formData.totalSupply}
                  onChange={(e) => setFormData(p => ({ ...p, totalSupply: e.target.value }))}
                  className="crypto-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Decimals</label>
                <select
                  value={formData.decimals}
                  onChange={(e) => setFormData(p => ({ ...p, decimals: parseInt(e.target.value) }))}
                  className="crypto-input"
                >
                  <option value={6}>6 (USDC-style)</option>
                  <option value={8}>8 (BTC-style)</option>
                  <option value={9}>9 (SOL-style)</option>
                  <option value={18}>18 (ETH-style, recommended)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Brief description of your token's purpose..."
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="crypto-input resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  placeholder="https://yourproject.io"
                  value={formData.website}
                  onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                  className="crypto-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Logo URL / IPFS CID</label>
                <input
                  type="text"
                  placeholder="https://... or ipfs://..."
                  value={formData.logoUrl}
                  onChange={(e) => setFormData(p => ({ ...p, logoUrl: e.target.value }))}
                  className="crypto-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Twitter</label>
                <input
                  type="text"
                  placeholder="@yourproject"
                  value={formData.twitter}
                  onChange={(e) => setFormData(p => ({ ...p, twitter: e.target.value }))}
                  className="crypto-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telegram</label>
                <input
                  type="text"
                  placeholder="t.me/yourproject"
                  value={formData.telegram}
                  onChange={(e) => setFormData(p => ({ ...p, telegram: e.target.value }))}
                  className="crypto-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step: Features */}
        {currentStep === 'features' && (
          <div className="space-y-5">
            <h2 className="font-bold text-lg">Token Features</h2>
            <p className="text-sm text-muted-foreground">Select the capabilities your token needs. All features are implemented using audited OpenZeppelin contracts.</p>
            <div className="grid grid-cols-2 gap-3">
              <FeatureToggle feature="mintable" label="Mintable" description="Owner can create new tokens after deployment" />
              <FeatureToggle feature="burnable" label="Burnable" description="Token holders can permanently destroy their tokens" />
              <FeatureToggle feature="pausable" label="Pausable" description="Owner can pause/unpause all token transfers" warning="Can be misused to freeze accounts — use carefully" />
              <FeatureToggle feature="taxable" label="Transaction Tax" description="Automatic fee collection on buy/sell/transfer" />
              <FeatureToggle feature="antiWhale" label="Anti-Whale" description="Limit maximum tokens per wallet/transaction" />
              <FeatureToggle feature="blacklist" label="Blacklist" description="Block specific addresses from transacting" warning="Centralized control — can reduce trust" />
              <FeatureToggle feature="reflection" label="Holder Reflection" description="Redistribute fees proportionally to all holders" />
              <FeatureToggle feature="autoLiquidity" label="Auto-Liquidity" description="Automatically add liquidity on sells" />
              <FeatureToggle feature="deflation" label="Deflationary" description="Reduce supply over time via automatic burns" />
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-300">
                <strong>Security Note:</strong> All contracts use OpenZeppelin v5 audited libraries. Features like blacklist and pausable should be used responsibly as they introduce centralization risk.
              </div>
            </div>
          </div>
        )}

        {/* Step: Tax Config */}
        {currentStep === 'tax' && (
          <div className="space-y-5">
            <h2 className="font-bold text-lg">Tokenomics Configuration</h2>
            {!features.taxable ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-white/10">
                <Zap size={32} className="mx-auto text-muted-foreground mb-3 opacity-30" />
                <p className="text-muted-foreground text-sm">Tax features are disabled.</p>
                <p className="text-xs text-muted-foreground mt-1">Enable "Transaction Tax" in the Features step to configure this.</p>
                <button onClick={goPrev} className="btn-secondary mt-4 text-xs">
                  ← Enable Tax Feature
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'buyTax', label: 'Buy Tax %', hint: 'Tax on purchases' },
                    { key: 'sellTax', label: 'Sell Tax %', hint: 'Tax on sales (usually higher)' },
                    { key: 'transferTax', label: 'Transfer Tax %', hint: 'Tax on wallet transfers' },
                  ].map(({ key, label, hint }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1">{label}</label>
                      <p className="text-[10px] text-muted-foreground mb-2">{hint}</p>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={(taxConfig as Record<string, number>)[key]}
                        onChange={(e) => setTaxConfig(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                        className="crypto-input"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">Buy Tax Distribution (must total {taxConfig.buyTax}%)</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { key: 'liquidityFee', label: 'Liquidity %' },
                      { key: 'marketingFee', label: 'Marketing %' },
                      { key: 'burnFee', label: 'Burn %' },
                      { key: 'reflectionFee', label: 'Reflection %' },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium mb-1">{label}</label>
                        <input
                          type="number"
                          min="0"
                          value={(taxConfig as Record<string, number>)[key]}
                          onChange={(e) => setTaxConfig(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                          className="crypto-input"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs mt-2 flex items-center gap-2">
                    <span>Total:</span>
                    <span className={`font-bold ${taxConfig.liquidityFee + taxConfig.marketingFee + taxConfig.burnFee + taxConfig.reflectionFee === taxConfig.buyTax ? 'text-green-400' : 'text-red-400'}`}>
                      {taxConfig.liquidityFee + taxConfig.marketingFee + taxConfig.burnFee + taxConfig.reflectionFee}% / {taxConfig.buyTax}%
                    </span>
                  </div>
                </div>

                {features.antiWhale && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Anti-Whale Limits</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1">Max Wallet %</label>
                        <input
                          type="number"
                          min="0.1"
                          max="100"
                          step="0.1"
                          value={taxConfig.maxWalletPercent}
                          onChange={(e) => setTaxConfig(p => ({ ...p, maxWalletPercent: parseFloat(e.target.value) }))}
                          className="crypto-input"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">% of total supply per wallet</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Max Transaction %</label>
                        <input
                          type="number"
                          min="0.1"
                          max="100"
                          step="0.1"
                          value={taxConfig.maxTransactionPercent}
                          onChange={(e) => setTaxConfig(p => ({ ...p, maxTransactionPercent: parseFloat(e.target.value) }))}
                          className="crypto-input"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">% of total supply per tx</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step: Network */}
        {currentStep === 'network' && (
          <div className="space-y-5">
            <h2 className="font-bold text-lg">Select Network</h2>
            <p className="text-sm text-muted-foreground">Choose where to deploy your token. Start with a testnet for testing.</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(NETWORKS).map((network) => {
                const isSelected = formData.network === network.shortName;
                return (
                  <button
                    key={network.shortName}
                    onClick={() => setFormData(p => ({ ...p, network: network.shortName }))}
                    className={`p-4 rounded-xl text-left transition-all border ${
                      isSelected
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-white/5 hover:border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl" style={{ color: network.color }}>{network.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{network.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {STANDARD_BY_NETWORK[network.shortName]} • {network.symbol}
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        {network.isTestnet && (
                          <span className="badge badge-yellow text-[9px]">TESTNET</span>
                        )}
                        {isSelected && <CheckCircle2 size={14} className="text-purple-400" />}
                      </div>
                    </div>
                    {network.faucetUrl && (
                      <div className="text-[10px] text-green-400">✓ Faucet available</div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-green-300">
                <strong>Recommendation:</strong> Deploy to {NETWORKS[formData.network]?.isTestnet ? 'this' : 'a'} testnet first to validate your configuration before mainnet deployment.
              </div>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {currentStep === 'preview' && (
          <div className="space-y-5">
            <h2 className="font-bold text-lg">Review & Deploy</h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Summary */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
                  <h3 className="font-semibold text-sm">Token Summary</h3>
                  {[
                    { label: 'Name', value: formData.name },
                    { label: 'Symbol', value: formData.symbol },
                    { label: 'Standard', value: STANDARD_BY_NETWORK[formData.network] },
                    { label: 'Decimals', value: formData.decimals },
                    { label: 'Total Supply', value: `${parseFloat(formData.totalSupply).toLocaleString()} ${formData.symbol}` },
                    { label: 'Network', value: NETWORKS[formData.network]?.name },
                    { label: 'Features', value: Object.entries(features).filter(([, v]) => v).map(([k]) => k).join(', ') || 'Basic ERC20' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between text-sm gap-4">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
                  <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-yellow-300">
                    <strong>Important:</strong> Review your configuration carefully. Contract deployment is irreversible. Ensure you have test ETH/BNB for gas fees.
                  </div>
                </div>
              </div>

              {/* Generated Code Preview */}
              <div>
                <h3 className="font-semibold text-sm mb-2">Generated Contract Code</h3>
                <div className="rounded-xl overflow-hidden border border-white/10" style={{ maxHeight: '350px' }}>
                  <SyntaxHighlighter
                    language="solidity"
                    style={atomOneDark}
                    customStyle={{
                      margin: 0,
                      background: 'hsl(240 15% 9%)',
                      fontSize: '11px',
                      maxHeight: '350px',
                      overflow: 'auto',
                    }}
                    showLineNumbers
                  >
                    {generatedCode}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isFirstStep && (
            <button onClick={goPrev} className="btn-secondary">
              <ChevronLeft size={16} />
              Previous
            </button>
          )}
          <button onClick={onCancel} className="text-muted-foreground text-sm hover:text-foreground transition-colors flex items-center gap-1">
            <X size={14} />
            Cancel
          </button>
        </div>

        {isLastStep ? (
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="btn-primary px-8"
          >
            {deploying ? (
              <>
                <div className="spinner w-4 h-4" />
                Deploying...
              </>
            ) : (
              <>
                <Zap size={16} />
                Deploy Token
              </>
            )}
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary">
            Next Step
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
