// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0 <0.9.0;

/// @title Extended ERC20 Interface for PureERC20EXP tokens
/// @author Kiwari Labs
/// @notice This interface defines additional functionalities for PureERC20EXP tokens.

interface IPureERC20EXP {
    /// @notice Retrieves an array of token balances stored for a specific account, era, and slot.
    /// @dev Retrieves the list of token balances stored for the specified account, era, and slot, sorted in ascending order.
    /// @param account The address of the account for which the token balances are being retrieved.
    /// @param era The era (time period) within which the token balances are stored.
    /// @param slot The slot index within the specified era for which the token balances are stored.
    /// @return list The array of token balances sorted in ascending order based on block numbers.
    function tokenList(address account, uint256 era, uint8 slot) external view returns (uint256[] memory list);
}
