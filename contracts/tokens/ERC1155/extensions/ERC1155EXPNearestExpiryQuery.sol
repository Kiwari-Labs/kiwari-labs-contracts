// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC1155EXP Nearest Expiry Query extension contract
/// @author Kiwari Labs

import "../ERC1155EXPBase.sol";

abstract contract ERC1155EXPNearestExpiryQuery is ERC1155EXPBase {
    /// @notice Struct to define balance infomation for each minter
    struct Whitelist {
        uint256 _spendableBalances;
        uint256 _unspendableBalances;
    }
}
