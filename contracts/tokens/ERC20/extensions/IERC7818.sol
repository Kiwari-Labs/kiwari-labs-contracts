// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC-7818 Expirable ERC20
/// @author Kiwari Labs
/// @dev This interface defines additional functionalities for create a expireable ERC20 tokens.
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC7818 is IERC20 {
    /// @dev This function returns the balance of tokens at a specific blockchain blocknumber.
    /// @param blockNumber The block number for which the token balance is being queried.
    /// @return uint256 The token balance as of that particular block number. This is useful for checking historical balances.
    function balanceOfBlock(uint256 blockNumber) external returns (uint256);

    /// @dev This function retrieves the expiration duration or period for tokens.
    /// @return uint256 value representing the expiration duration in blocks
    function expiryDuration() external returns (uint256);

    /// @dev This overload function for specific transfer tokenId
    /// @return boolean if tokenId still un-expired do transfer and return true otherwise fasle.
    function transfer(address to, uint256 tokenId, uint256 value) external returns (bool);

    /// @dev This overload function for specific transfer tokenId
    /// @return boolean if tokenId still un-expired do transfer and return true otherwise fasle.
    function transferFrom(address from, address to, uint256 tokenId, uint256 value) external returns (bool);

    /// @dev Retrieves the list of un-expired token balances stored for the specified account, era, and slot, sorted in ascending order.
    /// @param account The address of the account for which the token balances are being retrieved.
    /// @param era The era (time period) within which the token balances are stored.
    /// @param slot The slot index within the specified era for which the token balances are stored.
    /// @return list The array of token balances sorted in ascending order based on block numbers.
    function tokenList(address account, uint256 era, uint8 slot) external view returns (uint256[] memory list);
}
