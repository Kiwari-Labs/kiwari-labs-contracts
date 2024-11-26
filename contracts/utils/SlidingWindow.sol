// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title An implementation sliding window algorithm in Solidity, the sliding frame relying on block-height rather than block-timestmap.
/// @author Kiwari Labs
/// @notice This library designed to compatible with sub-second blocktime on both Layer 1 Network (L1) and Layer 2 Network (L2).
// inspiration:
// https://github.com/stonecoldpat/slidingwindow

library SlidingWindow {
    uint8 private constant MINIMUM_SLOTS_PER_EPOCH = 1;
    uint8 private constant MAXIMUM_SLOTS_PER_EPOCH = 12;
    uint8 private constant MINIMUM_FRAME_SIZE = 1;
    uint8 private constant MAXIMUM_FRAME_SIZE = 64;
    uint8 private constant MINIMUM_BLOCK_TIME_IN_MILLISECONDS = 100;
    uint24 private constant MAXIMUM_BLOCK_TIME_IN_MILLISECONDS = 600_000;
    uint40 private constant YEAR_IN_MILLISECONDS = 31_556_926_000;

    struct SlidingWindowState {
        uint40 blocksPerEpoch;
        uint40 blocksPerSlot;
        uint40 frameSizeInBlockLength;
        uint8 slotSize;
        uint256 startBlockNumber;
    }

    error InvalidBlockTime();
    error InvalidFrameSize();
    error InvalidSlotPerEpoch();

    /// @notice Calculates the difference between the current block number and the start of the sliding window frame.
    /// @dev This function computes the difference in blocks between the current block number and the start of
    /// the sliding window frame, as defined by `frameSizeInBlockLength` in the sliding window state `self`.
    /// It checks if the `blockNumber` is greater than or equal to `frameSizeInBlockLength`. If true, it calculates
    /// the difference; otherwise, it returns zero blocks indicating the block number is within the sliding window frame.
    /// @param frameSizeInBlockLength frameSizeInBlockLength
    /// @param blockNumber The current block number to calculate the difference from.
    /// @return result The difference in blocks between the current block and the start of the sliding window frame.
    function _calculateBlockDifferent(
        uint256 frameSizeInBlockLength,
        uint256 blockNumber
    ) private pure returns (uint256 result) {
        assembly {
            if or(gt(blockNumber, frameSizeInBlockLength), eq(blockNumber, frameSizeInBlockLength)) {
                result := sub(blockNumber, frameSizeInBlockLength)
            }
        }
    }

    /// @notice Adjusts the block number to handle buffer operations within the sliding window.
    /// @dev The adjustment is based on the number of blocks per slot. If the current block number
    /// is greater than the number of blocks per slot, it subtracts the block per slot from
    /// the block number to obtain the adjusted block number.
    /// @param blocksPerSlot The blocks per slot,
    /// @param blockNumber The current block number.
    /// @return result Updated block number after adjustment.
    function _calculateBlockNumber(uint256 blocksPerSlot, uint256 blockNumber) private pure returns (uint256 result) {
        assembly {
            if gt(blockNumber, blocksPerSlot) {
                result := sub(blockNumber, blocksPerSlot)
            }
        }
    }

    /// @notice Calculates the epoch based on the provided block number and sliding window state.
    /// @dev Computes the epoch by determining the difference between the current block number and the start block number,
    /// then dividing this difference by the number of blocks per epoch. Uses unchecked arithmetic for performance considerations.
    /// @param startBlockNumber The start block number.
    /// @param blocksPerEpoch The blocks per Epoch.
    /// @param blockNumber The block number for which to calculate the epoch.
    /// @return result Epoch corresponding to the given block number.
    function _calculateEpoch(
        uint256 startBlockNumber,
        uint256 blocksPerEpoch,
        uint256 blockNumber
    ) private pure returns (uint256 result) {
        assembly {
            if and(gt(startBlockNumber, 0x00), gt(blockNumber, startBlockNumber)) {
                blockNumber := sub(blockNumber, startBlockNumber)
                result := div(blockNumber, blocksPerEpoch)
            }
        }
    }

    /// @notice Calculates the slot based on the provided block number and sliding window state.
    /// @dev Computes the slot by determining the difference between the current block number and the
    /// start block number, then mapping this difference to a slot based on the number of blocks per epoch
    /// and slot size. Uses unchecked arithmetic for performance considerations.
    /// @param startBlockNumber The start block number
    /// @param blocksPerEpoch The blocks per epoch.
    /// @param blockNumber The block number for which to calculate the slot.
    /// @param slotSize The slot size.
    /// @return result Slot corresponding to the given block number.
    function _calculateSlot(
        uint256 startBlockNumber,
        uint256 blocksPerEpoch,
        uint256 blockNumber,
        uint8 slotSize
    ) private pure returns (uint8 result) {
        assembly {
            if gt(blockNumber, startBlockNumber) {
                blockNumber := sub(blockNumber, startBlockNumber)
                slotSize := div(blocksPerEpoch, slotSize)
                result := div(mod(blockNumber, blocksPerEpoch), slotSize)
            }
        }
    }

    /// @notice Calculates the current epoch and slot within the sliding window based on the given block number.
    /// @dev This function computes both the epoch and slot using the provided block number and the sliding
    /// window state parameters such as startBlockNumber, blocksPerEpoch, and slotSize. It delegates epoch
    /// calculation to the `calculateEpoch` function and slot calculation to the `calculateSlot` function.
    /// The epoch represents the number of complete epochs that have passed since the sliding window started,
    /// @param state The copy of sliding window state to use for calculations.
    /// @param blockNumber The current block number to calculate the sliding window frame from.
    function _calculateEpochAndSlot(
        SlidingWindowState memory state,
        uint256 blockNumber
    ) internal pure returns (uint256 epoch, uint8 slot) {
        epoch = _calculateEpoch(state.startBlockNumber, state.blocksPerEpoch, blockNumber);
        slot = _calculateSlot(state.startBlockNumber, state.blocksPerEpoch, blockNumber, state.slotSize);
    }

    /// @dev This function sets the `startBlockNumber` in the sliding window state to the provided `blockNumber`.
    ///      It effectively shifts the start of the sliding window frame to the given block number.
    /// @param self The sliding window state to update.
    /// @param blockNumber The new block number to set as the start of the sliding window frame.
    function updateStartBlock(SlidingWindowState storage self, uint256 blockNumber) internal {
        self.startBlockNumber = blockNumber;
    }

    /// @notice Updates the parameters of the sliding window based on the given block time and frame size.
    /// @dev This function adjusts internal parameters such as blocksPerEpoch, blocksPerSlot, and frame sizes
    /// based on the provided blockTime and frameSize. It ensures that block time is within valid limits
    /// and frame size is appropriate for the sliding window. The calculations depend on constants like
    /// YEAR_IN_MILLISECONDS , MINIMUM_BLOCK_TIME_IN_MILLISECONDS , MAXIMUM_BLOCK_TIME_IN_MILLISECONDS ,
    /// MINIMUM_FRAME_SIZE, MAXIMUM_FRAME_SIZE, and SLOT_PER_EPOCH.
    /// @param self The sliding window state to update.
    /// @param blockTime The time duration of each block in milliseconds.
    /// @param frameSize The size of the frame in slots.
    /// @param slotSize The size of the slot per epoch.
    /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
    function updateSlidingWindow(
        SlidingWindowState storage self,
        uint24 blockTime,
        uint8 frameSize,
        uint8 slotSize
    ) internal {
        if (blockTime < MINIMUM_BLOCK_TIME_IN_MILLISECONDS || blockTime > MAXIMUM_BLOCK_TIME_IN_MILLISECONDS) {
            revert InvalidBlockTime();
        }
        if (frameSize < MINIMUM_FRAME_SIZE || frameSize > MAXIMUM_FRAME_SIZE) {
            revert InvalidFrameSize();
        }
        if (slotSize < MINIMUM_SLOTS_PER_EPOCH || slotSize > MAXIMUM_SLOTS_PER_EPOCH) {
            revert InvalidSlotPerEpoch();
        }
        unchecked {
            uint40 blockPerSlotCache = (YEAR_IN_MILLISECONDS / blockTime) / slotSize;
            uint40 blockPerEpochCache = blockPerSlotCache * slotSize;
            self.blocksPerEpoch = blockPerEpochCache;
            self.blocksPerSlot = blockPerSlotCache;
            self.frameSizeInBlockLength = blockPerSlotCache * frameSize;
            self.slotSize = slotSize;
        }
    }

    /// @dev See {_calculateEpochAndSlot}
    /// @param self The sliding window state to use for calculations.
    /// @param blockNumber The block number to calculate the epoch and slot from.
    /// @return epoch The current epoch derived from the block number.
    /// @return slot The current slot within the epoch derived from the block number.
    function calculateEpochAndSlot(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal pure returns (uint256 epoch, uint8 slot) {
        SlidingWindowState memory state = self;
        return (_calculateEpochAndSlot(state, blockNumber));
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
    ) internal pure returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        SlidingWindowState memory state = self;
        (toEpoch, toSlot) = _calculateEpochAndSlot(state, blockNumber);
        blockNumber = _calculateBlockDifferent(state.frameSizeInBlockLength, blockNumber);
        (fromEpoch, fromSlot) = _calculateEpochAndSlot(state, blockNumber);
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
    ) internal pure returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        SlidingWindowState memory state = self;
        (toEpoch, toSlot) = _calculateEpochAndSlot(state, blockNumber);
        blockNumber = _calculateBlockDifferent(state.frameSizeInBlockLength, blockNumber);
        blockNumber = _calculateBlockNumber(state.blocksPerSlot, blockNumber);
        (fromEpoch, fromSlot) = _calculateEpochAndSlot(state, blockNumber);
    }

    /// @notice Retrieves the number of blocks per epoch from the sliding window state.
    /// @dev Uses the sliding window state to fetch the blocks per epoch.
    /// @param self The sliding window state.
    /// @return The number of blocks per epoch.
    function getBlocksPerEpoch(SlidingWindowState storage self) internal view returns (uint40) {
        return self.blocksPerEpoch;
    }

    /// @notice Retrieves the number of blocks per slot from the sliding window state.
    /// @dev Uses the sliding window state to fetch the blocks per slot.
    /// @param self The sliding window state.
    /// @return The number of blocks per slot.
    function getBlocksPerSlot(SlidingWindowState storage self) internal view returns (uint40) {
        return self.blocksPerSlot;
    }

    /// @notice Retrieves the frame size in block length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of block length.
    /// @param self The sliding window state.
    /// @return The frame size in block length.
    function getFrameSizeInBlockLength(SlidingWindowState storage self) internal view returns (uint40) {
        return self.frameSizeInBlockLength;
    }

    /// @notice Retrieves the number of slots per epoch from the sliding window state.
    /// @dev This function returns the `slotSize` attribute from the provided sliding window state `self`,
    /// which represents the number of slots per epoch in the sliding window configuration.
    /// @param self The sliding window state containing the configuration.
    /// @return The number of slots per epoch configured in the sliding window state.
    function getSlotsPerEpoch(SlidingWindowState storage self) internal view returns (uint8) {
        return self.slotSize;
    }
}
