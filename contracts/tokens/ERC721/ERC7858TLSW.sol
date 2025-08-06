// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC721EXP using Timestamp-Based
 * @dev ERC721EXP Base contract each token have individual expiration date.
 * @author Kiwari Labs
 */

import {ERC7858EXPBase} from "./ERC7858EXPBase.sol";

abstract contract ERC7858TLSW is ERC7858EXPBase {
    constructor(string memory name_, string memory symbol_) ERC7858EXPBase(name_, symbol_) {}

    /**
     * @dev See {IERC7858-expiryType}.
     */
    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.TIME_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.timestamp;
    }
}
