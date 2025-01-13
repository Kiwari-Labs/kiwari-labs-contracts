// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Implementation of a Block-Height-Based Lazy Sliding Window Algorithm.
/// @author Kiwari Labs

library BLSW {
    uint8 private constant MINIMUM_WINDOW_SIZE = 0x01; // 1 epoch
    uint8 private constant MAXIMUM_WINDOW_SIZE = 0x20; // 32 epoch
    uint40 private constant MINIMUM_DURATION = 0x012C; // 300 blocks
    uint40 private constant MAXIMUM_DURATION = 0x282070; // 2_629_744 blocks

    struct Window {
        uint256 initialBlockNumber;
        uint40 blocksPerEpoch;
        uint40 blocksPerWindow;
        uint8 epochsPerWindow;
    }

    /// @notice Thrown when an invalid duration is provided.
    /// @dev Triggered when the duration is out of bounds.
    error InvalidDuration();

    /// @notice Thrown when an invalid window size is provided.
    /// @dev Triggered when the window size is out of bounds.
    error InvalidWindowSize();

    /// @notice Computes the current epoch based on the initial block number, the current block number, and blocks per epoch.
    /// @param initialBlockNumber The initial block number.
    /// @param blockNumber The current block number.
    /// @param blocksPerEpoch The number of blocks per epoch.
    /// @return current The calculated epoch.
    function _computeEpoch(uint256 initialBlockNumber, uint256 blockNumber, uint256 blocksPerEpoch) private pure returns (uint256 current) {
        assembly {
            if and(gt(blockNumber, initialBlockNumber), gt(initialBlockNumber, 0)) {
                current := div(sub(blockNumber, initialBlockNumber), blocksPerEpoch)
            }
        }
    }

    /// @notice Computes the range of epochs based on the initial block number, current block number, blocks per epoch, and window size
    /// @param initialBlockNumber The initial block number.
    /// @param blockNumber The current block number.
    /// @param blocksPerEpoch The number of blocks per epoch.
    /// @param windowSize_ The number of epochs in the window.
    /// @return fromEpoch The starting epoch of the range.
    /// @return toEpoch The ending epoch of the range.
    function _computeEpochRange(
        uint256 initialBlockNumber,
        uint256 blockNumber,
        uint256 blocksPerEpoch,
        uint256 windowSize_
    ) private pure returns (uint256 fromEpoch, uint256 toEpoch) {
        assembly {
            if and(gt(blockNumber, initialBlockNumber), gt(initialBlockNumber, 0)) {
                toEpoch := div(sub(blockNumber, initialBlockNumber), blocksPerEpoch)
            }

            let from := sub(toEpoch, windowSize_)
            if iszero(lt(toEpoch, windowSize_)) {
                fromEpoch := from
            }
        }
    }

    /// @notice Returns the number of blocks in each epoch for a given window.
    /// @param self The sliding window structure.
    /// @return The number of blocks in each epoch.
    function blocksInEpoch(Window storage self) internal view returns (uint40) {
        return self.blocksPerEpoch;
    }

    /// @notice Returns the number of blocks in the entire window.
    /// @param self The sliding window structure.
    /// @return The total number of blocks in the window.
    function blocksInWindow(Window storage self) internal view returns (uint40) {
        return self.blocksPerWindow;
    }

    /// @notice Returns the number of epochs in the window.
    /// @param self The sliding window structure.
    /// @return The number of epochs in the window.
    function windowSize(Window storage self) internal view returns (uint8) {
        return self.epochsPerWindow;
    }

    /// @notice Computes the epoch number for a given block number.
    /// @param self The sliding window structure.
    /// @param blockNumber The block number for which the epoch is calculated.
    /// @return The calculated epoch.
    function epoch(Window storage self, uint256 blockNumber) internal view returns (uint256) {
        return _computeEpoch(self.initialBlockNumber, blockNumber, self.blocksPerEpoch);
    }

    /// @notice Returns the range of epochs for a given block number.
    /// @param self The sliding window structure.
    /// @param blockNumber The block number for which the epoch range is calculated.
    /// @return fromEpoch The start of the epoch range.
    /// @return toEpoch The end of the epoch range.
    function windowRange(Window storage self, uint256 blockNumber) internal view returns (uint256, uint256) {
        return _computeEpochRange(self.initialBlockNumber, blockNumber, self.blocksPerEpoch, self.epochsPerWindow);
    }

    /// @notice Initializes the sliding window's state with the number of blocks per epoch, the window size, and whether to apply safe mode.
    /// @param self The sliding window structure.
    /// @param blocksPerEpoch The number of blocks per epoch.
    /// @param windowSize_ The number of epochs per window.
    /// @param safe Whether to apply safe mode to validate the values.
    /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
    function initializedState(Window storage self, uint40 blocksPerEpoch, uint8 windowSize_, bool safe) internal {
        if (safe) {
            if (blocksPerEpoch < MINIMUM_DURATION || blocksPerEpoch > MAXIMUM_DURATION) {
                revert InvalidDuration();
            }
            if (windowSize_ < MINIMUM_WINDOW_SIZE || windowSize_ > MAXIMUM_WINDOW_SIZE) {
                revert InvalidWindowSize();
            }
        }
        unchecked {
            self.blocksPerEpoch = blocksPerEpoch;
            self.blocksPerWindow = blocksPerEpoch * windowSize_;
            self.epochsPerWindow = windowSize_;
        }
    }

    /// @notice Initializes the block number at which the sliding window starts.
    /// @param self The sliding window structure.
    /// @param blockNumber The initial block number for the window.
    function initializedBlock(Window storage self, uint256 blockNumber) internal {
        self.initialBlockNumber = blockNumber;
    }
}
