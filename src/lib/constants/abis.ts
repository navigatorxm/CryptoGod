// ============================================
// Standard ABIs for common token and contract interactions
// ============================================

export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const;

export const ERC20_MINTABLE_ABI = [
  ...ERC20_ABI,
  'function mint(address to, uint256 amount)',
  'function burn(uint256 amount)',
  'function burnFrom(address account, uint256 amount)',
  'function pause()',
  'function unpause()',
  'function paused() view returns (bool)',
  'function owner() view returns (address)',
  'function transferOwnership(address newOwner)',
  'function renounceOwnership()',
] as const;

export const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function approve(address to, uint256 tokenId)',
  'function getApproved(uint256 tokenId) view returns (address)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function transferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId)',
  'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
  'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
] as const;

export const ERC721_FULL_ABI = [
  ...ERC721_ABI,
  'function mint(address to)',
  'function safeMint(address to, string uri)',
  'function burn(uint256 tokenId)',
  'function pause()',
  'function unpause()',
  'function paused() view returns (bool)',
  'function owner() view returns (address)',
  'function transferOwnership(address newOwner)',
  'function setBaseURI(string baseURI)',
  'function reveal()',
  'function setMintPrice(uint256 price)',
  'function mintPrice() view returns (uint256)',
  'function maxSupply() view returns (uint256)',
  'function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address, uint256)',
] as const;

export const ERC1155_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
  'function uri(uint256 id) view returns (string)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
  'event ApprovalForAll(address indexed account, address indexed operator, bool approved)',
] as const;

export const MULTISIG_ABI = [
  'function submitTransaction(address to, uint256 value, bytes data) returns (uint256)',
  'function confirmTransaction(uint256 txIndex)',
  'function executeTransaction(uint256 txIndex)',
  'function revokeConfirmation(uint256 txIndex)',
  'function getOwners() view returns (address[])',
  'function getTransactionCount() view returns (uint256)',
  'function getTransaction(uint256 txIndex) view returns (address to, uint256 value, bytes data, bool executed, uint256 numConfirmations)',
  'function isConfirmed(uint256 txIndex, address owner) view returns (bool)',
  'function numConfirmationsRequired() view returns (uint256)',
  'event SubmitTransaction(address indexed owner, uint256 indexed txIndex, address indexed to, uint256 value, bytes data)',
  'event ConfirmTransaction(address indexed owner, uint256 indexed txIndex)',
  'event RevokeConfirmation(address indexed owner, uint256 indexed txIndex)',
  'event ExecuteTransaction(address indexed owner, uint256 indexed txIndex)',
] as const;

// ============================================
// Solidity Source Templates
// ============================================

export const ERC20_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title {{TOKEN_NAME}}
/// @notice {{TOKEN_DESCRIPTION}}
/// @dev ERC20 token with mint, burn, and pause capabilities
contract {{CONTRACT_NAME}} is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ERC20Permit {
    uint256 public constant MAX_SUPPLY = {{MAX_SUPPLY}} * 10 ** {{DECIMALS}};

    constructor(address initialOwner)
        ERC20("{{TOKEN_NAME}}", "{{TOKEN_SYMBOL}}")
        Ownable(initialOwner)
        ERC20Permit("{{TOKEN_NAME}}")
    {
        _mint(msg.sender, {{INITIAL_SUPPLY}} * 10 ** decimals());
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }

    function decimals() public pure override returns (uint8) {
        return {{DECIMALS}};
    }
}`;

export const ERC721_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/// @title {{COLLECTION_NAME}}
/// @notice {{COLLECTION_DESCRIPTION}}
contract {{CONTRACT_NAME}} is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Pausable,
    Ownable,
    ERC721Burnable,
    IERC2981
{
    using Strings for uint256;

    uint256 private _nextTokenId;
    uint256 public constant MAX_SUPPLY = {{MAX_SUPPLY}};
    uint256 public mintPrice = {{MINT_PRICE}} ether;
    bool public revealed = false;

    string private _baseTokenURI = "{{BASE_URI}}";
    string private _hiddenURI = "{{HIDDEN_URI}}";

    // Royalty info (EIP-2981)
    address private _royaltyRecipient;
    uint96 private _royaltyBps; // basis points (e.g., 500 = 5%)

    mapping(address => bool) public whitelist;
    bool public whitelistActive = true;

    event TokenMinted(address indexed to, uint256 tokenId, string uri);
    event Revealed(bool status);

    constructor(
        address initialOwner,
        address royaltyRecipient,
        uint96 royaltyBps
    )
        ERC721("{{COLLECTION_NAME}}", "{{COLLECTION_SYMBOL}}")
        Ownable(initialOwner)
    {
        _royaltyRecipient = royaltyRecipient;
        _royaltyBps = royaltyBps;
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit TokenMinted(to, tokenId, uri);
    }

    function publicMint(uint256 quantity) external payable {
        require(!whitelistActive || whitelist[msg.sender], "Not whitelisted");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        require(_nextTokenId + quantity <= MAX_SUPPLY, "Exceeds max supply");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId++;
            _safeMint(msg.sender, tokenId);
        }
    }

    function reveal() external onlyOwner {
        revealed = true;
        emit Revealed(true);
    }

    function setMintPrice(uint256 price) external onlyOwner {
        mintPrice = price;
    }

    function setWhitelist(address[] calldata addresses, bool status) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = status;
        }
    }

    function setWhitelistActive(bool active) external onlyOwner {
        whitelistActive = active;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (_royaltyRecipient, (salePrice * _royaltyBps) / 10000);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, IERC165)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

    function pause() public onlyOwner { _pause(); }
    function unpause() public onlyOwner { _unpause(); }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        if (!revealed) return _hiddenURI;
        return super.tokenURI(tokenId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
}`;

export const MULTISIG_TEMPLATE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Multi-Signature Wallet
/// @notice Requires M-of-N owner confirmations to execute transactions
contract MultiSigWallet {
    event Deposit(address indexed sender, uint amount, uint balance);
    event SubmitTransaction(address indexed owner, uint indexed txIndex, address indexed to, uint value, bytes data);
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmationsRequired;

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
        string description;
    }

    mapping(uint => mapping(address => bool)) public isConfirmed;
    Transaction[] public transactions;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier txExists(uint _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }

    modifier notExecuted(uint _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }

    modifier notConfirmed(uint _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }

    constructor(address[] memory _owners, uint _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 && _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmationsRequired = _numConfirmationsRequired;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(address _to, uint _value, bytes memory _data, string memory _description)
        public onlyOwner returns (uint txIndex)
    {
        txIndex = transactions.length;
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0,
            description: _description
        }));
        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    function confirmTransaction(uint _txIndex)
        public onlyOwner txExists(_txIndex) notExecuted(_txIndex) notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;
        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction(uint _txIndex)
        public onlyOwner txExists(_txIndex) notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        require(transaction.numConfirmations >= numConfirmationsRequired, "cannot execute tx");
        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "tx failed");
        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint _txIndex)
        public onlyOwner txExists(_txIndex) notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;
        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function getOwners() public view returns (address[] memory) { return owners; }
    function getTransactionCount() public view returns (uint) { return transactions.length; }
    function getTransaction(uint _txIndex) public view returns (
        address to, uint value, bytes memory data, bool executed, uint numConfirmations, string memory description
    ) {
        Transaction storage transaction = transactions[_txIndex];
        return (transaction.to, transaction.value, transaction.data, transaction.executed, transaction.numConfirmations, transaction.description);
    }
}`;
