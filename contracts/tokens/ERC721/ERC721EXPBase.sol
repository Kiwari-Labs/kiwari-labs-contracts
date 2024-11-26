// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Base abstract contract
/// @dev ERC721EXP Base contract each token have individual expiration date.
/// @author Kiwari Labs
/// @notice it's adding expiration capabalitiy to ERC721 of '@openzeppelin/contracts'

import {SlidingWindow} from "../../abstracts/SlidingWindow.sol";
import {SortedCircularDoublyLinkedList as SCDLL} from "../../utils/LightWeightSortedCircularDoublyLinkedList.sol";
import {IERC721EXPBase} from "./IERC721EXPBase.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {EnumerableSet as EnumSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {ERC721Utils} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol";

/// @notice First-In-First-Out (FIFO) not suitable for ERC721 cause each token is unique it's need to be selective to spend.
///         However we still maintain list of blockNumber that store token is sorted list.

abstract contract ERC721EXPBase is
    Context,
    ERC165,
    IERC721,
    IERC721Errors,
    IERC721EXPBase,
    IERC721Metadata,
    SlidingWindow
{
    using EnumSet for EnumSet.UintSet;
    using SCDLL for SCDLL.List;
    using Strings for uint256;

    string private _name;
    string private _symbol;

    /// @notice Struct representing a slot containing balances mapped by blocks.
    struct Slot {
        uint256 slotBalance;
        SCDLL.List list; // use for store the blockNumber for handling even if the tokenId minted in non-sequential way
        mapping(uint256 blockNumber => EnumSet.UintSet set) blockBalances; // didn't require to be in sorted list for saving gas
    }

    mapping(address account => mapping(uint256 epoch => mapping(uint8 slot => Slot))) private _balances;
    mapping(uint256 tokenId => uint256 blockNumber) private _mintedBlockOfTokens;
    mapping(uint256 blockNumber => uint256 balance) private _worldBlockBalances;

    mapping(uint256 tokenId => address) private _owners;
    mapping(uint256 tokenId => address) private _tokenApprovals;
    mapping(address owner => mapping(address operator => bool)) private _operatorApprovals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 blockNumber_,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) SlidingWindow(blockNumber_, blockTime_, frameSize_, slotSize_) {
        _name = name_;
        _symbol = symbol_;
    }

    function _slotBalance(
        address account,
        uint256 epoch,
        uint8 startSlot,
        uint8 endSlot
    ) private view returns (uint256 balance) {
        unchecked {
            for (; startSlot <= endSlot; startSlot++) {
                balance += _balances[account][epoch][startSlot].slotBalance;
            }
        }
        return balance;
    }

    function _lookBackBalance(
        address account,
        uint256 fromEpoch,
        uint256 toEpoch,
        uint8 fromSlot,
        uint8 toSlot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        unchecked {
            balance = _bufferSlotBalance(account, fromEpoch, fromSlot, blockNumber);
            // Go to the next slot. Increase the epoch if the slot is over the limit.
            uint8 slotSizeCache = _getSlotsPerEpoch();
            fromSlot = (fromSlot + 1) % slotSizeCache;
            if (fromSlot == 0) {
                fromEpoch++;
            }

            // It is not possible if the fromEpoch is more than toEpoch.
            if (fromEpoch == toEpoch) {
                balance += _slotBalance(account, fromEpoch, fromSlot, toSlot);
            } else {
                // Keep it simple stupid first by spliting into 3 part then sum.
                // Part1: calulate balance at fromEpoch in naive in naive way O(n)
                uint8 maxSlotCache = slotSizeCache - 1;
                balance += _slotBalance(account, fromEpoch, fromSlot, maxSlotCache);
                // Part2: calulate balance betaween fromEpoch and toEpoch in naive way O(n)
                for (uint256 epoch = fromEpoch + 1; epoch < toEpoch; epoch++) {
                    balance += _slotBalance(account, epoch, 0, maxSlotCache);
                }
                // Part3:calulate balance at toEpoch in navie way O(n)
                balance += _slotBalance(account, toEpoch, 0, toSlot);
            }
        }
    }

    /// @custom:gas-inefficiency
    /// This method may incur gas inefficiencies due to the unique nature of ERC721 tokens.
    /// Each minted block can potentially hold multiple tokens, complicating balance tracking
    /// and leading to higher computational costs during operations.
    function _bufferSlotBalance(
        address account,
        uint256 epoch,
        uint8 slot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        Slot storage _spender = _balances[account][epoch][slot];
        uint256 expirationPeriodInBlockLengthCache = _getFrameSizeInBlockLength();
        uint256 blockNumberCache = _spender.list.head();
        unchecked {
            while (blockNumber - blockNumberCache >= expirationPeriodInBlockLengthCache) {
                if (blockNumberCache == 0) {
                    break;
                }
                blockNumberCache = _spender.list.next(blockNumberCache);
                balance += _spender.blockBalances[blockNumberCache].length();
            }
        }
    }

    function _slotOf(address account, uint256 fromEpoch, uint8 fromSlot) internal view returns (Slot storage) {
        return _balances[account][fromEpoch][fromSlot];
    }

    function _isExpired(uint256 tokenId) internal view returns (bool) {
        if (_blockNumberProvider() - _worldBlockBalances[tokenId] >= _getFrameSizeInBlockLength()) {
            return true;
        }
    }

    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }

    function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
        if (_isExpired(tokenId)) {
            return address(0);
        }
        return _owners[tokenId];
    }

    function _getApproved(uint256 tokenId) internal view virtual returns (address) {
        return _tokenApprovals[tokenId];
    }

    function _isAuthorized(address owner, address spender, uint256 tokenId) internal view virtual returns (bool) {
        return
            spender != address(0) &&
            (owner == spender || isApprovedForAll(owner, spender) || _getApproved(tokenId) == spender);
    }

    function _checkAuthorized(address owner, address spender, uint256 tokenId) internal view virtual {
        if (!_isAuthorized(owner, spender, tokenId)) {
            if (owner == address(0)) {
                revert ERC721NonexistentToken(tokenId);
            } else {
                revert ERC721InsufficientApproval(spender, tokenId);
            }
        }
    }

    function approve(address to, uint256 tokenId) public virtual {
        _approve(to, tokenId, _msgSender());
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /// @notice Returns 0 as there is no actual total supply due to token expiration.
    /// @dev This function returns the total supply of tokens, which is constant and set to 0.
    function totalSupply() public pure returns (uint256) {
        return 0;
    }

    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string.concat(baseURI, tokenId.toString()) : "";
    }

    function getApproved(uint256 tokenId) public view virtual returns (address) {
        _requireOwned(tokenId);

        return _getApproved(tokenId);
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    function isApprovedForAll(address owner, address operator) public view virtual returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual returns (address) {
        // Perform token expired check
        if (_isExpired(tokenId)) {
            revert ERC721NonexistentToken(tokenId);
            // revert ERC721ExpiredToken(tokenId);
        }
        address from = _ownerOf(tokenId);
        uint256 mintedBlockCache = _mintedBlockOfTokens[tokenId];
        (uint256 epoch, uint8 slot) = _calculateEpochAndSlot(mintedBlockCache);

        Slot storage _spender = _balances[from][epoch][slot];
        Slot storage _recepient = _balances[from][epoch][slot];

        // Perform (optional) operator check
        if (auth != address(0)) {
            _checkAuthorized(from, auth, tokenId);
        }

        // Execute the update
        if (from != address(0)) {
            // Clear approval. No need to re-authorize or emit the Approval event
            _approve(address(0), tokenId, address(0), false);

            unchecked {
                _spender.slotBalance -= 1;
                _spender.blockBalances[mintedBlockCache].remove(tokenId);
                if (_spender.blockBalances[mintedBlockCache].length() == 0) {
                    _spender.list.remove(tokenId);
                }
            }
        }

        if (to != address(0)) {
            unchecked {
                _recepient.slotBalance += 1;
                _recepient.blockBalances[mintedBlockCache].add(tokenId);
                // do nothing, if tokenId exist
                _recepient.list.insert(tokenId);
            }
        }

        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        return from;
    }

    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        return _requireOwned(tokenId);
    }

    function _mint(address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner != address(0)) {
            revert ERC721InvalidSender(address(0));
        }
        _worldBlockBalances[_blockNumberProvider()] += 1;
    }

    function _burn(uint256 tokenId) internal {
        address previousOwner = _update(address(0), tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
        _worldBlockBalances[_blockNumberProvider()] -= 1;
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(to, tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        } else if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    function _approve(address to, uint256 tokenId, address auth) internal {
        _approve(to, tokenId, auth, true);
    }

    function _approve(address to, uint256 tokenId, address auth, bool emitEvent) internal virtual {
        // Avoid reading the owner unless necessary
        if (emitEvent || auth != address(0)) {
            address owner = _requireOwned(tokenId);

            // We do not use _isAuthorized because single-token approvals should not be able to call approve
            if (auth != address(0) && owner != auth && !isApprovedForAll(owner, auth)) {
                revert ERC721InvalidApprover(auth);
            }

            if (emitEvent) {
                emit Approval(owner, to, tokenId);
            }
        }

        _tokenApprovals[tokenId] = to;
    }

    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
        if (operator == address(0)) {
            revert ERC721InvalidOperator(operator);
        }
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    function _requireOwned(uint256 tokenId) internal view returns (address) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
        return owner;
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual {
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        address previousOwner = _update(to, tokenId, _msgSender());
        if (previousOwner != from) {
            revert ERC721IncorrectOwner(from, tokenId, previousOwner);
        }
    }

    function balanceOf(address owner) public view virtual returns (uint256) {
        if (owner == address(0)) {
            revert ERC721InvalidOwner(address(0));
        }
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) = _frame(blockNumberCache);
        return _lookBackBalance(owner, fromEpoch, toEpoch, fromSlot, toSlot, blockNumberCache);
    }

    function _safeTransfer(address from, address to, uint256 tokenId) internal {
        _safeTransfer(from, to, tokenId, "");
    }

    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory data) internal virtual {
        _transfer(from, to, tokenId);
        ERC721Utils.checkOnERC721Received(_msgSender(), from, to, tokenId, data);
    }

    function _safeMint(address to, uint256 tokenId) internal {
        _safeMint(to, tokenId, "");
    }

    function _safeMint(address to, uint256 tokenId, bytes memory data) internal virtual {
        _mint(to, tokenId);
        ERC721Utils.checkOnERC721Received(_msgSender(), address(0), to, tokenId, data);
    }

    /// @notice Retrieves the total balance stored at a specific block.
    /// @dev This function returns the balance of the given block from the internal `_worldBlockBalances` mapping.
    /// @param blockNumber The block number for which the balance is being queried.
    /// @return balance The total balance stored at the given block number.
    function getBlockBalance(uint256 blockNumber) external view virtual returns (uint256) {
        return _worldBlockBalances[blockNumber];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC721EXPBase).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
