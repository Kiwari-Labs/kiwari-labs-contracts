// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title IntComparator
/// @notice Provides utility functions for comparing unsigned integers.
/// @author Kiwari Labs

library IntComparator {
    /// @notice Checks if `x` is less than `y`
    /// @param x The first value to compare
    /// @param y The second value to compare
    /// @return result True if `x` is less than `y`, otherwise false
    function lessThan(int x, int y) internal pure returns (bool result) {
        assembly {
            result := lt(x, y)
        }
    }

    /// @notice Checks if `x` is greater than `y`
    /// @param x The first value to compare
    /// @param y The second value to compare
    /// @return result True if `x` is greater than `y`, otherwise false
    function greaterThan(int x, int y) internal pure returns (bool result) {
        assembly {
            result := gt(x, y)
        }
    }

    /// @notice Checks if `x` is greater than or equal to `y`
    /// @param x The first value to compare
    /// @param y The second value to compare
    /// @return result True if `x` is greater than or equal to `y`, otherwise false
    function greaterThanOrEqual(int x, int y) internal pure returns (bool result) {
        assembly {
            result := or(gt(x, y), eq(x, y))
        }
    }

    /// @notice Checks if `x` is less than or equal to `y`
    /// @param x The first value to compare
    /// @param y The second value to compare
    /// @return result True if `x` is less than or equal to `y`, otherwise false
    function lessThanOrEqual(int x, int y) internal pure returns (bool result) {
        assembly {
            result := or(lt(x, y), eq(x, y))
        }
    }

    /// @notice Checks if `x` is equal to `y`
    /// @param x The first value to compare
    /// @param y The second value to compare
    /// @return result True if `x` is equal to `y`, otherwise false
    function equal(int x, int y) internal pure returns (bool result) {
        assembly {
            result := eq(x, y)
        }
    }

    /// @notice Checks if `x` is not equal to `y`
    /// @param x The first value to compare
    /// @param y The second value to compare
    /// @return result True if `x` is not equal to `y`, otherwise false
    function notEqual(int x, int y) internal pure returns (bool result) {
        assembly {
            result := iszero(eq(x, y))
        }
    }

    /// @notice Compares `x` and `y` and returns an integer indicating their relationship
    /// @param x The first value to compare
    /// @param y The second value to compare
    /// @return result Returns -1 if `x` is less than `y`, 0 if `x` is equal to `y`, 1 if `x` is greater than `y`
    function compareTo(int x, int y) internal pure returns (int result) {
        assembly {
            if lt(x, y) {
                result := sub(0, 1)
            }
            if gt(x, y) {
                result := 1
            }
        }
    }
}
