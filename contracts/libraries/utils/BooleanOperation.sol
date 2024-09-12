// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title BooleanOperation
/// @notice Provides utility functions for common high level of boolean operations.
/// @author Kiwari Labs

library BooleanOperation {
    /// @notice Performs an AND operation on two boolean values.
    /// @param x The first boolean value.
    /// @param y The second boolean value.
    /// @return result True if both boolean values are true, otherwise false.
    function and(bool x, bool y) internal pure returns (bool result) {
        assembly {
            result := and(x, y)
        }
    }

    /// @notice Performs an OR operation on two boolean values.
    /// @param x The first boolean value.
    /// @param y The second boolean value.
    /// @return result True if at least one of the boolean values is true, otherwise false.
    function or(bool x, bool y) internal pure returns (bool result) {
        assembly {
            result := or(x, y)
        }
    }

    /// @notice Performs an XOR (exclusive OR) operation on two boolean values.
    /// @param x The first boolean value.
    /// @param y The second boolean value.
    /// @return result True if one and only one of the boolean values is true, otherwise false.
    function exclusiveOr(bool x, bool y) internal pure returns (bool result) {
        assembly {
            result := xor(x, y)
        }
    }
}
