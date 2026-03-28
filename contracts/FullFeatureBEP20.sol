// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ============================================================
// CryptoGod Full-Featured BEP20 Token
// Features: Reflection, Auto-Liquidity, Buy/Sell Tax,
//           Anti-Whale, Blacklist, Mintable, Burnable, Pausable
// ============================================================

interface IBEP20 {
    function totalSupply() external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
    function getOwner() external view returns (address);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address _owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface IPancakeFactory {
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IPancakeRouter {
    function factory() external pure returns (address);
    function WETH() external pure returns (address);
    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _owner = _msgSender();
        emit OwnershipTransferred(address(0), _owner);
    }

    function owner() public view returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

contract CryptoGodToken is Context, IBEP20, Ownable {

    // ─── Token Metadata ──────────────────────────────────────
    string private _name;
    string private _symbol;
    uint8  private _decimals;

    // ─── Reflection State (RFI Pattern) ──────────────────────
    uint256 private constant MAX = ~uint256(0);
    uint256 private _tTotal;      // actual total supply
    uint256 private _rTotal;      // reflected total supply
    uint256 private _tFeeTotal;   // total reflection fees distributed

    mapping(address => uint256) private _rOwned;
    mapping(address => uint256) private _tOwned; // only used for excluded addresses
    mapping(address => mapping(address => uint256)) private _allowances;

    mapping(address => bool) private _isExcludedFromFee;
    mapping(address => bool) private _isExcludedFromReflection;
    address[] private _excluded;

    // ─── Blacklist ────────────────────────────────────────────
    mapping(address => bool) private _blacklisted;

    // ─── Tax Config (basis points: 100 = 1%) ─────────────────
    uint256 public buyReflectionFee;
    uint256 public buyLiquidityFee;
    uint256 public buyMarketingFee;
    uint256 public buyBurnFee;

    uint256 public sellReflectionFee;
    uint256 public sellLiquidityFee;
    uint256 public sellMarketingFee;
    uint256 public sellBurnFee;

    // active fees for current transfer (set before each transfer)
    uint256 private _activeReflectionFee;
    uint256 private _activeLiquidityFee;
    uint256 private _activeMarketingFee;
    uint256 private _activeBurnFee;

    // ─── Anti-Whale ───────────────────────────────────────────
    uint256 public maxTransactionAmount;
    uint256 public maxWalletAmount;

    // ─── PancakeSwap ──────────────────────────────────────────
    IPancakeRouter public pancakeRouter;
    address        public pancakePair;
    bool private _inSwap;
    bool public swapAndLiquifyEnabled = true;
    uint256 public swapTokensAtAmount;

    // ─── Wallets ──────────────────────────────────────────────
    address public marketingWallet;
    address public constant DEAD = 0x000000000000000000000000000000000000dEaD;

    // ─── Mintable / Pausable ──────────────────────────────────
    uint256 public maxSupply;
    bool    public paused;

    // ─── Events ───────────────────────────────────────────────
    event SwapAndLiquify(uint256 tokensSwapped, uint256 ethReceived, uint256 tokensIntoLp);
    event BlacklistUpdated(address indexed account, bool status);
    event MaxTxUpdated(uint256 amount);
    event MaxWalletUpdated(uint256 amount);
    event SwapEnabled(bool enabled);
    event BuyTaxUpdated(uint256 reflection, uint256 liquidity, uint256 marketing, uint256 burn);
    event SellTaxUpdated(uint256 reflection, uint256 liquidity, uint256 marketing, uint256 burn);

    modifier lockSwap() {
        _inSwap = true;
        _;
        _inSwap = false;
    }

    modifier whenNotPaused() {
        require(!paused || _isExcludedFromFee[_msgSender()], "Token: paused");
        _;
    }

    // ─── Constructor Config (avoids stack-too-deep) ─────────
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
    }

    // ─── BEP20 Standard ──────────────────────────────────────
    function name()       public view override returns (string memory) { return _name; }
    function symbol()     public view override returns (string memory) { return _symbol; }
    function decimals()   public view override returns (uint8)         { return _decimals; }
    function totalSupply()public view override returns (uint256)       { return _tTotal; }
    function getOwner()   public view override returns (address)       { return owner(); }

    function balanceOf(address account) public view override returns (uint256) {
        if (_isExcludedFromReflection[account]) return _tOwned[account];
        return _tokenFromReflection(_rOwned[account]);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address _owner, address spender) public view override returns (uint256) {
        return _allowances[_owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "BEP20: transfer amount exceeds allowance");
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), currentAllowance - amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        uint256 current = _allowances[_msgSender()][spender];
        require(current >= subtractedValue, "BEP20: decreased allowance below zero");
        _approve(_msgSender(), spender, current - subtractedValue);
        return true;
    }

