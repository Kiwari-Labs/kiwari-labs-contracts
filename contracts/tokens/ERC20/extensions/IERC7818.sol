// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC-7818: Expirable ERC20
/// @author sirawt (@MASDXI), ADISAKBOONMARK (@ADISAKBOONMARK)
/// @dev Interface for creating expirable ERC20 tokens.
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC7818 is IERC20 {
    /// @dev This error is thrown when attempting to transfer an expired token.
    error ERC7818TransferExpired();

    /// @dev Retrieves the balance of a specific `id` owned by an account.
    /// @param account The address of the account.
    /// @param id The ID it's can be round, period, epoch, or token id.
    /// @return uint256 The balance of the specified `id`.
    function balanceOf(address account, uint256 id) external view returns (uint256);

    /// @dev Retrieves the current epoch of the contract.
    /// @return uint256 The current epoch of the token contract, often used for determining active/expired states.
    function epoch() external view returns (uint256);

    /// @dev Retrieves the duration (in blocks or the time in seconds) a token remains valid.
    /// @return uint256 The validity duration in blocks or the time in seconds.
    function duration() external view returns (uint256);

    /// @dev Checks whether a specific token `id` is expired.
    /// @param id The ID it's can be round, period, epoch, or token id.
    /// @return bool True if the token is expired, false otherwise.
    function expired(uint256 id) external view returns (bool);

    /// @dev Transfers a specific `id` and value to a recipient if not expired.
    /// @param to The recipient address.
    /// @param id The ID it's can be round, period, epoch, or token id.
    /// @param value The amount to transfer.
    /// @return bool True if the transfer succeeded, false if it's expired.
    function transfer(address to, uint256 id, uint256 value) external returns (bool);

    /// @dev Transfers a specific `id` and value from one account to another if not expired.
    /// @param from The sender's address.
    /// @param to The recipient's address.
    /// @param id The ID it's can be round, period, epoch or token id.
    /// @param value The amount to transfer.
    /// @return bool True if the transfer succeeded, false if it's expired.
    function transferFrom(address from, address to, uint256 id, uint256 value) external returns (bool);
}
