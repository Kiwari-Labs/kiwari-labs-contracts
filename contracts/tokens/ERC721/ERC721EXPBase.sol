// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Base abstract contract
/// @dev ERC721EXP Base contract each token have individual expiration date.
/// @author Kiwari Labs

import {AssetStamp} from "../../utils/AssetStamp.sol";
import {IERC721EXPBase} from "../../interfaces/IERC721EXPBase.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

abstract contract ERC721EXPBase is ERC721, IERC721EXPBase {
    using AssetStamp for AssetStamp.Asset;

    AssetStamp.Asset private _asset;

    uint256 private _expiredPeriod;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    function _setExpiredPeriod(uint256 period) internal {
        _expiredPeriod = period;
    }

    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number;
    }

    function _mintWithExpiration(address to, uint256 tokenId, uint256 blockNumber) internal {
        _mint(to, tokenId);
        _asset.set(tokenId, blockNumber);
    }

    function _burnWithExpiration(uint256 tokenId) internal {
        _burn(tokenId);
        _asset.clear(tokenId);
    }

    function _updateExpiration(uint256 tokenId, uint256 blockNumber) internal {
        if (_asset.checked(tokenId)) {
            _asset.update(tokenId,blockNumber);
        }
    }

    function expiredPeriod() public view returns (uint256) {
        return _expiredPeriod;
    }

    function hasExpired(uint256 tokenId) public view virtual override returns (bool) {
        uint256 blockNumber = _asset.get(tokenId);
        if (blockNumber == 0) {
            return false; // Asset not stamped, therefore not expired.
        }
        return _blockNumberProvider() > (blockNumber + _expiredPeriod);
    }

    // @TODO balanceOf(address account) 
    // return only non-expiration balance
}
