// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC721Epoch base
 * @author Kiwari Labs
 */

import {SortedList} from "../../../utils/datastructures/SortedList.sol";
import {IERC7858Epoch} from "../interfaces/IERC7858Epoch.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {ERC721Utils} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

// @TODO following https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.1.0/contracts/token/ERC721/ERC721.sol

abstract contract ERC721EpochBase is Context, ERC165, IERC721, IERC721Errors, IERC721Metadata, IERC7858Epoch {
    using SortedList for SortedList.List;
    using Strings for uint256;

    string private _name;
    string private _symbol;

    struct Epoch {
        uint256 totalBalance;
        mapping(uint256 pointer => uint256[]) tokens; // it's possible to contains more than one tokenId.
        mapping(uint256 pointer => mapping(uint256 tokenId => uint256)) tokenIndex;
        SortedList.List list;
    }

    mapping(uint256 tokenId => uint256) private _tokenPointers;
    mapping(uint256 tokenId => address) private _owners;
    mapping(uint256 => mapping(address => Epoch)) private _balances;
    mapping(uint256 tokenId => address) private _tokenApprovals;
    mapping(address owner => mapping(address operator => bool)) private _operatorApprovals;

    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }

    /**
     * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
     *
     * IMPORTANT: Any overrides to this function that add ownership of tokens not tracked by the
     * core ERC-721 logic MUST be matched with the use of {_increaseBalance} to keep balances
     * consistent with ownership. The invariant to preserve is that for any address `a` the value returned by
     * `balanceOf(a)` must be equal to the number of tokens such that `_ownerOf(tokenId)` is `a`.
     */
    function _ownerOf(uint256 tokenId) internal view virtual returns (address) {
        return _owners[tokenId];
    }

    function _getApproved(uint256 tokenId) internal view virtual returns (address) {
        return _tokenApprovals[tokenId];
    }

    function _computeBalanceOverEpochRange(uint256 fromEpoch, uint256 toEpoch, address account) private view returns (uint256 balance) {
        unchecked {
            for (; fromEpoch <= toEpoch; fromEpoch++) {
                balance += _balances[fromEpoch][account].totalBalance;
            }
        }
    }

    function _computeBalanceAtEpoch(
        uint256 epoch,
        address account,
        uint256 pointer,
        uint256 duration
    ) private view returns (uint256 balance) {
        (uint256 element, uint256 value) = _findValidBalance(account, epoch, pointer, duration);
        Epoch storage _account = _balances[epoch][account];
        unchecked {
            balance = value;
            while (element > 0) {
                balance += _account.tokens[element].length;
                element = _account.list.next(element);
            }
        }
        return balance;
    }

    function _findValidBalance(
        address account,
        uint256 epoch,
        uint256 pointer,
        uint256 duration
    ) internal view returns (uint256 element, uint256 value) {
        SortedList.List storage list = _balances[epoch][account].list;
        if (!list.isEmpty()) {
            element = list.front();
            unchecked {
                while (pointer - element >= duration) {
                    element = list.next(element);
                }
            }
            value = _balances[epoch][account].tokens[element].length;
        }
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC7858Epoch).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function balanceOf(address owner) public view virtual returns (uint256) {
        if (owner == address(0)) {
            revert ERC721InvalidOwner(address(0));
        }
        uint256 pointer = _pointerProvider();
        (uint256 fromEpoch, uint256 toEpoch) = _getWindowRage(pointer);
        uint256 balance = _computeBalanceAtEpoch(fromEpoch, owner, pointer, _getPointersInWindow());
        if (fromEpoch == toEpoch) {
            return balance;
        } else {
            fromEpoch += 1;
        }
        balance += _computeBalanceOverEpochRange(fromEpoch, toEpoch, owner);
        return balance;
    }

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual returns (address) {
        return _requireOwned(tokenId);
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view virtual returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string.concat(baseURI, tokenId.toString()) : "";
    }

    /**
     * @dev Reverts if the `tokenId` doesn't have a current owner (it hasn't been minted, or it has been burned).
     * Returns the owner.
     *
     * Overrides to ownership logic should be done to {_ownerOf}.
     */
    function _requireOwned(uint256 tokenId) internal view returns (address) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
        return owner;
    }

     /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual {
        _approve(to, tokenId, _msgSender());
    }

    /**
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual returns (address) {
        _requireOwned(tokenId);

        return _getApproved(tokenId);
    }

    /**
     * @dev See {IERC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view virtual returns (bool) {
        return _operatorApprovals[owner][operator];
    }

    function _expired(uint256 epoch) internal view returns (bool) {
        unchecked {
            (uint256 fromEpoch, ) = _getWindowRage(_pointerProvider());
            if (epoch < fromEpoch) {
                return true;
            }
            return false;
        }
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual returns (string memory) {
        return "";
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual returns (address) {
        uint256 pointer = _pointerProvider();
        uint256 epoch = _getEpoch(pointer);
        address from = _ownerOf(tokenId);
        uint256 tokenPointer = _tokenPointers[tokenId];
        if (tokenPointer == 0) {
            tokenPointer = pointer;
            _tokenPointers[tokenId] = pointer;
        }

        // Perform (optional) operator check
        if (auth != address(0)) {
            // _checkAuthorized(from, auth, tokenId);
        }

        Epoch storage _sender = _balances[epoch][from];
        Epoch storage _recipient = _balances[epoch][to];

        // Execute the update
        if (from != address(0)) {
            // Clear approval. No need to re-authorize or emit the Approval event
            // _approve(address(0), tokenId, address(0), false);

            unchecked {
                _sender.totalBalance -= 1;
                _sender.tokenIndex[tokenPointer][_sender.tokens[tokenPointer].length - 1] = _sender.tokenIndex[tokenPointer][tokenId];
                _sender.tokens[tokenPointer].pop();
                delete _sender.tokenIndex[tokenPointer][tokenId];
                _sender.list.remove(tokenPointer);
            }
        }

        if (to != address(0)) {
            unchecked {
                _recipient.totalBalance += 1;
                _recipient.tokens[tokenPointer].push(tokenId);
                _recipient.tokenIndex[tokenPointer][tokenId] = _recipient.tokens[tokenPointer].length - 1;
                _recipient.list.insert(tokenPointer, false);
            }
        }

        if (to == address(0)) {
            delete _tokenPointers[tokenId];
        }

        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);

        return from;
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

    function _mint(address account, uint256 tokenId) internal {
        if (account == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }
        address previousOwner = _update(account, tokenId, address(0));
        if (previousOwner != address(0)) {
            revert ERC721InvalidSender(address(0));
        }
    }

    function _safeMint(address account, uint256 tokenId) internal {
        _safeMint(account, tokenId, "");
    }

    function _safeMint(address account, uint256 tokenId, bytes memory data) internal virtual {
        _mint(account, tokenId);
        ERC721Utils.checkOnERC721Received(_msgSender(), address(0), account, tokenId, data);
    }

    function _burn(uint256 tokenId) internal {
        address previousOwner = _update(address(0), tokenId, address(0));
        if (previousOwner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * The `auth` argument is optional. If the value passed is non 0, then this function will check that `auth` is
     * either the owner of the token, or approved to operate on all tokens held by this owner.
     *
     * Emits an {Approval} event.
     *
     * Overrides to this logic should be done to the variant with an additional `bool emitEvent` argument.
     */
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

    /// @dev See {IERC7858Epoch-currentEpoch}.
    function currentEpoch() public view virtual returns (uint256) {
        return _getEpoch(_pointerProvider());
    }

    /// @dev See {IERC7858Epoch-epochLength}.
    function epochLength() public view virtual returns (uint256) {
        return _getPointersInEpoch();
    }

    /// @dev See {IERC7858Epoch-epochType}.
    function epochType() public pure returns (EXPIRY_TYPE) {
        return _epochType();
    }

    /// @dev See {IERC7858Epoch-validityDuration}.
    function validityDuration() public view virtual returns (uint256) {
        return _getWindowSize();
    }

    /// @dev See {IERC7858Epoch-isEpochExpired}.
    function isEpochExpired(uint256 id) public view virtual returns (bool) {
        return _expired(id);
    }

    function _epochType() internal pure virtual returns (EXPIRY_TYPE) {}

    function _getEpoch(uint256 pointer) internal view virtual returns (uint256) {}

    function _getWindowRage(uint256 pointer) internal view virtual returns (uint256 fromEpoch, uint256 toEpoch) {}

    function _getWindowSize() internal view virtual returns (uint8) {}

    function _getPointersInEpoch() internal view virtual returns (uint40) {}

    function _getPointersInWindow() internal view virtual returns (uint40) {}

    function _pointerProvider() internal view virtual returns (uint256) {}
}
