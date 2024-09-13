// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Base abstract contract
/// @author Kiwari Labs

import {AssetStamp} from "../libraries/AssetStamp.sol";
// import {IERC721} form "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import {IERC721Enumerable} "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
// import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

abstract contract ERC721EXPBase {
    using AssetStamp for AssetStamp.Asset;

    mapping(uint256 => AssetStamp.Asset) private _asset;

    uint256 private _expiredPeriod;

    // function _blockNumberProvider() internal view virtual returns (uint256) {
    //     return block.number;
    // }

    // function _mint(address account, uint256 blockNumber) internal {
    //      _mint(tokenId);
    //      _asset[tokenId].set(blockNumber);
    // }

    // function _burn(uint256 tokenId) internal {
    //      _burn(tokenId);
    //      _asset[tokenId].clear();
    //}

    // function _update(tokenId ,uint256 blockNumber) internal {
    //      _asset[tokenId].update(blockNumber);
    //}

    // function isAssetExpired(uint256 tokenId) public view returns (bool) {
    //     uint256 blockNumber = _asset[tokenId].blockNumber;
    //     if (blockNumber == 0) {
    //         return false; // Asset not stamped, therefore not expired.
    //     }
    //     return _blockNumberProvider > (blockNumber + _expiredPeriod);
    // }
}
