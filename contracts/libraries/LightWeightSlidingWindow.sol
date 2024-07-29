// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title Shoji (障子) is a lightweight version of the Fusuma. Shoji provide efficiency and handy sliding window algorithm.
/// @author Kiwari Labs
/// @notice Some parameter in Fusuma was pre-define as a constant variable in Shoji.

library SlidingWindow {
    uint8 private constant TWO_BITS = 2;
    uint8 private constant THREE_BITS = 3;
    uint8 private constant SLOT_PER_ERA = 4;
    uint8 private constant MINIMUM_FRAME_SIZE = 1;
    uint8 private constant MAXIMUM_FRAME_SIZE = 8;
    uint8 private constant MINIMUM_BLOCK_TIME_IN_MILLISECONDS = 100;
    uint24 private constant MAXIMUM_BLOCK_TIME_IN_MILLISECONDS = 600_000;
    uint40 private constant YEAR_IN_MILLISECONDS = 31_556_926_000;

    struct SlidingWindowState {
        uint40 _blockPerEra;
        uint40 _blockPerSlot;
        uint40 _frameSizeInBlockLength;
        uint8[2] _frameSizeInEraAndSlotLength;
        uint256 _startBlockNumber;
    }

    error InvalidBlockTime();
    error InvalidFrameSize();

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

    /// @notice Calculates the era based on the provided block number and sliding window state.
    /// @param self The sliding window state.
    /// @param blockNumber The block number for which to calculate the era.
    /// @return era corresponding to the given block number.
    function _calculateEra(SlidingWindowState storage self, uint256 blockNumber) private view returns (uint256 era) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            // Calculate era based on the difference between the current block and start block
            if (startblockNumberCache > 0 && blockNumber > startblockNumberCache) {
                era = (blockNumber - startblockNumberCache) / self._blockPerEra;
            }
        }
    }

    /// @notice Calculates the slot based on the provided block number and sliding window state.
    /// @param self The sliding window state.
    /// @param blockNumber The block number for which to calculate the slot.
    /// @return slot corresponding to the given block number.
    function _calculateSlot(SlidingWindowState storage self, uint256 blockNumber) private view returns (uint8 slot) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            uint40 blockPerYearCache = self._blockPerEra;
            // @bug should check diff self._blockPerEra and self._blockPerSlot * 4
            assembly {
                switch gt(blockNumber, startblockNumberCache)
                case 1 {
                    slot := div(
                        mod(sub(blockNumber, startblockNumberCache), blockPerYearCache),
                        shr(TWO_BITS, blockPerYearCache)
                    )
                }
                default {
                    slot := 0
                }
            }
        }
    }

    /// @notice Adjusts the block number to handle buffer operations within the sliding window.
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
    /// @dev This function adjusts internal parameters such as blockPerEra, blockPerSlot, and frame sizes
    /// based on the provided blockTime and frameSize. It ensures that block time is within valid limits
    /// and frame size is appropriate for the sliding window. The calculations depend on constants like
    /// YEAR_IN_MILLISECONDS , MINIMUM_BLOCK_TIME_IN_MILLISECONDS , MAXIMUM_BLOCK_TIME_IN_MILLISECONDS ,
    /// MINIMUM_FRAME_SIZE, MAXIMUM_FRAME_SIZE, and SLOT_PER_ERA.
    /// @param self The sliding window state to update.
    /// @param blockTime The time duration of each block in milliseconds.
    /// @param frameSize The size of the frame in slots.
    function updateSlidingWindow(SlidingWindowState storage self, uint24 blockTime, uint8 frameSize) internal {
        if (blockTime < MINIMUM_BLOCK_TIME_IN_MILLISECONDS || blockTime > MAXIMUM_BLOCK_TIME_IN_MILLISECONDS) {
            revert InvalidBlockTime();
        }
        if (frameSize < MINIMUM_FRAME_SIZE || frameSize > MAXIMUM_FRAME_SIZE) {
            revert InvalidFrameSize();
        }
        unchecked {
            /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
            uint40 blockPerSlotCache = (YEAR_IN_MILLISECONDS / blockTime) >> TWO_BITS;
            uint40 blockPerEraCache = blockPerSlotCache << TWO_BITS;
            self._blockPerEra = blockPerEraCache;
            self._blockPerSlot = blockPerSlotCache;
            self._frameSizeInBlockLength = blockPerSlotCache * frameSize;
            if (frameSize <= SLOT_PER_ERA) {
                self._frameSizeInEraAndSlotLength[0] = 0;
                self._frameSizeInEraAndSlotLength[1] = frameSize;
            } else {
                self._frameSizeInEraAndSlotLength[0] = frameSize >> TWO_BITS;
                self._frameSizeInEraAndSlotLength[1] = frameSize & THREE_BITS;
            }
        }
    }

    /// @notice Calculates the current era and slot within the sliding window based on the given block number.
    /// @dev This function computes both the era and slot using the provided block number and the sliding
    /// window state parameters such as _startBlockNumber, _blockPerEra, and _slotSize. It delegates era
    /// calculation to the `calculateEra` function and slot calculation to the `calculateSlot` function.
    /// The era represents the number of complete eras that have passed since the sliding window started,
    /// while the slot indicates the specific position within the current era.
    /// @param self The sliding window state to use for calculations.
    /// @param blockNumber The block number to calculate the era and slot from.
    /// @return era The current era derived from the block number.
    /// @return slot The current slot within the era derived from the block number.
    function calculateEraAndSlot(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 era, uint8 slot) {
        era = _calculateEra(self, blockNumber);
        slot = _calculateSlot(self, blockNumber);
        return (era, slot);
    }

    /// @notice Determines the sliding window frame based on the provided block number.
    /// @dev This function computes the sliding window frame based on the provided `blockNumber` and the state `self`.
    /// It determines the `toEra` and `toSlot` using `calculateEraAndSlot`, then calculates the block difference
    /// using `_calculateBlockDifferent` to adjust the `blockNumber`. Finally, it computes the `fromEra` and `fromSlot`
    /// using `calculateEraAndSlot` with the adjusted `blockNumber`, completing the determination of the sliding window frame.
    /// @param self The sliding window state to use for calculations.
    /// @param blockNumber The current block number to calculate the sliding window frame from.
    /// @return fromEra The starting era of the sliding window frame.
    /// @return toEra The ending era of the sliding window frame.
    /// @return fromSlot The starting slot within the starting era of the sliding window frame.
    /// @return toSlot The ending slot within the ending era of the sliding window frame.
    function frame(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = calculateEraAndSlot(self, blockNumber);
        blockNumber = _calculateBlockDifferent(self, blockNumber);
        (fromEra, fromSlot) = calculateEraAndSlot(self, blockNumber);
    }

    /// @notice Computes a safe frame of eras and slots relative to a given block number.
    /// @dev This function computes a safe frame of eras and slots relative to the provided `blockNumber`.
    /// It first calculates the frame using the `frame` function and then adjusts the result to ensure safe indexing.
    /// @param self The sliding window state containing the configuration.
    /// @param blockNumber The block number used as a reference point for computing the frame.
    /// @return fromEra The starting era of the safe frame.
    /// @return toEra The ending era of the safe frame.
    /// @return fromSlot The starting slot within the starting era of the safe frame.
    /// @return toSlot The ending slot within the ending era of the safe frame.
    function safeFrame(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = calculateEraAndSlot(self, blockNumber);
        blockNumber = _calculateBlockDifferent(self, blockNumber);
        blockNumber = _frameBuffer(self, blockNumber);
        (fromEra, fromSlot) = calculateEraAndSlot(self, blockNumber);
    }

    /// @notice Retrieves the number of blocks per era from the sliding window state.
    /// @param self The sliding window state.
    /// @return The number of blocks per era.
    function getBlockPerEra(SlidingWindowState storage self) internal view returns (uint40) {
        return self._blockPerEra;
    }

    /// @notice Retrieves the number of blocks per slot from the sliding window state.
    /// @param self The sliding window state.
    /// @return The number of blocks per slot.
    function getBlockPerSlot(SlidingWindowState storage self) internal view returns (uint40) {
        return self._blockPerSlot;
    }

    /// @notice Retrieves the frame size in block length from the sliding window state.
    /// @param self The sliding window state.
    /// @return The frame size in block length.
    function getFrameSizeInBlockLength(SlidingWindowState storage self) internal view returns (uint40) {
        return self._frameSizeInBlockLength;
    }

    /// @notice Retrieves the frame size in era length from the sliding window state.
    /// @param self The sliding window state.
    /// @return The frame size in era length.
    function getFrameSizeInEraLength(SlidingWindowState storage self) internal view returns (uint8) {
        return self._frameSizeInEraAndSlotLength[0];
    }

    /// @notice Retrieves the frame size in slot length from the sliding window state.
    /// @param self The sliding window state.
    /// @return The frame size in slot length.
    function getFrameSizeInSlotLength(SlidingWindowState storage self) internal view returns (uint8) {
        return self._frameSizeInEraAndSlotLength[1];
    }

    /// @notice Retrieves the frame size in era and slot length from the sliding window state.
    /// @param self The sliding window state.
    /// @return An array containing frame size in era and slot length.
    function getFrameSizeInEraAndSlotLength(SlidingWindowState storage self) internal view returns (uint8[2] memory) {
        return self._frameSizeInEraAndSlotLength;
    }

    /// @notice Retrieves the number of slots per era, which is a constant value.
    /// @return The number of slots per era.
    function getSlotPerEra() internal pure returns (uint8) {
        return SLOT_PER_ERA;
    }
}
