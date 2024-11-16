// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Interface Agreement Contract
/// @author Kiwari Labs

interface IAgreement {
    /// @notice Evaluates the bilateral agreement between party A and party B
    /// @dev This function checks if the agreement between the parameters `x` (from party A) and `y` (from party B) is valid.
    /// @param x The input parameters provided by party A
    /// @param y The input parameters provided by party B
    /// @return True if the agreement is valid, otherwise false
    function agreement(bytes memory x, bytes memory y) external returns (bool);

    /// @notice Returns the name of the agreement contract.
    /// @dev This function retrieves the name of the agreement to distinguish between different contracts.
    /// @return string The name of the agreement contract.
    function name() external view returns (string memory);

    /// @notice Returns the current version of the agreement
    /// @return The version number of the agreement
    function version() external view returns (uint256);
}
