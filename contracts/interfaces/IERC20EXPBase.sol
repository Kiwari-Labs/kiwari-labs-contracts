// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title Extended ERC20 Interface for ERC20EXPBase tokens
/// @author Kiwari Labs
/// @notice This interface defines additional functionalities for ERC20EXPBase tokens.

interface IERC20EXPBase {
    /// @notice Retrieves an array of token balances stored for a specific account, era, and slot.
    /// @dev Retrieves the list of token balances stored for the specified account, era, and slot, sorted in ascending order.
    /// @param account The address of the account for which the token balances are being retrieved.
    /// @param era The era (time period) within which the token balances are stored.
    /// @param slot The slot index within the specified era for which the token balances are stored.
    /// @return list The array of token balances sorted in ascending order based on block numbers.
    function tokenList(address account, uint256 era, uint8 slot) external view returns (uint256[] memory list);

    /// @notice Returns the available balance of tokens for a given account within the specified eras and slots.
    /// @param account The address of the account for which the balance is being queried.
    /// @param fromEra The starting era for the balance lookup.
    /// @param fromSlot The starting slot within the starting era for the balance lookup.
    /// @param toEra The ending era for the balance lookup.
    /// @param toSlot The ending slot within the ending era for the balance lookup.
    /// @return uint256 The available balance.
    // function balanceOf(
    //     address account,
    //     uint256 fromEra,
    //     uint8 fromSlot,
    //     uint256 toEra,
    //     uint8 toSlot
    // ) external returns (uint256);

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
