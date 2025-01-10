// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC7818 Mint Quota extension
/// @author Kiwari Labs

import "../ERC20EXPBase.sol";

abstract contract ERC7818MintQuota is ERC20EXPBase {
    /// @notice Thrown when a minter exceeds their minting quota.
    /// @param minter The address of the minter.
    /// @param available The remaining available quota.
    /// @param requested The amount requested to mint.
    error MintQuotaExceeded(address minter, uint256 available, uint256 requested);

    /// @notice Thrown when an operation is performed for an unregistered minter.
    /// @param minter The address of the minter.
    error MinterNotSet(address minter);

    /// @notice Emitted when a minter's quota is set.
    /// @param caller The address of the caller who set the quota.
    /// @param minter The address of the minter.
    /// @param quota The amount of the quota set for the minter.
    event QuotaSet(address indexed caller, address indexed minter, uint256 quota);

    /// @notice Emitted when a minter's quota is reset.
    /// @param caller The address of the caller who reset the quota.
    /// @param minter The address of the minter whose quota is reset.
    event QuotaReset(address indexed caller, address indexed minter);

    /// @notice Emitted when tokens are minted from a minter's quota.
    /// @param minter The address of the minter who minted the tokens.
    /// @param to The recipient of the minted tokens.
    /// @param amount The amount of tokens minted.
    event QuotaMinted(address indexed minter, address indexed to, uint256 amount);

    /// @dev Minter structure holds information about a minter's quota and minted amount.
    struct Minter {
        uint256 quota; // The minting quota assigned to the minter.
        uint256 minted; // The amount of tokens minted by the minter.
    }

    mapping(address account => Minter minter) private _minters;

    /// @notice Mint tokens within the sender's quota.
    /// @param to Recipient of the tokens.
    /// @param amount Amount to mint.
    function _mintWithQuota(address to, uint256 amount) internal virtual {
        address minter = _msgSender();

        if (!isMinter(minter)) {
            revert MinterNotSet(minter);
        }

        if (amount > remainingQuota(minter)) {
            revert MintQuotaExceeded(minter, remainingQuota(minter), amount);
        }

        _minters[minter].minted += amount;
        _mint(to, amount);

        emit QuotaMinted(_msgSender(), to, amount);
    }

    /// @notice Set a minter's quota.
    /// @param minter Address of the minter.
    /// @param quota_ New quota value.
    function _setQuota(address minter, uint256 quota_) internal virtual {
        _minters[minter].quota = quota_;
        emit QuotaSet(_msgSender(), minter, quota_);
    }

    /// @notice Reset a minter's minted amount.
    /// @param minter Address of the minter.
    function _resetQuota(address minter) internal virtual {
        if (!isMinter(minter)) {
            revert MinterNotSet(minter);
        }
        _minters[minter].minted = 0;
        emit QuotaReset(_msgSender(), minter);
    }

    /// @notice Get a minter's remaining quota.
    /// @param minter Address of the minter.
    /// @return Remaining quota.
    function remainingQuota(address minter) public view returns (uint256) {
        if (minted(minter) < quota(minter) && isMinter(minter)) {
            unchecked {
                return _minters[minter].quota - _minters[minter].minted;
            }
        }
        return 0;
    }

    /// @notice Check if an address is a minter.
    /// @param minter Address to check.
    /// @return True if the address is a minter.
    function isMinter(address minter) public view returns (bool) {
        return _minters[minter].quota > 0;
    }

    /// @notice Get a minter's quota.
    /// @param minter Address of the minter.
    /// @return Minter's quota.
    function quota(address minter) public view returns (uint256) {
        return _minters[minter].quota;
    }

    /// @notice Get the amount minted by a minter.
    /// @param minter Address of the minter.
    /// @return Total minted.
    function minted(address minter) public view returns (uint256) {
        return _minters[minter].minted;
    }
}
