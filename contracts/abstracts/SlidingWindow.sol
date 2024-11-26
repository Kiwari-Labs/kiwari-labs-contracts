// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Sliding Window abstract contract
/// @author Kiwari Labs

import {ISlidingWindow} from "../interfaces/ISlidingWindow.sol";
import {SlidingWindow as Slide} from "../utils/SlidingWindow.sol";

abstract contract SlidingWindow is ISlidingWindow {
    using Slide for Slide.SlidingWindowState;

    Slide.SlidingWindowState private _slidingWindow;

    /// @notice Constructs the Sliding Window Contract with the initial parameters.
    /// @dev Initializes the sliding window with the provided parameters.
    /// If `blockNumber_` is zero, the current block number is fetched using `_blockNumberProvider()`.
    /// @param blockNumber_ The initial block number for the sliding window. If zero, the current block number is used.
    /// @param blockTime_ The block time to be used for the sliding window.
    /// @param frameSize_ The frame size for the sliding window.
    /// @param slotSize_ The slot size for the sliding window.
    constructor(uint256 blockNumber_, uint16 blockTime_, uint8 frameSize_, uint8 slotSize_) {
        _slidingWindow.updateStartBlock(blockNumber_ != 0 ? blockNumber_ : _blockNumberProvider());
        _updateSlidingWindow(blockTime_, frameSize_, slotSize_);
    }

    /// @notice Allows for  in subsecond blocktime network.
    /// @dev Returns the current block number.
    /// This function can be overridden in derived contracts to provide custom
    /// block number logic, useful in networks with subsecond block times.
    /// @return The current network block number.
    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number;
    }

    /// @notice Updates the parameters of the sliding window based on the given block time and frame size.
    /// @dev This function adjusts internal parameters such as blockPerEpoch, blockPerSlot, and frame sizes
    /// based on the provided blockTime and frameSize. It ensures that block time is within valid limits
    /// and frame size is appropriate for the sliding window. The calculations depend on constants like
    /// YEAR_IN_MILLISECONDS , MINIMUM_BLOCK_TIME_IN_MILLISECONDS , MAXIMUM_BLOCK_TIME_IN_MILLISECONDS ,
    /// MINIMUM_FRAME_SIZE, MAXIMUM_FRAME_SIZE, and SLOT_PER_EPOCH.
    /// @param blockTime The time duration of each block in milliseconds.
    /// @param frameSize The size of the frame in slots.
    /// @param slotSize The size of the slot per epoch.
    function _updateSlidingWindow(uint24 blockTime, uint8 frameSize, uint8 slotSize) internal virtual {
        _slidingWindow.updateSlidingWindow(blockTime, frameSize, slotSize);
    }

    /// @notice Calculates the current epoch and slot within the sliding window based on the given block number.
    /// @dev This function computes both the epoch and slot using the provided block number and the sliding
    /// window state parameters such as _startBlockNumber, _blockPerEpoch, and _slotSize. It delegates epoch
    /// calculation to the `calculateEpoch` function and slot calculation to the `calculateSlot` function.
    /// The epoch represents the number of complete epochs that have passed since the sliding window started,
    /// while the slot indicates the specific position within the current epoch.
    /// @param blockNumber The block number to calculate the epoch and slot from.
    /// @return epoch The current epoch derived from the block number.
    /// @return slot The current slot within the epoch derived from the block number.
    function _calculateEpochAndSlot(uint256 blockNumber) internal view virtual returns (uint256 epoch, uint8 slot) {
        (epoch, slot) = _slidingWindow.calculateEpochAndSlot(blockNumber);
    }

    /// @notice Determines the sliding window frame based on the provided block number.
    /// @dev This function computes the sliding window frame based on the provided `blockNumber` and the state `self`.
    /// It determines the `toEpoch` and `toSlot` using `calculateEpochAndSlot`, then calculates the block difference
    /// using `_calculateBlockDifferent` to adjust the `blockNumber`. Finally, it computes the `fromEpoch` and `fromSlot`
    /// using `calculateEpochAndSlot` with the adjusted `blockNumber`, completing the determination of the sliding window frame.
    /// @param blockNumber The current block number to calculate the sliding window frame from.
    /// @return fromEpoch The starting epoch of the sliding window frame.
    /// @return toEpoch The ending epoch of the sliding window frame.
    /// @return fromSlot The starting slot within the starting epoch of the sliding window frame.
    /// @return toSlot The ending slot within the ending epoch of the sliding window frame.
    function _frame(
        uint256 blockNumber
    ) internal view virtual returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        return _slidingWindow.frame(blockNumber);
    }

    /// @notice Computes a safe frame of epochs and slots relative to a given block number.
    /// @dev This function computes a safe frame of epochs and slots relative to the provided `blockNumber`.
    /// It first calculates the frame using the `frame` function and then adjusts the result to ensure safe indexing.
    /// @param blockNumber The block number used as a reference point for computing the frame.
    /// @return fromEpoch The starting epoch of the safe frame.
    /// @return toEpoch The ending epoch of the safe frame.
    /// @return fromSlot The starting slot within the starting epoch of the safe frame.
    /// @return toSlot The ending slot within the ending epoch of the safe frame.
    function _safeFrame(
        uint256 blockNumber
    ) internal view virtual returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        return _slidingWindow.safeFrame(blockNumber);
    }

    /// @notice Retrieves the number of blocks per epoch from the sliding window state.
    /// @dev Uses the sliding window state to fetch the blocks per epoch.
    /// @return The number of blocks per epoch.
    function _getBlocksPerEpoch() internal view virtual returns (uint40) {
        return _slidingWindow.getBlocksPerEpoch();
    }

    /// @notice Retrieves the number of blocks per slot from the sliding window state.
    /// @dev Uses the sliding window state to fetch the blocks per slot.
    /// @return The number of blocks per slot.
    function _getBlocksPerSlot() internal view virtual returns (uint40) {
        return _slidingWindow.getBlocksPerSlot();
    }

    /// @notice Retrieves the frame size in block length from the sliding window state.
    /// @dev Uses the sliding window state to fetch the frame size in terms of block length.
    /// @return The frame size in block length.
    function _getFrameSizeInBlockLength() internal view virtual returns (uint40) {
        return _slidingWindow.getFrameSizeInBlockLength();
    }

    /// @notice Retrieves the number of slots per epoch from the sliding window state.
    /// @dev This function returns the `_slotSize` attribute from the provided sliding window state `self`,
    /// which represents the number of slots per epoch in the sliding window configuration.
    /// @return The number of slots per epoch configured in the sliding window state.
    function _getSlotsPerEpoch() internal view virtual returns (uint8) {
        return _slidingWindow.getSlotsPerEpoch();
    }

    /// @inheritdoc ISlidingWindow
    function currentEpochAndSlot() external view virtual returns (uint256 epoch, uint8 slot) {
        return _calculateEpochAndSlot(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function frame() external view virtual returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        return _frame(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function safeFrame()
        external
        view
        virtual
        returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot)
    {
        return _safeFrame(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function getBlocksPerEpoch() external view virtual returns (uint40) {
        return _getBlocksPerEpoch();
    }

    /// @inheritdoc ISlidingWindow
    function getBlocksPerSlot() external view virtual returns (uint40) {
        return _getBlocksPerSlot();
    }

    /// @inheritdoc ISlidingWindow
    function getFrameSizeInBlockLength() external view virtual returns (uint40) {
        return _getFrameSizeInBlockLength();
    }

    /// @inheritdoc ISlidingWindow
    function getSlotsPerEpoch() external view virtual returns (uint8) {
        return _getSlotsPerEpoch();
    }
}
