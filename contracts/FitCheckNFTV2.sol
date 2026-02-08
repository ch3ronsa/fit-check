// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FitCheckNFTV2
 * @notice Base Fit Check Studio NFT with creator revenue sharing
 * @dev ERC721 + ERC2981 royalties. Frame creators earn a share of mint fees.
 */
contract FitCheckNFTV2 is ERC721, ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard {
    uint256 private _nextTokenId;

    /// @notice Mint fee in ETH (0.0001 ETH ~ $0.25)
    uint256 public mintFee = 0.0001 ether;

    /// @notice Frame creator share of mint fee (50% = 5000 basis points)
    uint256 public creatorShareBps = 5000;

    /// @notice Default royalty percentage for secondary sales (5% = 500 basis points)
    uint96 public constant DEFAULT_ROYALTY_BPS = 500;

    /// @notice Mapping from tokenId to frame creator address
    mapping(uint256 => address) public frameCreators;

    /// @notice Total earnings per creator (withdrawable)
    mapping(address => uint256) public creatorEarnings;

    /// @notice Total platform earnings (withdrawable by owner)
    uint256 public platformEarnings;

    event Minted(uint256 indexed tokenId, address indexed minter, address indexed frameCreator, string uri);
    event CreatorPaid(address indexed creator, uint256 amount);
    event CreatorWithdraw(address indexed creator, uint256 amount);
    event PlatformWithdraw(address indexed owner, uint256 amount);
    event MintFeeUpdated(uint256 newFee);
    event CreatorShareUpdated(uint256 newShareBps);

    constructor() ERC721("BaseFitCheck", "FIT") Ownable(msg.sender) {
        // Set default royalty: 5% to contract owner on secondary sales
        _setDefaultRoyalty(msg.sender, DEFAULT_ROYALTY_BPS);
    }

    /**
     * @notice Mint a Fit Check NFT (free mint, no frame creator)
     * @param to Recipient address
     * @param uri IPFS token URI
     */
    function safeMint(address to, string memory uri) public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit Minted(tokenId, to, address(0), uri);
    }

    /**
     * @notice Mint with a community frame creator (paid mint with revenue sharing)
     * @param to Recipient address
     * @param uri IPFS token URI
     * @param frameCreator Address of the frame creator to receive share
     */
    function mintWithCreator(address to, string memory uri, address frameCreator) public payable nonReentrant {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(frameCreator != address(0), "Invalid creator address");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        // Store frame creator for this token
        frameCreators[tokenId] = frameCreator;

        // Split the fee
        uint256 creatorAmount = (msg.value * creatorShareBps) / 10000;
        uint256 platformAmount = msg.value - creatorAmount;

        creatorEarnings[frameCreator] += creatorAmount;
        platformEarnings += platformAmount;

        emit Minted(tokenId, to, frameCreator, uri);
        emit CreatorPaid(frameCreator, creatorAmount);
    }

    /**
     * @notice Frame creators withdraw their accumulated earnings
     */
    function withdrawCreatorEarnings() external nonReentrant {
        uint256 amount = creatorEarnings[msg.sender];
        require(amount > 0, "No earnings to withdraw");

        creatorEarnings[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit CreatorWithdraw(msg.sender, amount);
    }

    /**
     * @notice Platform owner withdraws accumulated platform earnings
     */
    function withdrawPlatformEarnings() external onlyOwner nonReentrant {
        uint256 amount = platformEarnings;
        require(amount > 0, "No earnings to withdraw");

        platformEarnings = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");

        emit PlatformWithdraw(owner(), amount);
    }

    /**
     * @notice Update the mint fee (owner only)
     */
    function setMintFee(uint256 newFee) external onlyOwner {
        mintFee = newFee;
        emit MintFeeUpdated(newFee);
    }

    /**
     * @notice Update the creator share percentage (owner only)
     * @param newShareBps New share in basis points (e.g. 5000 = 50%)
     */
    function setCreatorShare(uint256 newShareBps) external onlyOwner {
        require(newShareBps <= 10000, "Cannot exceed 100%");
        creatorShareBps = newShareBps;
        emit CreatorShareUpdated(newShareBps);
    }

    /**
     * @notice Update default royalty for secondary sales (owner only)
     */
    function setDefaultRoyalty(address receiver, uint96 feeBps) external onlyOwner {
        _setDefaultRoyalty(receiver, feeBps);
    }

    // ========== Required Overrides ==========

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
