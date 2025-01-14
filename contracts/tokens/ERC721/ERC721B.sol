// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP using Block-Height-Based
/// @dev ERC721EXP Base contract each token have individual expiration date.
/// @author Kiwari Labs

import {ERC721EXPBase} from "./ERC721EXPBase.sol";

abstract contract ERC721B is ERC721EXPBase {

    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number;
    }

    function _expiryType() internal pure virtual override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.BLOCKS_BASED;
    }
    

    function _pointerProvider() internal view virtual override returns (uint256) {
        return _blockNumberProvider();
    }
}
