// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Abstract Lazy Sliding Window
/// @author Kiwari Labs

import {BLSW as slide} from "../utils/algorithms/BLSW.sol";

abstract contract AbstractBLSW {
    /// @notice Emitted when the sliding window is updated.
    /// @param previousBlocksPerEpoch The previous number of blocks per epoch.
    /// @param blocksPerEpoch The updated number of blocks per epoch.
    /// @param previousWindowSize The previous window size.
    /// @param windowSize The updated window size.
    event SlidingWindowUpdated(uint40 previousBlocksPerEpoch, uint40 blocksPerEpoch, uint8 previousWindowSize, uint8 windowSize);

    using slide for slide.Window;

    slide.Window private _window;

    constructor(uint256 initialBlockNumber, uint40 blocksPerEpoch_, uint8 windowSize_, bool safe_) {
        _window.initializedBlockNumber(initialBlockNumber != 0 ? initialBlockNumber : _blockNumberProvider());
        _updateSlidingWindow(blocksPerEpoch_, windowSize_, safe_);
    }

    function _initialBlockNumber() internal view virtual returns (uint256) {
        return _window.initialBlockNumber;
    }

    /// @notice For support both Layer 1 (L1) and Layer 2 (L2) networks.
    /// @dev Returns the current block number.
    /// @return The current block number.
    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number; // default
    }

    /// @notice Updates the sliding window parameters.
    /// @param blocksPerEpoch The new number of blocks per epoch.
    /// @param windowSize The new window size.
    /// @param safe A boolean to indicate whether to use safe mode for the window.
    function _updateSlidingWindow(uint40 blocksPerEpoch, uint8 windowSize, bool safe) internal {
        _window.initializedState(blocksPerEpoch, windowSize, safe);
        emit SlidingWindowUpdated(_blocksInEpoch(), blocksPerEpoch, _windowSize(), windowSize);
    }

    /// @notice Calculates the epoch for a given block number.
    /// @param blockNumber The block number for which to calculate the epoch.
    /// @return The epoch number.
    function _epoch(uint256 blockNumber) internal view returns (uint256) {
        return _window.epoch(blockNumber);
    }

    /// @notice Returns the window range for a given block number.
    /// @param blockNumber The block number for which to get the window range.
    /// @return The start and end of the window range.
    function _windowRage(uint256 blockNumber) internal view returns (uint256, uint256) {
        return _window.windowRange(blockNumber);
    }

    /// @notice Returns the current window size.
    /// @return The current window size.
    function _windowSize() internal view returns (uint8) {
        return _window.windowSize();
    }

    /// @notice Returns the number of blocks in each epoch.
    /// @return The number of blocks in an epoch.
    function _blocksInEpoch() internal view returns (uint40) {
        return _window.blocksInEpoch();
    }

    /// @notice Returns the number of blocks in the sliding window.
    /// @return The number of blocks in the window.
    function _blocksInWindow() internal view returns (uint40) {
        return _window.blocksInWindow();
    }
}
