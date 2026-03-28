const fs = require('fs');
const filePath = 'd:/CryptoGod/contracts/FullFeatureBEP20.sol';
let src = fs.readFileSync(filePath, 'utf8');

// Replace the old constructor block with struct-based version
const oldBlock = `    // ─── Constructor ──────────────────────────────────────────
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint8  tokenDecimals,
        uint256 initialSupply,   // without decimals
        uint256 _maxSupply,      // without decimals (0 = unlimited)
        address _marketingWallet,
        address routerAddress,
        // Buy tax in basis points [reflection, liquidity, marketing, burn]
        uint256 bReflection,
        uint256 bLiquidity,
        uint256 bMarketing,
        uint256 bBurn,
        // Sell tax in basis points
        uint256 sReflection,
        uint256 sLiquidity,
        uint256 sMarketing,
        uint256 sBurn,
        // Anti-whale in basis points (e.g. 200 = 2%)
        uint256 maxTxBps,
        uint256 maxWalletBps
    ) {
        require(bReflection + bLiquidity + bMarketing + bBurn <= 2500, "Buy tax too high");
        require(sReflection + sLiquidity + sMarketing + sBurn <= 2500, "Sell tax too high");
        require(_marketingWallet != address(0), "Marketing wallet is zero");
        require(routerAddress    != address(0), "Router is zero");

        _name     = tokenName;
        _symbol   = tokenSymbol;
        _decimals = tokenDecimals;

        _tTotal  = initialSupply * 10 ** tokenDecimals;
        maxSupply = _maxSupply == 0 ? type(uint256).max : _maxSupply * 10 ** tokenDecimals;
        _rTotal  = (MAX - (MAX % _tTotal));

        marketingWallet = _marketingWallet;

        buyReflectionFee  = bReflection;
        buyLiquidityFee   = bLiquidity;
        buyMarketingFee   = bMarketing;
        buyBurnFee        = bBurn;
        sellReflectionFee = sReflection;
        sellLiquidityFee  = sLiquidity;
        sellMarketingFee  = sMarketing;
        sellBurnFee       = sBurn;

        // Anti-whale
        maxTransactionAmount = maxTxBps == 0 ? _tTotal : (_tTotal * maxTxBps) / 10000;
        maxWalletAmount      = maxWalletBps == 0 ? _tTotal : (_tTotal * maxWalletBps) / 10000;
        swapTokensAtAmount   = (_tTotal * 5) / 10000; // 0.05% triggers swap

        // PancakeSwap pair
        IPancakeRouter _router = IPancakeRouter(routerAddress);
        pancakePair   = IPancakeFactory(_router.factory()).createPair(address(this), _router.WETH());
        pancakeRouter = _router;

        // Fee exclusions
        _isExcludedFromFee[owner()]          = true;
        _isExcludedFromFee[address(this)]    = true;
        _isExcludedFromFee[DEAD]             = true;
        _isExcludedFromFee[_marketingWallet] = true;

        // All supply goes to deployer
        _rOwned[_msgSender()] = _rTotal;
        emit Transfer(address(0), _msgSender(), _tTotal);
    }`;

const newBlock = `    // ─── Constructor Config (avoids stack-too-deep) ─────────
    struct TokenConfig {
        string  name;
        string  symbol;
        uint8   decimals;
        uint256 initialSupply;   // without token decimals
        uint256 maxSupply;       // without token decimals (0 = same as initial)
        address marketingWallet;
        address routerAddress;
        uint256 bReflection; uint256 bLiquidity; uint256 bMarketing; uint256 bBurn;
        uint256 sReflection; uint256 sLiquidity; uint256 sMarketing; uint256 sBurn;
        uint256 maxTxBps;    // anti-whale max tx in bps (200 = 2%)
        uint256 maxWalletBps;// anti-whale max wallet in bps
    }

    constructor(TokenConfig memory cfg) {
        require(cfg.bReflection + cfg.bLiquidity + cfg.bMarketing + cfg.bBurn <= 2500, "Buy tax > 25%");
        require(cfg.sReflection + cfg.sLiquidity + cfg.sMarketing + cfg.sBurn <= 2500, "Sell tax > 25%");
        require(cfg.marketingWallet != address(0), "Marketing wallet is zero");
        require(cfg.routerAddress   != address(0), "Router is zero");

        _name     = cfg.name;
        _symbol   = cfg.symbol;
        _decimals = cfg.decimals;
        _tTotal   = cfg.initialSupply * 10 ** cfg.decimals;
        maxSupply = cfg.maxSupply == 0 ? _tTotal : cfg.maxSupply * 10 ** cfg.decimals;
        _rTotal   = (MAX - (MAX % _tTotal));

        marketingWallet   = cfg.marketingWallet;
        buyReflectionFee  = cfg.bReflection;
        buyLiquidityFee   = cfg.bLiquidity;
        buyMarketingFee   = cfg.bMarketing;
        buyBurnFee        = cfg.bBurn;
        sellReflectionFee = cfg.sReflection;
        sellLiquidityFee  = cfg.sLiquidity;
        sellMarketingFee  = cfg.sMarketing;
        sellBurnFee       = cfg.sBurn;

        maxTransactionAmount = cfg.maxTxBps    == 0 ? _tTotal : (_tTotal * cfg.maxTxBps)    / 10000;
        maxWalletAmount      = cfg.maxWalletBps == 0 ? _tTotal : (_tTotal * cfg.maxWalletBps) / 10000;
        swapTokensAtAmount   = (_tTotal * 5) / 10000;

        IPancakeRouter _router = IPancakeRouter(cfg.routerAddress);
        pancakePair   = IPancakeFactory(_router.factory()).createPair(address(this), _router.WETH());
        pancakeRouter = _router;

        _isExcludedFromFee[owner()]             = true;
        _isExcludedFromFee[address(this)]       = true;
        _isExcludedFromFee[DEAD]                = true;
        _isExcludedFromFee[cfg.marketingWallet] = true;

        _rOwned[_msgSender()] = _rTotal;
        emit Transfer(address(0), _msgSender(), _tTotal);
    }`;

if (!src.includes(oldBlock)) {
  // Try normalizing line endings
  const normalized = src.replace(/\r\n/g, '\n');
  const normalizedOld = oldBlock.replace(/\r\n/g, '\n');
  if (normalized.includes(normalizedOld)) {
    src = normalized.replace(normalizedOld, newBlock);
    fs.writeFileSync(filePath, src);
    console.log('Patched (after normalizing line endings)');
  } else {
    console.error('Old block not found! Check manually.');
    process.exit(1);
  }
} else {
  src = src.replace(oldBlock, newBlock);
  fs.writeFileSync(filePath, src);
  console.log('Patched constructor successfully');
}
