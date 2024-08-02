// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title Extended ERC20 Interface for ERC20EXP tokens with Unexpirable token address exeption.
/// @author Kiwari Labs
/// @notice This interface defines additional functionalities for ERC20EXP tokens.

interface IERC20EXP {
    /// @notice Emitted when wholesale status is granted or revoked for an account.
    /// @param account The account for which wholesale status is affected.
    /// @param isWholesale `true` if wholesale status is granted; `false` if revoked.
    event GrantWholeSale(address indexed account, bool indexed isWholesale);

    /// @notice Grants wholesale status to an account, allowing it to receive non-expirable tokens.
    /// @param to The address of the account to grant wholesale status.
    function grantWholeSale(address to) external;

    /// @notice Revokes wholesale status from an account, clearing all existing balances.
    /// @param to The address of the account from which wholesale status is being revoked.
    function revokeWholeSale(address to) external;

    /// @notice Returns the available balance of tokens for a given account within the specified eras and slots.
    /// @dev If the account is a wholesale account, ignores the provided eras and slots and returns the spendable balance.
    /// Otherwise, calculates and returns the available balance based on the specified eras and slots.
    /// @param account The address of the account for which the balance is being queried.
    /// @param fromEra The starting era for the balance lookup.
    /// @param fromSlot The starting slot within the starting era for the balance lookup.
    /// @param toEra The ending era for the balance lookup.
    /// @param toSlot The ending slot within the ending era for the balance lookup.
    /// @return uint256 The available balance.
    function balanceOf(
        address account,
        uint256 fromEra,
        uint8 fromSlot,
        uint256 toEra,
        uint8 toSlot
    ) external returns (uint256);

    /// @dev Overloaded function to retrieve either safe or unsafe balance of an account.
    /// @param account The address of the account for which the balance is being queried.
    /// @param safe Boolean flag indicating whether to retrieve safe (true) or unsafe (false) balance.
    /// @return The balance of the account based on the specified safety level.
    // function balanceOf(address account, bool safe) external returns (uint256);

    /// @dev Overloaded function to transfer tokens between specified eras and slots.
    /// @param account The address initiating the transfer.
    /// @param fromEra The starting era from which tokens are being transferred.
    /// @param fromSlot The starting slot within the starting era from which tokens are being transferred.
    /// @param toEra The ending era to which tokens are being transferred.
    /// @param toSlot The ending slot within the ending era to which tokens are being transferred.
    /// @return A boolean indicating whether the transfer was successful or not.
    // function transfer(
    //     address account,
    //     uint256 fromEra,
    //     uint8 fromSlot,
    //     uint256 toEra,
    //     uint8 toSlot
    // ) external returns (bool);

    /// @dev Overloaded function to transfer tokens between specified eras and slots on behalf of another account.
    /// @param account The address initiating the transfer.
    /// @param fromEra The starting era from which tokens are being transferred.
    /// @param fromSlot The starting slot within the starting era from which tokens are being transferred.
    /// @param toEra The ending era to which tokens are being transferred.
    /// @param toSlot The ending slot within the ending era to which tokens are being transferred.
    /// @return A boolean indicating whether the transfer was successful or not.
    // function transferFrom(
    //     address account,
    //     uint256 fromEra,
    //     uint8 fromSlot,
    //     uint256 toEra,
    //     uint8 toSlot
    // ) external returns (bool);
}
