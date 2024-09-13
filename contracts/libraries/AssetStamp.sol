// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title AssetStamp library for tracking asset block numbers.
/// @author Kiwari Labs
/// @notice This library provides utility functions to set, clear, and check block numbers for assets.

library AssetStamp {
    /// @dev Asset structure storing the block number when it was stamped.
    struct Asset {
        uint256 blockNumber;
        // @TODO extraData can be added here for further customization.
    }

    /// @notice Sets the block number for an asset if it has not been stamped yet.
    /// @param self The asset to stamp.
    /// @param blockNumber The block number when the asset is stamped.
    function set(Asset storage self, uint256 blockNumber) internal {
        if (self.blockNumber == 0) {
            self.blockNumber = blockNumber;
        }
    }

    /// @notice Update the block number for an asset if it has been stamped.
    /// @param self The asset to stamp.
    /// @param blockNumber The block number when the asset is stamped.
    function update(Asset storage self, uint256 blockNumber) internal {
        if (self.blockNumber != 0) {
            self.blockNumber = blockNumber;
        }
    }

    /// @notice Clears the block number of an asset, effectively removing the stamp.
    /// @param self The asset to clear the stamp from.
    function clear(Asset storage self) internal {
        self.blockNumber = 0;
    }

    /// @notice Checks if an asset has been stamped (i.e., its block number is non-zero).
    /// @param self The asset to check.
    /// @return True if the asset has been stamped, false otherwise.
    function checked(Asset storage self) internal view returns (bool) {
        return self.blockNumber != 0;
    }
}
