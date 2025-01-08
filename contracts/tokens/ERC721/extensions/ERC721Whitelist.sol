// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Whitelist extension contract
/// @author Kiwari Labs

import "../ERC721EXPBase.sol";

abstract contract ERC721EXPWhitelist is ERC721EXPBase {
    /// @notice Emitted when an address is added to the whitelist
    /// @param caller Operate by the address
    /// @param account The address that was whitelist
    event Whitelisted(address indexed caller, address indexed account);

    /// @notice Emitted when an address is removed from the whitelist
    /// @param caller Operate by the address
    /// @param account The address that was removed from the whitelist
    event Unwhitelisted(address indexed caller, address indexed account);

    /// @notice Custom error definitions
    error InvalidWhitelistAddress();
    error NotExistInWhitelist();
    error ExistInWhitelist();

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        // override ERC721Base
        // if (_whitelist(auth) || _validation(tokenId)) {
        //     super._update(to, tokenId, auth);
        // } else {
        //     revert
        // }
    }
}
