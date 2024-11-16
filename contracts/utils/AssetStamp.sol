// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title AssetStamp library for tracking asset block numbers.
/// @author Kiwari Labs
/// @notice This library provides utility functions to set, clear, and check block numbers for assets.

library AssetStamp {
    /// @dev Asset structure storing the block number when it was stamped.
    struct Asset {
        mapping(uint256 => uint256) blockNumber;
        // @TODO extraData can be added here for further customization.
    }

    /// @notice Sets the block number for an asset if it has not been stamped yet.
    /// @param self The asset to stamp.
    /// @param tokenId The Id of the token.
    /// @param blockNumber The block number when the asset is stamped.
    function set(Asset storage self, uint256 tokenId, uint256 blockNumber) internal {
        if (self.blockNumber[tokenId] == 0) {
            self.blockNumber[tokenId] = blockNumber;
        }
    }

    /// @notice Update the block number for an asset if it has been stamped.
    /// @param self The asset to stamp.
    /// @param tokenId The Id of the token.
    /// @param blockNumber The block number when the asset is stamped.
    function update(Asset storage self, uint256 tokenId, uint256 blockNumber) internal {
        if (self.blockNumber[tokenId] != 0) {
            self.blockNumber[tokenId] = blockNumber;
        }
    }

    /// @notice Clears the block number of an asset, effectively removing the stamp.
    /// @param self The asset to clear the stamp from.
    /// @param tokenId The Id of the token.
    function clear(Asset storage self, uint256 tokenId) internal {
        self.blockNumber[tokenId] = 0;
    }

    /// @notice Checks if an asset has been stamped (i.e., its block number is non-zero).
    /// @param self The asset to check.
    /// @param tokenId The Id of the token.
    /// @return True if the asset has been stamped, false otherwise.
    function checked(Asset storage self, uint256 tokenId) internal view returns (bool) {
        return self.blockNumber[tokenId] != 0;
    }

    /// @notice Return the block number that stamp from given tokenId.
    /// @param self The asset to check.
    /// @param tokenId The Id of the token.
    /// @return blockNumber of token.
    function get(Asset storage self, uint256 tokenId) internal view returns (uint256) {
        return self.blockNumber[tokenId];
    }
}
