// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../ERC20EXPBase.sol";

abstract contract ERC7818MintQuota is ERC20EXPBase {
    /**
     * @notice Emitted when the requested mint amount exceeds the available quota.
     * @param minter The address of the minter.
     * @param available The available quota for the minter.
     * @param requested The requested amount to mint.
     */
    error MintQuotaExceeded(address minter, uint256 available, uint256 requested);

    /**
     * @notice Emitted when the minter is not set.
     * @param minter The address of the minter.
     */
    error MinterNotSet(address minter);

    /**
     * @notice Emitted when the minter is already set.
     * @param minter The address of the minter.
     */
    error MinterAlreadySet(address minter);

    /**
     * @notice Emitted when a new minter is added.
     * @param caller The address of the caller adding the minter.
     * @param minter The address of the new minter.
     */
    event MinterAdded(address indexed caller, address indexed minter);

    /**
     * @notice Emitted when a minter is removed.
     * @param caller The address of the caller removing the minter.
     * @param minter The address of the minter being removed.
     */
    event MinterRemoved(address indexed caller, address indexed minter);

    /**
     * @notice Emitted when a minter's quota is updated.
     * @param caller The address of the caller setting the quota.
     * @param minter The address of the minter whose quota is updated.
     * @param quota The updated quota value.
     */
    event QuotaSet(address indexed caller, address indexed minter, uint256 quota);

    /**
     * @notice Emitted when tokens are minted under the quota system.
     * @param minter The address of the minter.
     * @param to The address receiving the minted tokens.
     * @param amount The amount of tokens minted.
     */
    event QuotaMinted(address indexed minter, address indexed to, uint256 amount);

    /**
     * @dev Represents a minter, their quota, minted amount, and active status.
     */
    struct Minter {
        uint256 quota; // The total quota available for the minter.
        uint256 minted; // The amount of tokens minted by the minter.
        bool active; // Whether the minter is active or not.
    }

    /**
     * @dev Mapping from the minter address to their respective `Minter` struct.
     */
    mapping(address => Minter) private _minters;

    /**
     * @notice Mints tokens with a quota limit.
     * @dev This function will ensure that the minter has enough quota before minting.
     * @param to The address to mint the tokens to.
     * @param amount The amount of tokens to mint.
     */
    function _mintWithQuota(address to, uint256 amount) internal virtual {
        address minter = _msgSender();

        if (!isMinter(minter)) revert MinterNotSet(minter);

        uint256 quota_ = quota(minter);
        if (amount > quota_) revert MintQuotaExceeded(minter, quota_, amount);

        _minters[minter].quota -= amount;
        _minters[minter].minted += amount;

        _mint(to, amount);

        emit QuotaMinted(minter, to, amount);
    }

    /**
     * @notice Sets the quota for a given minter.
     * @dev Only callable if the minter is active.
     * @param minter The address of the minter.
     * @param quota_ The new quota value.
     */
    function _setQuota(address minter, uint256 quota_) internal virtual {
        if (!isMinter(minter)) revert MinterNotSet(minter);
        _minters[minter].quota = quota_;
        emit QuotaSet(_msgSender(), minter, quota_);
    }

    /**
     * @notice Increases the quota of a given minter.
     * @dev Only callable if the minter is active.
     * @param minter The address of the minter.
     * @param increase The amount to increase the quota by.
     */
    function _increaseQuota(address minter, uint256 increase) internal virtual {
        if (!isMinter(minter)) revert MinterNotSet(minter);
        _minters[minter].quota += increase;
        emit QuotaSet(_msgSender(), minter, _minters[minter].quota);
    }

    /**
     * @notice Decreases the quota of a given minter.
     * @dev Only callable if the minter is active and the decrease is valid.
     * @param minter The address of the minter.
     * @param decrease The amount to decrease the quota by.
     */
    function _decreaseQuota(address minter, uint256 decrease) internal virtual {
        if (!isMinter(minter)) revert MinterNotSet(minter);

        uint256 quota_ = quota(minter);
        if (decrease > quota_) revert MintQuotaExceeded(minter, quota_, decrease);

        _minters[minter].quota -= decrease;
        emit QuotaSet(_msgSender(), minter, _minters[minter].quota);
    }

    /**
     * @notice Adds a new minter with a given quota.
     * @dev Ensures the minter does not already exist.
     * @param minter The address of the new minter.
     * @param quota_ The initial quota for the minter.
     */
    function _addMinter(address minter, uint256 quota_) internal virtual {
        if (isMinter(minter)) revert MinterAlreadySet(minter);

        _minters[minter].quota = quota_;
        _minters[minter].active = true;

        emit MinterAdded(_msgSender(), minter);
    }

    /**
     * @notice Removes a minter, deactivating them.
     * @dev Only callable if the minter is active.
     * @param minter The address of the minter to be removed.
     */
    function _removeMinter(address minter) internal virtual {
        if (!isMinter(minter)) revert MinterNotSet(minter);
        _minters[minter].active = false;
        emit MinterRemoved(_msgSender(), minter);
    }

    /**
     * @notice Checks whether an address is an active minter.
     * @param minter The address to check.
     * @return bool True if the address is an active minter, false otherwise.
     */
    function isMinter(address minter) public view returns (bool) {
        return _minters[minter].active;
    }

    /**
     * @notice Retrieves the current quota of a minter.
     * @param minter The address of the minter.
     * @return uint256 The current quota of the minter.
     */
    function quota(address minter) public view returns (uint256) {
        return _minters[minter].quota;
    }

    /**
     * @notice Retrieves the total minted amount for a minter.
     * @param minter The address of the minter.
     * @return uint256 The total minted amount by the minter.
     */
    function minted(address minter) public view returns (uint256) {
        return _minters[minter].minted;
    }
}
