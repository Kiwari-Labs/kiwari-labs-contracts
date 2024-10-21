// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title TimeComparator
/// @notice Provides utility functions for comparing block number nad block timestamp.
/// @author Kiwari Labs

import "./UintComparator.sol";

library TimeComparator {
    using UintComparator for uint;

    /// @notice Checks if block number `x` is before block number `y`
    /// @param x The first block number to compare
    /// @param y The second block number to compare
    /// @return result True if `x` is before `y`, otherwise false
    function beforeBlock(uint x, uint y) internal pure returns (bool result) {
        return x.lessThan(y);
    }

    /// @notice Checks if `x` block number is after block number `y`
    /// @param x The first block number to compare
    /// @param y The second block number to compare
    /// @return result True if `x` is after `y`, otherwise false
    function afterBlock(uint x, uint y) internal pure returns (bool result) {
        return x.greaterThan(y);
    }

    /// @notice Checks if `x` block time stamp is before block time stamp `y`
    /// @param x The first block time stamp to compare
    /// @param y The second block time stamp to compare
    /// @return result True if `x` is before `y`, otherwise false
    function beforeTimestamp(uint x, uint y) internal pure returns (bool result) {
        return x.lessThan(y);
    }

    /// @notice Checks if `x` block time stamp is after block time stamp `y`
    /// @param x The first block time stamp to compare
    /// @param y The second block time stamp to compare
    /// @return result True if `x` is after `y`, otherwise false
    function afterTimestamp(uint x, uint y) internal pure returns (bool result) {
        return x.greaterThan(y);
    }

    /// @notice Compares `x` and `y` and returns an integer indicating their relationship
    /// @param x The first block number or block time stamp to compare
    /// @param y The second block number or block time stamp to compare
    /// @return result Returns -1 if `x` is before `y`, 0 if `x` is equal to `y`, 1 if `x` is after `y`
    function blockOrTimeCompareTo(uint x, uint y) internal pure returns (int result) {
        return x.compareTo(y);
    }
}
