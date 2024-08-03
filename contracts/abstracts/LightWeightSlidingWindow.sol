// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title LightWeight Sliding Window abstract contract
/// @author Kiwari Labs

import {ISlidingWindow} from "../interfaces/ISlidingWindow.sol";
import {SlidingWindow as slide} from "../libraries/LightWeightSlidingWindow.sol";

abstract contract SlidingWindow is ISlidingWindow {
    using slide for slide.SlidingWindowState;

    slide.SlidingWindowState private _slidingWindow;

    constructor(uint256 blockNumber_, uint16 blockTime_, uint8 frameSize_) {
        _slidingWindow._startBlockNumber = blockNumber_ != 0 ? blockNumber_ : _blockNumberProvider();
        _updateSlidingWindow(blockTime_, frameSize_);
    }

    /// @notice Allows for override in subsecond blocktime network.
    /// @dev Returns the current block number.
    /// This function can be overridden in derived contracts to provide custom
    /// block number logic, useful in networks with subsecond block times.
    /// @return The current network block number.
    function _blockNumberProvider() internal view returns (uint256) {
        return block.number;
    }

    /// @notice Updates the parameters of the sliding window based on the given block time and frame size.
    /// @dev This function adjusts internal parameters such as blockPerEra, blockPerSlot, and frame sizes
    /// based on the provided blockTime and frameSize. It ensures that block time is within valid limits
    /// and frame size is appropriate for the sliding window. The calculations depend on constants like
    /// YEAR_IN_MILLISECONDS , MINIMUM_BLOCK_TIME_IN_MILLISECONDS , MAXIMUM_BLOCK_TIME_IN_MILLISECONDS ,
    /// MINIMUM_FRAME_SIZE, MAXIMUM_FRAME_SIZE, and SLOT_PER_ERA.
    /// @param blockTime The time duration of each block in milliseconds.
    /// @param frameSize The size of the frame in slots.
    function _updateSlidingWindow(uint24 blockTime, uint8 frameSize) internal {
        _slidingWindow.updateSlidingWindow(blockTime, frameSize);
    }

    /// @notice Calculates the current era and slot within the sliding window based on the given block number.
    /// @dev This function computes both the era and slot using the provided block number and the sliding
    /// window state parameters such as _startBlockNumber, _blockPerEra, and _slotSize. It delegates era
    /// calculation to the `calculateEra` function and slot calculation to the `calculateSlot` function.
    /// The era represents the number of complete eras that have passed since the sliding window started,
    /// while the slot indicates the specific position within the current era.
    /// @param blockNumber The block number to calculate the era and slot from.
    /// @return era The current era derived from the block number.
    /// @return slot The current slot within the era derived from the block number.
    function _calculateEraAndSlot(uint256 blockNumber) internal view returns (uint256 era, uint8 slot) {
        (era, slot) = _slidingWindow.calculateEraAndSlot(blockNumber);
    }

    /// @notice Determines the sliding window frame based on the provided block number.
    /// @dev This function computes the sliding window frame based on the provided `blockNumber` and the state `self`.
    /// It determines the `toEra` and `toSlot` using `calculateEraAndSlot`, then calculates the block difference
    /// using `calculateBlockDifferent` to adjust the `blockNumber`. Finally, it computes the `fromEra` and `fromSlot`
    /// using `calculateEraAndSlot` with the adjusted `blockNumber`, completing the determination of the sliding window frame.
    /// @param blockNumber The current block number to calculate the sliding window frame from.
    /// @return fromEra The starting era of the sliding window frame.
    /// @return toEra The ending era of the sliding window frame.
    /// @return fromSlot The starting slot within the starting era of the sliding window frame.
    /// @return toSlot The ending slot within the ending era of the sliding window frame.
    function _frame(
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _slidingWindow.frame(blockNumber);
    }

    /// @notice Computes a safe frame of eras and slots relative to a given block number.
    /// @dev This function computes a safe frame of eras and slots relative to the provided `blockNumber`.
    /// It first calculates the frame using the `frame` function and then adjusts the result to ensure safe indexing.
    /// @param blockNumber The block number used as a reference point for computing the frame.
    /// @return fromEra The starting era of the safe frame.
    /// @return toEra The ending era of the safe frame.
    /// @return fromSlot The starting slot within the starting era of the safe frame.
    /// @return toSlot The ending slot within the ending era of the safe frame.
    function _safeFrame(
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _slidingWindow.safeFrame(blockNumber);
    }

    /// @notice Retrieves the number of blocks per era from the sliding window state.
    /// @dev Uses the sliding window state to fetch the blocks per era.
    /// @return The number of blocks per era.
    function _getBlockPerEra() internal view returns (uint40) {
        return _slidingWindow.getBlockPerEra();
    }

    /// @notice Retrieves the number of blocks per slot from the sliding window state.
    /// @dev Uses the sliding window state to fetch the blocks per slot.
    /// @return The number of blocks per slot.
    function _getBlockPerSlot() internal view returns (uint40) {
        return _slidingWindow.getBlockPerSlot();
    }

    /// @notice Retrieves the frame size in block length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of block length.
    /// @return The frame size in block length.
    function _getFrameSizeInBlockLength() internal view returns (uint40) {
        return _slidingWindow.getFrameSizeInBlockLength();
    }

    /// @notice Retrieves the frame size in era length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of era length.
    /// @return The frame size in era length.
    function _getFrameSizeInEraLength() internal view returns (uint8) {
        return _slidingWindow.getFrameSizeInEraLength();
    }

    /// @notice Retrieves the frame size in slot length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of slot length.
    /// @return The frame size in slot length.
    function _getFrameSizeInSlotLength() internal view returns (uint8) {
        return _slidingWindow.getFrameSizeInSlotLength();
    }

    /// @notice Retrieves the frame size in era and slot length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of era and slot length.
    /// @return An array containing frame size in era and slot length.
    function _getFrameSizeInEraAndSlotLength() internal view returns (uint8[2] memory) {
        return _slidingWindow.getFrameSizeInEraAndSlotLength();
    }

    /// @notice Retrieves the number of slots per era from the sliding window state.
    /// @return The number of slots per era configured in the sliding window state.
    /// @dev This function returns the `_slotSize` attribute from the provided sliding window state `self`,
    /// which represents the number of slots per era in the sliding window configuration.
    function _getSlotPerEra() internal pure returns (uint8) {
        return slide.getSlotPerEra();
    }

    /// @inheritdoc ISlidingWindow
    function currentEraAndSlot() external view override returns (uint256 era, uint8 slot) {
        return _calculateEraAndSlot(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function frame() external view override returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _frame(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function safeFrame() external view override returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _safeFrame(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function getBlockPerEra() external view override returns (uint40) {
        return _getBlockPerEra();
    }

    /// @inheritdoc ISlidingWindow
    function getBlockPerSlot() external view override returns (uint40) {
        return _getBlockPerSlot();
    }

    /// @inheritdoc ISlidingWindow
    function getFrameSizeInBlockLength() external view override returns (uint40) {
        return _getFrameSizeInBlockLength();
    }

    /// @inheritdoc ISlidingWindow
    function getFrameSizeInEraLength() external view override returns (uint8) {
        return _getFrameSizeInEraLength();
    }

    /// @inheritdoc ISlidingWindow
    function getFrameSizeInSlotLength() external view override returns (uint8) {
        return _getFrameSizeInSlotLength();
    }

    /// @inheritdoc ISlidingWindow
    function getFrameSizeInEraAndSlotLength() external view returns (uint8[2] memory) {
        return _getFrameSizeInEraAndSlotLength();
    }

    /// @inheritdoc ISlidingWindow
    function getSlotPerEra() external pure override returns (uint8) {
        return _getSlotPerEra();
    }
}
