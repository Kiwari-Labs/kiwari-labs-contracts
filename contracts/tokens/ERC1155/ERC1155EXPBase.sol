// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC1155EXP Base abstract contract
/// @author Kiwari Labs

import {AssetStamp} from "../../utils/AssetStamp.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

abstract contract ERC1155EXPBase is IERC1155 {
    using AssetStamp for AssetStamp.Asset; 

    AssetStamp.Asset private _asset;

    // @TODO balanceOf(address account, uint256 tokenId)
    // return only non-expiration balance 
}
