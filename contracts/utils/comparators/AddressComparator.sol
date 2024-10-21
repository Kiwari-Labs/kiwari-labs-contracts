// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title AddressComparator
/// @notice Provides utility functions for comparing address.
/// @author Kiwari Labs

library AddressComparator {
    /// @notice Checks if two addresses are equal
    /// @param x The first address to compare
    /// @param y The second address to compare
    /// @return result True if the addresses are equal, otherwise false
    function equal(address x, address y) internal pure returns (bool result) {
        assembly {
            result := eq(x, y)
        }
    }

    /// @notice Checks if two addresses are not equal
    /// @param x The first address to compare
    /// @param y The second address to compare
    /// @return result True if the addresses are not equal, otherwise false
    function notEqual(address x, address y) internal pure returns (bool result) {
        assembly {
            result := iszero(eq(x, y))
        }
    }

    /// @notice Checks if the given address is the zero address (0x0000000000000000000000000000000000000000)
    /// @param x The address to check
    /// @return result True if the address is the zero address, otherwise false
    function isZeroAddress(address x) internal pure returns (bool result) {
        assembly {
            result := iszero(x)
        }
    }
}
