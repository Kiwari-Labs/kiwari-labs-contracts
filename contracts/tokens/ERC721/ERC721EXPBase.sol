// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Base
/// @dev ERC721EXP Base contract each token have individual expiration date.
/// @author Kiwari Labs

import {IERC7858} from "./interfaces/IERC7858.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

abstract contract ERC721EXPBase is ERC721Enumerable, IERC7858 {
    struct AssetStamp {
        uint256 start;
        uint256 end;
    }

    mapping(uint256 => AssetStamp) private _tokensTimestamp;

    function _validation(uint256 tokenId) internal view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) return false;
        AssetStamp memory timestamp = _tokensTimestamp[tokenId];
        uint256 current = _pointerProvider();
        if (current < timestamp.start || current >= timestamp.end) {
            return false;
        }
        // if start and end is {0, 0} mean token non-expirable and return true.
        return true;
    }

    function _updateStamp(uint256 tokenId, uint64 start, uint64 end) internal {
        if (start >= end) {
            // @TODO revert ERC5007InvalidTime()
        }
        _tokensTimestamp[tokenId].start = start;
        _tokensTimestamp[tokenId].end = end;
        // @TODO emit tokenTimeSet(tokenId, start, end);
    }

    function _mintWithStamp(address to, uint256 tokenId, uint64 start, uint64 end) internal {
        _mint(to, tokenId);
        _updateStamp(tokenId, start, end);
    }

    // @TODO function support interface
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable) returns (bool) {
        return interfaceId == type(IERC7858).interfaceId || super.supportsInterface(interfaceId);
    }

    /// @inheritdoc IERC7858
    function startTime(uint256 tokenId) public view virtual override returns (uint256) {
        return _tokensTimestamp[tokenId].start;
    }

    /// @inheritdoc IERC7858
    function endTime(uint256 tokenId) public view virtual override returns (uint256) {
        return _tokensTimestamp[tokenId].end;
    }

    /// @inheritdoc IERC7858
    function isTokenValid(uint256 tokenId) public view returns (bool) {
        return _validation(tokenId);
    }

    function _expiryType() internal pure virtual returns (EXPIRY_TYPE) {}

    function _pointerProvider() internal view virtual returns (uint256) {}
}
