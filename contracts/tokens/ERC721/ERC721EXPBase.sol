// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Base abstract contract
/// @dev ERC721EXP Base contract each token have individual expiration date.
/// @author Kiwari Labs
/// @notice it's adding expiration capabalitiy to ERC721 of '@openzeppelin/contracts'

import {SlidingWindow} from "../../abstracts/SlidingWindow.sol";
import {SortedCircularDoublyLinkedList as SCDLL} from "../../utils/SortedCircularDoublyLinkedList.sol";
// import {CircularDoublyLinkedList as CDLL} from "../../utils/CircularDoublyLinkedList.sol";
import {IERC721EXPBase} from "../../interfaces/IERC721EXPBase.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

/// @notice First-In-First-Out (FIFO) not suitable for ERC721 cause each token is unique it's need to be selective to spend.
///         However we still maintain list of token is sorted list for able to query nearest expire token

abstract contract ERC721EXPBase is
    Context,
    IERC721Errors,
    IERC721EXPBase,
    IERC721Metadata,
    SlidingWindow
{
    // using CDLL for CDLL.List;
    using SCDLL for SCDLL.List;
    using Strings for uint256;

    string private _name;
    string private _symbol;

    /// @notice Struct representing a slot containing balances mapped by blocks.
    struct Slot {
        uint256 slotBalance;
        SCDLL.List list; // use for store the blockNumber for handling even if the tokenId minted in non-sequential way
        mapping(uint256 blockNumber => SCDLL.List list) blockBalances; // didn't require to be in sorted list for saving gas
    }

    mapping(address account => mapping(uint256 era => mapping(uint8 slot => Slot))) private _balances;
    mapping(uint256 tokenId => uint256 blockNumber) private _mintedBlockOfToken;
    mapping(uint256 blockNumber => uint256 balance) private _worldBlockBalance;

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
        uint256 era,
        uint8 startSlot,
        uint8 endSlot
    ) private view returns (uint256 balance) {
        unchecked {
            for (; startSlot <= endSlot; startSlot++) {
                balance += _balances[account][era][startSlot].slotBalance;
            }
        }
        return balance;
    }

    function _lookBackBalance(
        address account,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        unchecked {
            balance = _bufferSlotBalance(account, fromEra, fromSlot, blockNumber);
            // Go to the next slot. Increase the era if the slot is over the limit.
            uint8 slotSizeCache = _getSlotPerEra();
            fromSlot = (fromSlot + 1) % slotSizeCache;
            if (fromSlot == 0) {
                fromEra++;
            }

            // It is not possible if the fromEra is more than toEra.
            if (fromEra == toEra) {
                balance += _slotBalance(account, fromEra, fromSlot, toSlot);
            } else {
                // Keep it simple stupid first by spliting into 3 part then sum.
                // Part1: calulate balance at fromEra in naive in naive way O(n)
                uint8 maxSlotCache = slotSizeCache - 1;
                balance += _slotBalance(account, fromEra, fromSlot, maxSlotCache);
                // Part2: calulate balance betaween fromEra and toEra in naive way O(n)
                for (uint256 era = fromEra + 1; era < toEra; era++) {
                    balance += _slotBalance(account, era, 0, maxSlotCache);
                }
                // Part3:calulate balance at toEra in navie way O(n)
                balance += _slotBalance(account, toEra, 0, toSlot);
            }
        }
    }

    /// @custom:gas-inefficiency 
    /// This method may incur gas inefficiencies due to the unique nature of ERC721 tokens. 
    /// Each minted block can potentially hold multiple tokens, complicating balance tracking 
    /// and leading to higher computational costs during operations.
    function _bufferSlotBalance(
        address account,
        uint256 era,
        uint8 slot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        Slot storage _spender = _balances[account][era][slot];
        uint256 expirationPeriodInBlockLengthCache = _getFrameSizeInBlockLength();
        uint256 blockNumberCache = _spender.list.head();
        unchecked {
            while (blockNumber - blockNumberCache >= expirationPeriodInBlockLengthCache) {
                if (blockNumberCache == 0) {
                    break;
                }
                blockNumberCache = _spender.list.next(blockNumberCache);
                balance += _spender.blockBalances[blockNumberCache].size();
            }
        }
    }

    function _slotOf(address account, uint256 fromEra, uint8 fromSlot) internal view returns (Slot storage) {
        return _balances[account][fromEra][fromSlot];
    }

    function _isExpired(uint256 tokenId) internal view returns (bool) {
        if (_blockNumberProvider() - _mintedBlockOfToken[tokenId] >= _getFrameSizeInBlockLength()) {
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
        }
        address from = _ownerOf(tokenId);
        uint256 mintedBlockCache = _mintedBlockOfToken[tokenId];
        (uint256 era, uint8 slot) = _calculateEraAndSlot(mintedBlockCache);

        Slot storage _spender = _balances[from][era][slot];
        Slot storage _recepient = _balances[from][era][slot];

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
                if (_spender.blockBalances[mintedBlockCache].size() == 0) {
                    _spender.list.remove(tokenId);
                }
            }
        }

        if (to != address(0)) {
            unchecked {
                _recepient.slotBalance += 1;
                _recepient.blockBalances[mintedBlockCache].insert(tokenId, "");
                // do nothing, if tokenId exist
                _recepient.list.insert(tokenId, "");
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
    }

    function _burn(uint256 tokenId) internal {
        address previousOwner = _update(address(0), tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
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

    // @TODO
    // safeMint
    // safeTransferFrom
    // transferFrom
}
