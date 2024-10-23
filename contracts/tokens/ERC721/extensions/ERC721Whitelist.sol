// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Whitelist extension contract
/// @author Kiwari Labs

import "../ERC721EXPBase.sol";

abstract contract ERC721EXPWhitelist is ERC721EXPBase {
    /// @notice Struct to define balance infomation for each minter
    struct Whitelist {
        uint256 _spendableBalances;
        uint256 _unspendableBalances;
    }
}