// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC20EXP Blacklist extension contract
/// @author Kiwari Labs

import "../ERC20EXPBase.sol";

abstract contract ERC7818Blacklist is ERC20EXPBase {
    /// @notice Emitted when an address is added to the blacklist
    /// @param caller Operate by the address
    /// @param account The address that was blacklisted
    event Blacklisted(address indexed caller, address indexed account);

    /// @notice Emitted when an address is removed from the blacklist
    /// @param caller Operate by the address
    /// @param account The address that was removed from the blacklist
    event Unblacklisted(address indexed caller, address indexed account);

    /// @notice Emitted when a blacklisted address attempts a restricted action
    /// @param account The address that attempted the action
    error BlacklistedAddress(address account);

    /// @notice Emitted when an invalid address is used
    /// @param account The address that caused the error
    error InvalidAddress(address account);

    /// @dev A mapping to store the blacklist status of addresses
    mapping(address => bool) private _blacklist;

    /// @notice Modifier to prevent blacklisted addresses from performing restricted actions
    /// @dev This modifier should be used in functions that involve token transfers or sensitive actions
    modifier notBlacklisted(address account) {
        if (_blacklist[account]) {
            revert BlacklistedAddress(account);
        }
        _;
    }

    /// @notice Checks if an address is blacklisted
    /// @param account The address to check
    /// @return A boolean indicating whether the address is blacklisted
    function isBlacklisted(address account) public view returns (bool) {
        return _blacklist[account];
    }

    /// @notice Adds an address to the blacklist
    /// @param account The address to blacklist
    function _addToBlacklist(address account) internal {
        if (account == address(0)) {
            revert InvalidAddress(account);
        }
        _blacklist[account] = true;
        emit Blacklisted(_msgSender(), account);
    }

    /// @notice Removes an address from the blacklist
    /// @param account The address to unblacklist
    function _removeFromBlacklist(address account) internal {
        if (account == address(0)) {
            revert InvalidAddress(account);
        }
        _blacklist[account] = false;
        emit Unblacklisted(_msgSender(), account);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override notBlacklisted(from) notBlacklisted(to) {
        super._update(from, to, value);
    }
}
