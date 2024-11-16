// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC1155EXP Nearest Expiry Query extension contract
/// @author Kiwari Labs

import "../ERC1155EXPBase.sol";

abstract contract ERC1155EXPNearestExpiryQuery is ERC1155EXPBase {
    function _getNearestExpireBalanceOf(address account, uint256 id) internal view returns (uint256, uint256) {
        // @TODO
        return (0, 0);
    }
}