    // ─── Reflection Helpers ───────────────────────────────────
    function _tokenFromReflection(uint256 rAmount) private view returns (uint256) {
        require(rAmount <= _rTotal, "rAmount exceeds rTotal");
        return rAmount / _getRate();
    }

    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply / tSupply;
    }

    function _getCurrentSupply() private view returns (uint256 rSupply, uint256 tSupply) {
        rSupply = _rTotal;
        tSupply = _tTotal;
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_rOwned[_excluded[i]] > rSupply || _tOwned[_excluded[i]] > tSupply)
                return (_rTotal, _tTotal);
            rSupply -= _rOwned[_excluded[i]];
            tSupply -= _tOwned[_excluded[i]];
        }
        if (rSupply < _rTotal / _tTotal) return (_rTotal, _tTotal);
    }

    // ─── Admin: Reflection Exclusion ─────────────────────────
    function excludeFromReflection(address account) external onlyOwner {
        require(!_isExcludedFromReflection[account], "Already excluded");
        if (_rOwned[account] > 0)
            _tOwned[account] = _tokenFromReflection(_rOwned[account]);
        _isExcludedFromReflection[account] = true;
        _excluded.push(account);
    }

    function includeInReflection(address account) external onlyOwner {
        require(_isExcludedFromReflection[account], "Not excluded");
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_excluded[i] == account) {
                _excluded[i] = _excluded[_excluded.length - 1];
                _tOwned[account] = 0;
                _isExcludedFromReflection[account] = false;
                _excluded.pop();
                break;
            }
        }
    }

    // ─── Admin: Fee Exclusion ─────────────────────────────────
    function setExcludedFromFee(address account, bool excluded) external onlyOwner {
        _isExcludedFromFee[account] = excluded;
    }

    // ─── Admin: Blacklist ─────────────────────────────────────
    function setBlacklisted(address account, bool status) external onlyOwner {
        _blacklisted[account] = status;
        emit BlacklistUpdated(account, status);
    }

    function batchBlacklist(address[] calldata accounts, bool status) external onlyOwner {
        for (uint256 i = 0; i < accounts.length; i++) {
            _blacklisted[accounts[i]] = status;
            emit BlacklistUpdated(accounts[i], status);
        }
    }

    // ─── Admin: Tax ───────────────────────────────────────────
    function setBuyTax(uint256 reflection, uint256 liquidity, uint256 marketing, uint256 burn)
        external onlyOwner
    {
        require(reflection + liquidity + marketing + burn <= 2500, "Buy tax too high");
        buyReflectionFee = reflection;
        buyLiquidityFee  = liquidity;
        buyMarketingFee  = marketing;
        buyBurnFee       = burn;
        emit BuyTaxUpdated(reflection, liquidity, marketing, burn);
    }

    function setSellTax(uint256 reflection, uint256 liquidity, uint256 marketing, uint256 burn)
        external onlyOwner
    {
        require(reflection + liquidity + marketing + burn <= 2500, "Sell tax too high");
        sellReflectionFee = reflection;
        sellLiquidityFee  = liquidity;
        sellMarketingFee  = marketing;
        sellBurnFee       = burn;
        emit SellTaxUpdated(reflection, liquidity, marketing, burn);
    }

    // ─── Admin: Anti-Whale ────────────────────────────────────
    function setMaxTransactionAmount(uint256 amount) external onlyOwner {
        require(amount >= _tTotal / 1000, "Too low"); // min 0.1%
        maxTransactionAmount = amount;
        emit MaxTxUpdated(amount);
    }

    function setMaxWalletAmount(uint256 amount) external onlyOwner {
        require(amount >= _tTotal / 1000, "Too low"); // min 0.1%
        maxWalletAmount = amount;
        emit MaxWalletUpdated(amount);
    }

    // ─── Admin: Other ─────────────────────────────────────────
    function setMarketingWallet(address wallet) external onlyOwner {
        require(wallet != address(0), "Zero address");
        _isExcludedFromFee[marketingWallet] = false;
        marketingWallet = wallet;
        _isExcludedFromFee[wallet] = true;
    }

    function setSwapAndLiquifyEnabled(bool enabled) external onlyOwner {
        swapAndLiquifyEnabled = enabled;
        emit SwapEnabled(enabled);
    }

    function setSwapTokensAtAmount(uint256 amount) external onlyOwner {
        swapTokensAtAmount = amount;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    // ─── Mint / Burn ──────────────────────────────────────────
    function mint(address to, uint256 amount) external onlyOwner {
        require(_tTotal + amount <= maxSupply, "Exceeds max supply");
        uint256 rAmount = amount * _getRate();
        _tTotal += amount;
        _rTotal += rAmount;
        _rOwned[to] += rAmount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint256 amount) external {
        address sender = _msgSender();
        require(balanceOf(sender) >= amount, "Insufficient balance");
        _transferTokens(sender, DEAD, amount, false);
    }

    // ─── Internal Transfer ────────────────────────────────────
    function _transfer(address from, address to, uint256 amount) private whenNotPaused {
        require(from != address(0) && to != address(0), "Zero address");
        require(amount > 0, "Amount must be > 0");
        require(!_blacklisted[from] && !_blacklisted[to], "Blacklisted");

        bool feelessSender    = _isExcludedFromFee[from];
        bool feelessRecipient = _isExcludedFromFee[to];

        if (!feelessSender && !feelessRecipient) {
            require(amount <= maxTransactionAmount, "Exceeds max tx");
            if (to != pancakePair)
                require(balanceOf(to) + amount <= maxWalletAmount, "Exceeds max wallet");
        }

        // Auto-liquidity swap
        if (
            balanceOf(address(this)) >= swapTokensAtAmount &&
            !_inSwap &&
            from != pancakePair &&
            swapAndLiquifyEnabled
        ) {
            _swapAndLiquify(swapTokensAtAmount);
        }

        bool takeFee = !feelessSender && !feelessRecipient;

        if (takeFee) {
            bool isBuy  = from == pancakePair;
            bool isSell = to   == pancakePair;
            if (isBuy) {
                _activeReflectionFee = buyReflectionFee;
                _activeLiquidityFee  = buyLiquidityFee;
                _activeMarketingFee  = buyMarketingFee;
                _activeBurnFee       = buyBurnFee;
            } else if (isSell) {
                _activeReflectionFee = sellReflectionFee;
                _activeLiquidityFee  = sellLiquidityFee;
                _activeMarketingFee  = sellMarketingFee;
                _activeBurnFee       = sellBurnFee;
            } else {
                // Wallet-to-wallet: use sell tax
                _activeReflectionFee = sellReflectionFee;
                _activeLiquidityFee  = sellLiquidityFee;
                _activeMarketingFee  = sellMarketingFee;
                _activeBurnFee       = sellBurnFee;
            }
        } else {
            _activeReflectionFee = 0;
            _activeLiquidityFee  = 0;
            _activeMarketingFee  = 0;
            _activeBurnFee       = 0;
        }

        _transferTokens(from, to, amount, takeFee);
    }

    function _transferTokens(address sender, address recipient, uint256 tAmount, bool takeFee) private {
        if (!takeFee) {
            // Temporarily zero active fees
            uint256 savedRef  = _activeReflectionFee;
            uint256 savedLiq  = _activeLiquidityFee;
            uint256 savedMkt  = _activeMarketingFee;
            uint256 savedBurn = _activeBurnFee;
            _activeReflectionFee = 0;
            _activeLiquidityFee  = 0;
            _activeMarketingFee  = 0;
            _activeBurnFee       = 0;
            _executeTransfer(sender, recipient, tAmount);
            _activeReflectionFee = savedRef;
            _activeLiquidityFee  = savedLiq;
            _activeMarketingFee  = savedMkt;
            _activeBurnFee       = savedBurn;
        } else {
            _executeTransfer(sender, recipient, tAmount);
        }
    }

    function _executeTransfer(address sender, address recipient, uint256 tAmount) private {
        uint256 tFee        = (tAmount * _activeReflectionFee) / 10000;
        uint256 tOther      = (tAmount * (_activeLiquidityFee + _activeMarketingFee + _activeBurnFee)) / 10000;
        uint256 tTransfer   = tAmount - tFee - tOther;
        uint256 currentRate = _getRate();

        uint256 rAmount   = tAmount   * currentRate;
        uint256 rFee      = tFee      * currentRate;
        uint256 rOther    = tOther    * currentRate;
        uint256 rTransfer = rAmount - rFee - rOther;

        // Debit sender
        _rOwned[sender] -= rAmount;
        if (_isExcludedFromReflection[sender]) _tOwned[sender] -= tAmount;

        // Credit recipient
        _rOwned[recipient] += rTransfer;
        if (_isExcludedFromReflection[recipient]) _tOwned[recipient] += tTransfer;

        // Distribute other fees
        if (tOther > 0) _distributeFees(tOther, currentRate);

        // Reflect fee
        if (tFee > 0) {
            _rTotal    -= rFee;
            _tFeeTotal += tFee;
        }

        emit Transfer(sender, recipient, tTransfer);
    }

    function _distributeFees(uint256 tOther, uint256 currentRate) private {
        uint256 totalOtherBps = _activeLiquidityFee + _activeMarketingFee + _activeBurnFee;
        if (totalOtherBps == 0) return;

        uint256 tLiquidity = (tOther * _activeLiquidityFee) / totalOtherBps;
        uint256 tMarketing = (tOther * _activeMarketingFee) / totalOtherBps;
        uint256 tBurn      = tOther - tLiquidity - tMarketing;

        if (tLiquidity > 0) {
            uint256 rLiq = tLiquidity * currentRate;
            _rOwned[address(this)] += rLiq;
            if (_isExcludedFromReflection[address(this)]) _tOwned[address(this)] += tLiquidity;
            emit Transfer(address(0), address(this), tLiquidity);
        }

        if (tMarketing > 0) {
            uint256 rMkt = tMarketing * currentRate;
            _rOwned[marketingWallet] += rMkt;
            if (_isExcludedFromReflection[marketingWallet]) _tOwned[marketingWallet] += tMarketing;
            emit Transfer(address(0), marketingWallet, tMarketing);
        }

        if (tBurn > 0) {
            uint256 rBurn = tBurn * currentRate;
            _rOwned[DEAD] += rBurn;
            if (_isExcludedFromReflection[DEAD]) _tOwned[DEAD] += tBurn;
            _tTotal -= tBurn; // reduce supply (deflation)
            emit Transfer(address(0), DEAD, tBurn);
        }
    }

    // ─── Swap & Liquify ───────────────────────────────────────
    function _swapAndLiquify(uint256 amount) private lockSwap {
        uint256 half      = amount / 2;
        uint256 otherHalf = amount - half;

        uint256 initialBNB = address(this).balance;
        _swapTokensForBNB(half);
        uint256 newBNB = address(this).balance - initialBNB;

        if (newBNB > 0 && otherHalf > 0) {
            _addLiquidity(otherHalf, newBNB);
            emit SwapAndLiquify(half, newBNB, otherHalf);
        }
    }

    function _swapTokensForBNB(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = pancakeRouter.WETH();

        _approve(address(this), address(pancakeRouter), tokenAmount);
        pancakeRouter.swapExactTokensForETHSupportingFeeOnTransferTokens(
            tokenAmount, 0, path, address(this), block.timestamp
        );
    }

    function _addLiquidity(uint256 tokenAmount, uint256 bnbAmount) private {
        _approve(address(this), address(pancakeRouter), tokenAmount);
        pancakeRouter.addLiquidityETH{value: bnbAmount}(
            address(this), tokenAmount, 0, 0, owner(), block.timestamp
        );
    }

    function _approve(address _owner, address spender, uint256 amount) private {
        require(_owner != address(0) && spender != address(0), "Zero address");
        _allowances[_owner][spender] = amount;
        emit Approval(_owner, spender, amount);
    }

    receive() external payable {}

    // ─── Emergency Recovery ───────────────────────────────────
    function withdrawStuckBNB() external onlyOwner {
        (bool ok,) = owner().call{value: address(this).balance}("");
        require(ok, "BNB transfer failed");
    }

    function withdrawStuckTokens(address token, uint256 amount) external onlyOwner {
        require(token != address(this), "Cannot withdraw own token");
        IBEP20(token).transfer(owner(), amount);
    }

    // ─── View Helpers ─────────────────────────────────────────
    function isBlacklisted(address account)          external view returns (bool) { return _blacklisted[account]; }
    function isExcludedFromFee(address account)      external view returns (bool) { return _isExcludedFromFee[account]; }
    function isExcludedFromReflection(address account) external view returns (bool) { return _isExcludedFromReflection[account]; }
    function totalReflected()                        external view returns (uint256) { return _tFeeTotal; }
    function circulatingSupply()                     external view returns (uint256) { return _tTotal - balanceOf(DEAD); }
}
