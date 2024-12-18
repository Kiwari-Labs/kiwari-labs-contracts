// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Base
/// @dev ERC721EXP Base contract each token have individual expiration date.
/// @author Kiwari Labs

import {IERC5007Mod} from "./extensions/IERC5007Mod.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

abstract contract ERC721EXPBase is ERC721Enumerable, IERC5007Mod {
    struct Timestamp {
        uint256 startBlock;
        uint256 endBlock;
    }

    mapping(uint256 => Timestamp) private _tokensTimestamp;

    /// @notice internal checking before transfer
    function _validation(uint256 tokenId) internal view returns (bool) {
        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            return false;
        }
        Timestamp memory timestamp = _tokensTimestamp[tokenId];
        uint256 current = block.number;
        if (timestamp.startBlock == 0 && timestamp.endBlock == 0) {
            // if start and end is 0,0 mean token non-expirable and return true
            return true;
        } else if (current > timestamp.startBlock || current < timestamp.endBlock) {
            // between start and end valid and return true
            return true;
        } else {
            // other case return false
            return false;
        }
    }

    function _updateTimestamp(uint256 tokenId, uint64 start, uint64 end) internal {
        if (start >= end) {
            // revert ERC5007InvalidTime()
        }
        _tokensTimestamp[tokenId].startBlock = start;
        _tokensTimestamp[tokenId].endBlock = end;

        // emit tokenTimeSet(tokenId, start, end);
    }

    function _mintWithTime(address to, uint256 tokenId, uint64 start, uint64 end) internal {
        _mint(to, tokenId);
        _updateTimestamp(tokenId, start, end);
    }

    // @TODO override update _validation before super._update()
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        if (_validation(tokenId)) {
            return super._update(to, tokenId, auth);
        } else {
            revert ERC5007TransferredInvalidToken();
        }
    }

    /// @inheritdoc IERC5007Mod
    function startTime(uint256 tokenId) public view virtual override returns (uint256) {
        return _tokensTimestamp[tokenId].startBlock;
    }

    /// @inheritdoc IERC5007Mod
    function endTime(uint256 tokenId) public view virtual override returns (uint256) {
        return _tokensTimestamp[tokenId].endBlock;
    }

    // @TODO function support interface
    function supportsInterface(bytes4 interfaceId) public view virtual override(IERC165, ERC721Enumerable) returns (bool) {
        return interfaceId == type(IERC5007Mod).interfaceId || super.supportsInterface(interfaceId);
    }

    // @TODO other useful function like isTokenValid
    function isTokenValid(uint256 tokenId) public view returns (bool) {
        address owner = _ownerOf(tokenId);
        if (owner != address(0)) {
            return _validation(tokenId);
        } else {
            return false;
        }
    }
}
