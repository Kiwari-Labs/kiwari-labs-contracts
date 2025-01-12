// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC20EXP Suspend extension
/// @author Kiwari Labs

import "../ERC20EXPBase.sol";

abstract contract ERC7818Suspend is ERC20EXPBase {
    /// @notice Emitted when an account is added to the suspended list.
    /// @param caller The address that added the account to the suspended list.
    /// @param account The address of the suspended account.
    event AddedToSuspend(address indexed caller, address indexed account);

    /// @notice Emitted when an account is removed from the suspended list.
    /// @param caller The address that removed the account from the suspended list.
    /// @param account The address of the reinstated account.
    event RemovedFromSuspend(address indexed caller, address indexed account);

    /// @notice Reverts if the account is suspended.
    /// @param account The address of the suspended account.
    error AccountSuspended(address account);

    /// @notice Reverts if the account is not suspended.
    /// @param account The address of the account that is not suspended.
    error AccountNotSuspended(address account);

    /// @dev Mapping to keep track of suspended accounts.
    mapping(address => bool) private _suspended;

    /// @notice Modifier to allow execution only if the account is suspended.
    /// @param account The address to check.
    modifier onlySuspended(address account) {
        if (!isSuspended(account)) revert AccountNotSuspended(account);
        _;
    }

    /// @notice Modifier to allow execution only if the account is not suspended.
    /// @param account The address to check.
    modifier onlyNotSuspended(address account) {
        if (isSuspended(account)) revert AccountSuspended(account);
        _;
    }

    /**
     * @notice Checks if an account is currently suspended.
     * @param account The address to check.
     * @return True if the account is suspended, false otherwise.
     */
    function isSuspended(address account) public view returns (bool) {
        return _suspended[account];
    }

    /**
     * @notice Adds an account to the suspended list.
     * @param account The address to suspend.
     */
    function _addToSuspend(address account) internal onlyNotSuspended(account) {
        _suspended[account] = true;
        emit AddedToSuspend(_msgSender(), account);
    }

    /**
     * @notice Removes an account from the suspended list.
     * @param account The address to reinstate.
     */
    function _removeFromSuspend(address account) internal onlySuspended(account) {
        _suspended[account] = false;
        emit RemovedFromSuspend(_msgSender(), account);
    }

    /**
     * @notice Overrides the `_update` function to include suspension checks.
     * @param from The address initiating the update.
     * @param to The address receiving the update.
     * @param value The value involved in the update.
     */
    function _update(address from, address to, uint256 value) internal virtual override onlyNotSuspended(from) {
        super._update(from, to, value);
    }
}
