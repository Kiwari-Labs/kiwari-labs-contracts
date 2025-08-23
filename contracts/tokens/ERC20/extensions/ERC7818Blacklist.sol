// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ERC7818} from "../ERC7818.sol";

abstract contract ERC7818Blacklist is ERC7818 {
    /**
     * @notice Emitted when an account is added to the blacklist.
     * @dev This event is triggered when an account is successfully added to the blacklist.
     * @param caller The address that added the account to the blacklist.
     * @param account The address that was added to the blacklist.
     */
    event AddedToBlacklist(address indexed caller, address indexed account);

    /**
     * @notice Emitted when an account is removed from the blacklist.
     * @dev This event is triggered when an account is successfully removed from the blacklist.
     * @param caller The address that removed the account from the blacklist.
     * @param account The address that was removed from the blacklist.
     */
    event RemovedFromBlacklist(address indexed caller, address indexed account);

    /**
     * @notice Thrown when an account is blacklisted.
     * @dev This error is thrown if a blacklisted account attempts to perform an operation restricted to non-blacklisted accounts.
     * @param account The address of the blacklisted account.
     */
    error AccountBlacklisted(address account);

    /**
     * @notice Thrown when an account is not blacklisted.
     * @dev This error is thrown if an operation is attempted on an account that is not blacklisted when it should be.
     * @param account The address of the account that is not blacklisted.
     */
    error AccountNotBlacklisted(address account);

    mapping(address account => bool status) private _blacklist;

    /**
     * @notice Modifier for functions only callable by blacklisted accounts.
     */
    modifier onlyBlacklisted(address account) {
        if (!isBlacklisted(account)) revert AccountNotBlacklisted(account);
        _;
    }

    /**
     * @notice Modifier for functions only callable by non-blacklisted accounts.
     */
    modifier onlyNotBlacklisted(address account) {
        if (isBlacklisted(account)) revert AccountBlacklisted(account);
        _;
    }

    /**
     * @notice Returns if an account is blacklisted.
     * @param account The account to check.
     */
    function isBlacklisted(address account) public view returns (bool) {
        return _blacklist[account];
    }

    /**
     * @notice Adds an account to the blacklist.
     * @param account The account to blacklist.
     */
    function _addToBlacklist(address account) internal virtual onlyNotBlacklisted(account) {
        _blacklist[account] = true;
        emit AddedToBlacklist(_msgSender(), account);
    }

    /**
     * @notice Removes an account from the blacklist.
     * @param account The account to remove.
     */
    function _removeFromBlacklist(address account) internal virtual onlyBlacklisted(account) {
        _blacklist[account] = false;
        emit RemovedFromBlacklist(_msgSender(), account);
    }

    /**
     * @notice Overrides _update to allow transfers only between non-blacklisted accounts.
     * @param from The sender address.
     * @param to The receiver address.
     * @param value The transfer amount.
     */
    function _update(address from, address to, uint256 value) internal virtual override onlyNotBlacklisted(from) onlyNotBlacklisted(to) {
        super._update(from, to, value);
    }

    /**
     * @notice Overrides _updateAtEpoch to allow transfers only between non-blacklisted accounts.
     * @param epoch The epoch for the transfer.
     * @param from The sender's address.
     * @param to The receiver's address.
     * @param value The amount to transfer.
     */
    function _updateAtEpoch(
        uint256 epoch,
        address from,
        address to,
        uint256 value
    ) internal virtual override onlyNotBlacklisted(from) onlyNotBlacklisted(to) {
        super._updateAtEpoch(epoch, from, to, value);
    }
}
