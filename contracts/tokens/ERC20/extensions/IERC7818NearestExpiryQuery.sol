// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title IERC7818 Nearest Expiry Query extension
/// @author Kiwari Labs

interface IERC7818NearestExpiryQuery {
    /// @notice Retrieves the nearest unexpired block balance for a given account.
    /// @dev This function checks the block history for an account and finds the first unexpired block balance.
    /// It uses the `_blockNumberProvider` to get the current block number and looks up the account's block balances.
    /// @param account The address of the account whose unexpired block balance is being queried.
    /// @return balance The balance at the nearest unexpired block for the specified account.
    /// @return expiry The estimating block number or timestamp.
    function getNearestExpiryOf(address account) external view returns (uint256, uint256);
}
