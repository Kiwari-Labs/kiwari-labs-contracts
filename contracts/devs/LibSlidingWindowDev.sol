// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title An implemation sliding window algorithm in Solidity, the sliding frame relying on block-height rather than block-timestmap with devmode.
/// @author Kiwari Labs
/// @notice This library designed to compatible with subsecond blocktime on both Layer 1 Network (L1) and Layer 2 Network (L2).
// inspiration:
// https://github.com/stonecoldpat/slidingwindow

library SlidingWindow {
    uint8 private constant MINIMUM_SLOT_PER_EPOCH = 1;
    uint8 private constant MAXIMUM_SLOT_PER_EPOCH = 12;
    uint8 private constant MINIMUM_FRAME_SIZE = 1;
    uint8 private constant MAXIMUM_FRAME_SIZE = 64;
    uint8 private constant MINIMUM_BLOCK_TIME_IN_MILLISECONDS = 100;
    uint24 private constant MAXIMUM_BLOCK_TIME_IN_MILLISECONDS = 600_000;
    uint40 private constant YEAR_IN_MILLISECONDS = 31_556_926_000;

    struct SlidingWindowState {
        bool _devMode;
        uint40 _blockPerEpoch;
        uint40 _blockPerSlot;
        uint40 _frameSizeInBlockLength;
        uint8[2] _frameSizeInEpochAndSlotLength;
        uint8 _slotSize;
        uint256 _startBlockNumber;
    }

    error InvalidBlockTime();
    error InvalidFrameSize();
    error InvalidSlotPerEpoch();

    /// @notice Calculates the difference between the current block number and the start of the sliding window frame.
    /// @dev This function computes the difference in blocks between the current block number and the start of
    /// the sliding window frame, as defined by `_frameSizeInBlockLength` in the sliding window state `self`.
    /// It checks if the `blockNumber` is greater than or equal to `_frameSizeInBlockLength`. If true, it calculates
    /// the difference; otherwise, it returns zero blocks indicating the block number is within the sliding window frame.
    /// @param self The sliding window state to use for calculations.
    /// @param blockNumber The current block number to calculate the difference from.
    /// @return blocks The difference in blocks between the current block and the start of the sliding window frame.
    function _calculateBlockDifferent(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) private view returns (uint256 blocks) {
        uint256 frameSizeInBlockLengthCache = self._frameSizeInBlockLength;
        unchecked {
            if (blockNumber >= frameSizeInBlockLengthCache) {
                // If the current block is beyond the expiration period
                blocks = blockNumber - frameSizeInBlockLengthCache;
            }
        }
    }

    /// @notice Calculates the epoch based on the provided block number and sliding window state.
    /// @dev Computes the epoch by determining the difference between the current block number and the start block number,
    /// then dividing this difference by the number of blocks per epoch. Uses unchecked arithmetic for performance considerations.
    /// @param self The sliding window state.
    /// @param blockNumber The block number for which to calculate the epoch.
    /// @return epoch corresponding to the given block number.
    function _calculateEpoch(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) private view returns (uint256 epoch) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            // Calculate epoch based on the difference between the current block and start block
            if (startblockNumberCache > 0 && blockNumber > startblockNumberCache) {
                epoch = (blockNumber - startblockNumberCache) / self._blockPerEpoch;
            }
        }
    }

    /// @notice Calculates the slot based on the provided block number and sliding window state.
    /// @dev Computes the slot by determining the difference between the current block number and the
    /// start block number, then mapping this difference to a slot based on the number of blocks per epoch
    /// and slot size. Uses unchecked arithmetic for performance considerations.
    /// @param self The sliding window state.
    /// @param blockNumber The block number for which to calculate the slot.
    /// @return slot corresponding to the given block number.
    function _calculateSlot(SlidingWindowState storage self, uint256 blockNumber) private view returns (uint8 slot) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            uint40 blockPerYearCache = self._blockPerEpoch;
            if (blockNumber > startblockNumberCache) {
                slot = uint8(
                    ((blockNumber - startblockNumberCache) % blockPerYearCache) / (blockPerYearCache / self._slotSize)
                );
            }
        }
    }

    /// @notice Adjusts the block number to handle buffer operations within the sliding window.
    /// @dev The adjustment is based on the number of blocks per slot. If the current block number
    /// is greater than the number of blocks per slot, it subtracts the block per slot from
    /// the block number to obtain the adjusted block number.
    /// @param self The sliding window state.
    /// @param blockNumber The current block number.
    /// @return Updated block number after adjustment.
    function _frameBuffer(SlidingWindowState storage self, uint256 blockNumber) private view returns (uint256) {
        unchecked {
            uint256 blockPerSlotCache = self._blockPerSlot;
            if (blockNumber > blockPerSlotCache) {
                blockNumber = blockNumber - blockPerSlotCache;
            }
        }
        return blockNumber;
    }

    /// @notice Updates the parameters of the sliding window based on the given block time and frame size.
    /// @dev This function adjusts internal parameters such as blockPerEpoch, blockPerSlot, and frame sizes
    /// based on the provided blockTime and frameSize. It ensures that block time is within valid limits
    /// and frame size is appropriate for the sliding window. The calculations depend on constants like
    /// YEAR_IN_MILLISECONDS , MINIMUM_BLOCK_TIME_IN_MILLISECONDS , MAXIMUM_BLOCK_TIME_IN_MILLISECONDS ,
    /// MINIMUM_FRAME_SIZE, MAXIMUM_FRAME_SIZE, and SLOT_PER_EPOCH.
    /// @param self The sliding window state to update.
    /// @param blockTime The time duration of each block in milliseconds.
    /// @param frameSize The size of the frame in slots.
    /// @param slotSize The size of the slot per epoch.
    function updateSlidingWindow(
        SlidingWindowState storage self,
        uint24 blockTime,
        uint8 frameSize,
        uint8 slotSize
    ) internal {
        if (!self._devMode) {
            if (blockTime < MINIMUM_BLOCK_TIME_IN_MILLISECONDS || blockTime > MAXIMUM_BLOCK_TIME_IN_MILLISECONDS) {
                revert InvalidBlockTime();
            }
            if (frameSize < MINIMUM_FRAME_SIZE || frameSize > MAXIMUM_FRAME_SIZE) {
                revert InvalidFrameSize();
            }
            if (slotSize < MINIMUM_SLOT_PER_EPOCH || slotSize > MAXIMUM_SLOT_PER_EPOCH) {
                revert InvalidSlotPerEpoch();
            }
        }
        unchecked {
            /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
            uint40 blockPerSlotCache = (YEAR_IN_MILLISECONDS / blockTime) / slotSize;
            uint40 blockPerEpochCache = blockPerSlotCache * slotSize;
            self._blockPerEpoch = blockPerEpochCache;
            self._blockPerSlot = blockPerSlotCache;
            self._frameSizeInBlockLength = blockPerSlotCache * frameSize;
            self._slotSize = slotSize;
            if (frameSize <= slotSize) {
                self._frameSizeInEpochAndSlotLength[0] = 0;
                self._frameSizeInEpochAndSlotLength[1] = frameSize;
            } else {
                self._frameSizeInEpochAndSlotLength[0] = frameSize / slotSize;
                self._frameSizeInEpochAndSlotLength[1] = frameSize % slotSize;
            }
        }
    }

    /// @notice Calculates the current epoch and slot within the sliding window based on the given block number.
    /// @dev This function computes both the epoch and slot using the provided block number and the sliding
    /// window state parameters such as _startBlockNumber, _blockPerEpoch, and _slotSize. It delegates epoch
    /// calculation to the `calculateEpoch` function and slot calculation to the `calculateSlot` function.
    /// The epoch represents the number of complete epochs that have passed since the sliding window started,
    /// while the slot indicates the specific position within the current epoch.
    /// @param self The sliding window state to use for calculations.
    /// @param blockNumber The block number to calculate the epoch and slot from.
    /// @return epoch The current epoch derived from the block number.
    /// @return slot The current slot within the epoch derived from the block number.
    function calculateEpochAndSlot(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 epoch, uint8 slot) {
        epoch = _calculateEpoch(self, blockNumber);
        slot = _calculateSlot(self, blockNumber);
        return (epoch, slot);
    }

    /// @notice Determines the sliding window frame based on the provided block number.
    /// @dev This function computes the sliding window frame based on the provided `blockNumber` and the state `self`.
    /// It determines the `toEpoch` and `toSlot` using `calculateEpochAndSlot`, then calculates the block difference
    /// using `_calculateBlockDifferent` to adjust the `blockNumber`. Finally, it computes the `fromEpoch` and `fromSlot`
    /// using `calculateEpochAndSlot` with the adjusted `blockNumber`, completing the determination of the sliding window frame.
    /// @param self The sliding window state to use for calculations.
    /// @param blockNumber The current block number to calculate the sliding window frame from.
    /// @return fromEpoch The starting epoch of the sliding window frame.
    /// @return toEpoch The ending epoch of the sliding window frame.
    /// @return fromSlot The starting slot within the starting epoch of the sliding window frame.
    /// @return toSlot The ending slot within the ending epoch of the sliding window frame.
    function frame(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        (toEpoch, toSlot) = calculateEpochAndSlot(self, blockNumber);
        blockNumber = _calculateBlockDifferent(self, blockNumber);
        (fromEpoch, fromSlot) = calculateEpochAndSlot(self, blockNumber);
    }

    /// @notice Computes a safe frame of epochs and slots relative to a given block number.
    /// @dev This function computes a safe frame of epochs and slots relative to the provided `blockNumber`.
    /// It first calculates the frame using the `frame` function and then adjusts the result to ensure safe indexing.
    /// @param self The sliding window state containing the configuration.
    /// @param blockNumber The block number used as a reference point for computing the frame.
    /// @return fromEpoch The starting epoch of the safe frame.
    /// @return toEpoch The ending epoch of the safe frame.
    /// @return fromSlot The starting slot within the starting epoch of the safe frame.
    /// @return toSlot The ending slot within the ending epoch of the safe frame.
    function safeFrame(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        (toEpoch, toSlot) = calculateEpochAndSlot(self, blockNumber);
        blockNumber = _calculateBlockDifferent(self, blockNumber);
        blockNumber = _frameBuffer(self, blockNumber);
        (fromEpoch, fromSlot) = calculateEpochAndSlot(self, blockNumber);
    }

    /// @notice Retrieves the number of blocks per epoch from the sliding window state.
    /// @dev Uses the sliding window state to fetch the blocks per epoch.
    /// @param self The sliding window state.
    /// @return The number of blocks per epoch.
    function getBlockPerEpoch(SlidingWindowState storage self) internal view returns (uint40) {
        return self._blockPerEpoch;
    }

    /// @notice Retrieves the number of blocks per slot from the sliding window state.
    /// @dev Uses the sliding window state to fetch the blocks per slot.
    /// @param self The sliding window state.
    /// @return The number of blocks per slot.
    function getBlockPerSlot(SlidingWindowState storage self) internal view returns (uint40) {
        return self._blockPerSlot;
    }

    /// @notice Retrieves the frame size in block length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of block length.
    /// @param self The sliding window state.
    /// @return The frame size in block length.
    function getFrameSizeInBlockLength(SlidingWindowState storage self) internal view returns (uint40) {
        return self._frameSizeInBlockLength;
    }

    /// @notice Retrieves the frame size in epoch length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of epoch length.
    /// @param self The sliding window state.
    /// @return The frame size in epoch length.
    function getFrameSizeInEpochLength(SlidingWindowState storage self) internal view returns (uint8) {
        return self._frameSizeInEpochAndSlotLength[0];
    }

    /// @notice Retrieves the frame size in slot length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of slot length.
    /// @param self The sliding window state.
    /// @return The frame size in slot length.
    function getFrameSizeInSlotLength(SlidingWindowState storage self) internal view returns (uint8) {
        return self._frameSizeInEpochAndSlotLength[1];
    }

    /// @notice Retrieves the frame size in epoch and slot length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of epoch and slot length.
    /// @param self The sliding window state.
    /// @return An array containing frame size in epoch and slot length.
    function getFrameSizeInEpochAndSlotLength(SlidingWindowState storage self) internal view returns (uint8[2] memory) {
        return self._frameSizeInEpochAndSlotLength;
    }

    /// @notice Retrieves the number of slots per epoch from the sliding window state.
    /// @dev This function returns the `_slotSize` attribute from the provided sliding window state `self`,
    /// which represents the number of slots per epoch in the sliding window configuration.
    /// @param self The sliding window state containing the configuration.
    /// @return The number of slots per epoch configured in the sliding window state.
    function getSlotPerEpoch(SlidingWindowState storage self) internal view returns (uint8) {
        return self._slotSize;
    }

    /// @dev Checks if the sliding window is in developer mode.
    /// @param self The sliding window state structure.
    /// @return A boolean value indicating whether the sliding window is in developer mode (`true` if it is, `false` otherwise).
    function mode(SlidingWindowState storage self) internal view returns (bool) {
        return self._devMode;
    }
}
