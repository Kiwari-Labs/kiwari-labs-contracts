// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC721EXP using Block-Height-Based
 * @dev ERC721EXP Base contract each token have individual expiration date.
 * @author Kiwari Labs
 */

import {ERC7858EXPBase} from "./ERC7858EXPBase.sol";

abstract contract ERC7858BLSW is ERC7858EXPBase {
    constructor(string memory name_, string memory symbol_) ERC7858EXPBase(name_, symbol_) {}

    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.number;
    }
}
