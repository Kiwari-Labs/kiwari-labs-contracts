// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC7818 Mint Quota extension contract
/// @author Kiwari Labs

import "../ERC20EXPBase.sol";

abstract contract ERC7818MintQuota is ERC20EXPBase {
    /// @notice Struct to define mint quota for each minter
    struct Minter {
        uint256 quota; // Maximum amount the minter is allowed to mint
        uint256 minted; // Amount of tokens minted by the minter so far
    }

    /// @notice Mapping from minter address to their quota details
    mapping(address account => Minter minter) private _minters;

    /// @notice Custom error definitions
    error UnauthorizedMinter(address caller);
    error MintQuotaExceeded(address minter, uint256 available, uint256 requested);
    error InvalidMinterAddress();

    /// @notice Events
    event QuotaSet(address indexed caller, address indexed minter, uint256 quota);
    event QuotaReset(address indexed minter);
    event QuotaMinted(address indexed minter, address indexed to, uint256 amount);

    /// @dev Mints tokens to a specified address if the minter has quota left.
    /// Only allowed _minters can mint within their quota.
    /// @param to Address to receive the minted tokens.
    /// @param amount Number of tokens to mint.
    function _mintQuota(address to, uint256 amount) internal virtual {
        Minter storage minter = _minters[_msgSender()];

        if (minter.quota == 0) {
            revert UnauthorizedMinter(_msgSender());
        }

        if (minter.minted + amount > minter.quota) {
            revert MintQuotaExceeded(_msgSender(), minter.quota - minter.minted, amount);
        }

        minter.minted += amount;
        _mint(to, amount);

        emit QuotaMinted(_msgSender(), to, amount);
    }

    /// @dev Set the mint quota for a specific minter.
    /// @param minter The address of the minter.
    /// @param quota The amount the minter is allowed to mint.
    function _setQuota(address minter, uint256 quota) internal virtual {
        if (minter == address(0)) {
            revert InvalidMinterAddress();
        }

        _minters[minter].quota = quota;

        emit QuotaSet(_msgSender(), minter, quota);
    }

    /// @dev Reset the mint amount for a specific minter.
    /// This could be useful to reset or reduce a minter's used quota.
    /// @param minter The address of the minter.
    function _resetQuota(address minter) internal virtual {
        if (minter == address(0)) {
            revert InvalidMinterAddress();
        }

        _minters[minter].minted = 0;

        emit QuotaReset(minter);
    }

    /// @dev Get the remaining mint quota for a specific minter.
    /// @param minter The address of the minter.
    /// @return Remaining quota.
    function remainingQuota(address minter) external view virtual returns (uint256) {
        if (_minters[minter].minted < _minters[minter].quota) {
            unchecked {
                return _minters[minter].quota - _minters[minter].minted;
            }
        }
        return 0;
    }

    /// @dev Returns the amount of tokens that a specific minter has already minted.
    /// @param minter The address of the minter.
    /// @return The minted amount by the given minter.
    function minted(address minter) external view virtual returns (uint256) {
        return _minters[minter].minted;
    }
}
