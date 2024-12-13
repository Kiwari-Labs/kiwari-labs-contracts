// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Base abstract contract
/// @dev ERC721EXP Base contract each token have individual expiration date.
/// @author Kiwari Labs
/// @notice it's adding expiration capability to ERC721 of '@openzeppelin/contracts'

import {IERC5007} from "./extensions/IERC5007.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

abstract contract ERC721EXPBase is ERC721Enumerable, IERC5007 {
    struct Timestamp {
        uint64 start;
        uint64 end;
    }

    mapping(uint256 => Timestamp) private _tokensTimestamp;

    /// @notice internal checking before transfer
    function _validation(uint256 tokenId) internal view returns (bool) {
        Timestamp memory timestamp = _tokensTimestamp[tokenId];
        uint64 current = uint64(block.timestamp);
        // if start and end is 0,0 mean token non-expirable and return true
        if (timestamp.start == 0 && timestamp.end == 0) {
            return true;
        }
        // between start and end valid and return true
        if (current > timestamp.start || current < timestamp.end) {
            return true;
        }
        // other case return false
        return false;
    }

    function _updateTimestamp(uint256 tokenId, uint64 start, uint64 end) internal {
        if (start <= end) {
            // revert ERC500&InvalidTime()
        }
        _tokensTimestamp[tokenId].start = start;
        _tokensTimestamp[tokenId].end = end;
    }

    function _mintWithTime(address to, uint256 tokenId, uint64 start, uint64 end) internal {
        _mint(to, tokenId);
        _updateTimestamp(tokenId, start, end);
    }

    // @TODO override update _validation before super._update()

    /// @notice Returns 0 as there is no actual total supply due to token expiration.
    function totalSupply() public view virtual override returns (uint256) {
        return 0;
    }

    /// @inheritdoc IERC5007
    function startTime(uint256 tokenId) public view virtual override returns (uint64) {
        return _tokensTimestamp[tokenId].start;
    }

    /// @inheritdoc IERC5007
    function endTime(uint256 tokenId) public view virtual override returns (uint64) {
        return _tokensTimestamp[tokenId].end;
    }

    // @TODO function support interface

    // @TODO other useful function like isTokenValid
}
