// SPDX-License-Identifier: Apache-2.0
/// @author Kirawri Labs
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../ERC20EXPBase.sol";

/**
 * @dev See https://eips.ethereum.org/EIPS/eip-2980
 */
abstract contract ERC7818Frozen is ERC20EXPBase {
    /**
     * @dev Custom error for when an account is frozen.
     * @param account The address of the account.
     */
    error AccountFrozen(address account);

    /**
     * @dev Custom error for when an account is not frozen.
     * @param account The address of the account.
     */
    error AccountNotFrozen(address account);

    /**
     * @dev Event emitted when an account is frozen.
     * @param caller The address of the caller.
     * @param account The address that was frozen.
     */
    event Freeze(address indexed caller, address indexed account);

    /**
     * @dev Event emitted when an account is unfrozen.
     * @param caller The address of the caller.
     * @param account The address that was unfrozen.
     */
    event Unfreeze(address indexed caller, address indexed account);

    /**
     * @dev Mapping to keep track of frozen accounts.
     */
    mapping(address account => bool status) private _frozen;

    /**
     * @dev Modifier to ensure the account is frozen.
     * @param account The address to check.
     */
    modifier onlyFrozen(address account) {
        if (!isFrozen(account)) revert AccountNotFrozen(account);
        _;
    }

    /**
     * @dev Modifier to ensure the account is not frozen.
     * @param account The address to check.
     */
    modifier onlyNotFrozen(address account) {
        if (isFrozen(account)) revert AccountFrozen(account);
        _;
    }

    /**
     * @notice Checks if an account is frozen.
     * @param account The address to check.
     * @return True if the account is frozen, false otherwise.
     */
    function isFrozen(address account) public view returns (bool) {
        return _frozen[account];
    }

    /**
     * @dev Freezes an account.
     * @param account The address to freeze.
     */
    function _freeze(address account) internal virtual onlyNotFrozen(account) {
        _frozen[account] = true;
        emit Freeze(_msgSender(), account);
    }

    /**
     * @dev Unfreezes an account.
     * @param account The address to unfreeze.
     */
    function _unfreeze(address account) internal virtual onlyFrozen(account) {
        _frozen[account] = false;
        emit Unfreeze(_msgSender(), account);
    }

    /**
     * @notice Overrides the `_update` function to include frozen checks.
     * @param from The address initiating the update.
     * @param to The address receiving the update.
     * @param value The value involved in the update.
     */
    function _update(address from, address to, uint256 value) internal virtual override onlyNotFrozen(from) {
        super._update(from, to, value);
    }

    /**
     * @notice Overrides the `_updateAtEpoch` function to include frozen checks.
     * @param epoch The epoch for the transfer.
     * @param from The sender's address.
     * @param to The receiver's address.
     * @param value The amount to transfer.
     */
    function _updateAtEpoch(uint256 epoch, address from, address to, uint256 value) internal virtual override onlyNotFrozen(from) {
        super._updateAtEpoch(epoch, from, to, value);
    }
}
