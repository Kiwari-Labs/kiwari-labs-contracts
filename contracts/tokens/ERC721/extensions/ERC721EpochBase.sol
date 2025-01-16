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

abstract contract ERC721EpochBase is ERC165, IERC721, IERC721Errors, IERC721Metadata, IERC7858Epoch {
    using SortedList for SortedList.List;
    using Strings for uint256;

    string private _name;
    string private _symbol;

    struct Epoch {
        uint256 totalBalance;
        mapping(uint256 => uint256[]) tokens; // it's possible to contains more than one tokenId.
        SortedList.List list;
    }

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
        // uint256 pointer = _pointerProvider();
        // (uint256 fromEpoch, uint256 toEpoch) = _getWindowRage(pointer);
        // uint256 balance = _computeBalanceAtEpoch(fromEpoch, account, pointer, _getPointersInWindow());
        // if (fromEpoch == toEpoch) {
        // return balance;
        // } else {
        // fromEpoch += 1;
        // }
        // balance += _computeBalanceOverEpochRange(fromEpoch, toEpoch, account);
        // return balance;
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
