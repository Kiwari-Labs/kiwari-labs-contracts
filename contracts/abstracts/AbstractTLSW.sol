// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Abstract Lazy Sliding Window
/// @author Kiwari Labs

import {TLSW as slide} from "../utils/algorithms/TLSW.sol";

abstract contract AbstractTLSW {
    /// @notice Event emitted when the sliding window is updated.
    /// @param previousSecondsPerEpoch The previous duration in seconds for each epoch.
    /// @param secondsPerEpoch The new duration in seconds for each epoch.
    /// @param previousWindowSize The previous number of epochs in the window.
    /// @param windowSize The new number of epochs in the window.
    event SlidingWindowUpdated(uint40 previousSecondsPerEpoch, uint40 secondsPerEpoch, uint8 previousWindowSize, uint8 windowSize);

    using slide for slide.Window;

    slide.Window private _window;

    constructor(uint256 initialTimestamp, uint40 secondsPerEpoch_, uint8 windowSize_, bool safe_) {
        _window.initializedTimestamp(initialTimestamp != 0 ? initialTimestamp : _blockTimestampProvider());
        _updateSlidingWindow(secondsPerEpoch_, windowSize_, safe_);
    }

    /// @notice For support both Layer 1 (L1) and Layer 2 (L2) networks.
    /// @dev Returns the current timestamp in seconds.
    /// @return The current timestamp in seconds.
    function _blockTimestampProvider() internal view virtual returns (uint256) {
        return block.timestamp; // default
    }

    /// @notice Updates the sliding window's state with the new parameters and emits an event with the updated values.
    /// @param secondsPerEpoch The new duration in seconds for each epoch in the sliding window.
    /// @param windowSize The new number of epochs in the sliding window.
    /// @param safe A boolean flag to apply additional validation checks during the update.
    function _updateSlidingWindow(uint40 secondsPerEpoch, uint8 windowSize, bool safe) internal {
        _window.initializedState(secondsPerEpoch, windowSize, safe);
        emit SlidingWindowUpdated(_secondsInEpoch(), secondsPerEpoch, _windowSize(), windowSize);
    }

    /// @notice Calculates the epoch for a given block timestamp.
    /// @param blockTimestamp The block timestamp for which to calculate the epoch.
    /// @return The epoch number.
    function _epoch(uint256 blockTimestamp) internal view returns (uint256) {
        return _window.epoch(blockTimestamp);
    }

    /// @notice Returns the window range for a given block timestamp.
    /// @param blockTimestamp The block timestamp for which to get the window range.
    /// @return The start and end of the window range.
    function _windowRage(uint256 blockTimestamp) internal view returns (uint256, uint256) {
        return _window.windowRange(blockTimestamp);
    }

    /// @notice Returns the current window size.
    /// @return The current window size.
    function _windowSize() internal view returns (uint8) {
        return _window.windowSize();
    }

    /**
     * @notice Returns the initial timestamp of the sliding window.
     * @return The initial timestamp.
     */
    function _getInitialTimestamp() internal view returns (uint256) {
        return _window.getInitialTimestamp();
    }

    /// @notice Returns the number of seconds in an epoch.
    /// @return The number of seconds in an epoch.
    function _secondsInEpoch() internal view returns (uint40) {
        return _window.secondsInEpoch();
    }

    /// @notice Returns the total number of seconds in the entire sliding window.
    /// @return The total number of seconds in the sliding window.
    function _secondsInWindow() internal view returns (uint40) {
        return _window.secondsInWindow();
    }
}
