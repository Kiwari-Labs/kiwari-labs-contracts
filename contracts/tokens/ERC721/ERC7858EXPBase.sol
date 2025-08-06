// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC721EXP Base
 * @dev ERC721EXP Base contract each token have individual expiration date.
 * @author Kiwari Labs
 */

import {IERC7858} from "./interfaces/IERC7858.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

abstract contract ERC7858EXPBase is ERC721, ERC721Enumerable, IERC7858 {
    struct AssetTimeStamp {
        uint256 start;
        uint256 end;
    }

    mapping(uint256 => AssetTimeStamp) private _tokensTimeStamp;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return interfaceId == type(IERC7858).interfaceId || super.supportsInterface(interfaceId);
    }

    function _validation(uint256 tokenId) internal view returns (bool) {
        _requireOwned(tokenId);
        AssetTimeStamp memory timestamp = _tokensTimeStamp[tokenId];
        uint256 current = _pointerProvider();
        // if start and end is {0, 0} mean token non-expirable and return false.
        if (timestamp.start == 0 && timestamp.end == 0) {
            return false;
        } else {
            return current >= timestamp.end;
        }
    }

    function _updateTimeStamp(uint256 tokenId, uint256 start, uint256 end) internal {
        _requireOwned(tokenId);
        if (start >= end) {
            revert ERC7858InvalidTimeStamp(start, end);
        }
        _tokensTimeStamp[tokenId].start = start;
        _tokensTimeStamp[tokenId].end = end;

        emit TokenExpiryUpdated(tokenId, start, end);
    }

    function _clearTimeStamp(uint256 tokenId) internal {
        _requireOwned(tokenId);
        delete _tokensTimeStamp[tokenId];
    }

    /**
     * @dev See {IERC7858-startTime}.
     */
    function startTime(uint256 tokenId) public view virtual override returns (uint256) {
        _requireOwned(tokenId);
        return _tokensTimeStamp[tokenId].start;
    }

    /**
     * @dev See {IERC7858-endTime}.
     */
    function endTime(uint256 tokenId) public view virtual override returns (uint256) {
        _requireOwned(tokenId);
        return _tokensTimeStamp[tokenId].end;
    }

    /**
     * @dev See {IERC7858-isTokenExpired}.
     */
    function isTokenExpired(uint256 tokenId) public view returns (bool) {
        return _validation(tokenId);
    }

    /**
     * @dev See {IERC7858-expiryType}.
     */
    function expiryType() public view virtual returns (EXPIRY_TYPE) {}

    function _pointerProvider() internal view virtual returns (uint256) {}
}
