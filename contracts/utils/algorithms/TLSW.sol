// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Implementation of a Timestamp-Based Lazy Sliding Window Algorithm.
/// @author Kiwari Labs

library TLSW {
    uint8 private constant MINIMUM_WINDOW_SIZE = 0x01; // 1 epoch
    uint8 private constant MAXIMUM_WINDOW_SIZE = 0x20; // 32 epoch
    uint40 private constant MINIMUM_DURATION = 0x0E10; // 3_600 sec
    uint40 private constant MAXIMUM_DURATION = 0x01E1853E; // 31_556_926 sec

    struct Window {
        uint256 initialTimestamp;
        uint40 secondsPerEpoch;
        uint40 secondsPerWindow;
        uint8 epochsPerWindow;
    }

    /// @notice Thrown when an invalid duration is provided.
    /// @dev Triggered when the duration is out of bounds.
    error InvalidDuration();

    /// @notice Thrown when an invalid window size is provided.
    /// @dev Triggered when the window size is out of bounds.
    error InvalidWindowSize();

    /// @notice Computes the current epoch based on the initial timestamp, current time, and seconds per epoch.
    /// @param initialTimestamp The timestamp where the sliding window starts.
    /// @param currentTime The current timestamp in seconds.
    /// @param secondsPerEpoch The number of seconds per epoch.
    /// @return current The calculated epoch.
    function _computeEpoch(uint256 initialTimestamp, uint256 currentTime, uint256 secondsPerEpoch) private pure returns (uint256 current) {
        assembly {
            if and(gt(currentTime, initialTimestamp), gt(initialTimestamp, 0)) {
                current := div(sub(currentTime, initialTimestamp), secondsPerEpoch)
            }
        }
    }

    /// @notice Computes the range of epochs based on the initial timestamp, current time, seconds per epoch, and window size.
    /// @param initialTimestamp The timestamp where the sliding window starts.
    /// @param currentTime The current timestamp in seconds.
    /// @param secondsPerEpoch The number of seconds per epoch.
    /// @param windowSize_ The number of epochs in the window.
    /// @return fromEpoch The starting epoch of the range.
    /// @return toEpoch The ending epoch of the range.
    function _computeEpochRange(
        uint256 initialTimestamp,
        uint256 currentTime,
        uint256 secondsPerEpoch,
        uint256 windowSize_
    ) private pure returns (uint256 fromEpoch, uint256 toEpoch) {
        assembly {
            if and(gt(currentTime, initialTimestamp), gt(initialTimestamp, 0)) {
                toEpoch := div(sub(currentTime, initialTimestamp), secondsPerEpoch)
            }

            let from := sub(toEpoch, windowSize_)
            if iszero(lt(toEpoch, windowSize_)) {
                fromEpoch := from
            }
        }
    }

    /// @notice Returns the number of seconds in each epoch for a given window.
    /// @param self The sliding window structure.
    /// @return The number of seconds in each epoch.
    function secondsInEpoch(Window storage self) internal view returns (uint40) {
        return self.secondsPerEpoch;
    }

    /// @notice Returns the number of seconds in the entire window.
    /// @param self The sliding window structure.
    /// @return The total number of seconds in the window.
    function secondsInWindow(Window storage self) internal view returns (uint40) {
        return self.secondsPerWindow;
    }

    /// @notice Returns the number of epochs in the window.
    /// @param self The sliding window structure.
    /// @return The number of epochs in the window.
    function windowSize(Window storage self) internal view returns (uint8) {
        return self.epochsPerWindow;
    }

    /// @notice Computes the epoch number for a given timestamp.
    /// @param self The sliding window structure.
    /// @param currentTime The current timestamp in seconds for which the epoch is calculated.
    /// @return The calculated epoch.
    function epoch(Window storage self, uint256 currentTime) internal view returns (uint256) {
        return _computeEpoch(self.initialTimestamp, currentTime, self.secondsPerEpoch);
    }

    /// @notice Returns the range of epochs for a given timestamp.
    /// @param self The sliding window structure.
    /// @param currentTime The current timestamp in seconds for which the epoch range is calculated.
    /// @return fromEpoch The start of the epoch range.
    /// @return toEpoch The end of the epoch range.
    function windowRange(Window storage self, uint256 currentTime) internal view returns (uint256, uint256) {
        return _computeEpochRange(self.initialTimestamp, currentTime, self.secondsPerEpoch, self.epochsPerWindow);
    }

    /// @notice Initializes the sliding window's state with the number of seconds per epoch, the window size, and whether to apply safe mode.
    /// @param self The sliding window structure.
    /// @param secondsPerEpoch The number of seconds per epoch.
    /// @param windowSize_ The number of epochs per window.
    /// @param safe Whether to apply safe mode to validate the values.
    /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
    function initializedState(Window storage self, uint40 secondsPerEpoch, uint8 windowSize_, bool safe) internal {
        if (safe) {
            if (secondsPerEpoch < MINIMUM_DURATION || secondsPerEpoch > MAXIMUM_DURATION) {
                revert InvalidDuration();
            }
            if (windowSize_ < MINIMUM_WINDOW_SIZE || windowSize_ > MAXIMUM_WINDOW_SIZE) {
                revert InvalidWindowSize();
            }
        }
        unchecked {
            self.secondsPerEpoch = secondsPerEpoch;
            self.secondsPerWindow = secondsPerEpoch * windowSize_;
            self.epochsPerWindow = windowSize_;
        }
    }

    /// @notice Initializes the timestamp at which the sliding window starts.
    /// @dev Sets the initial timestamp for the sliding window.
    /// @param self The sliding window structure.
    /// @param currentTime The initial timestamp (in seconds).
    function initializedTimestamp(Window storage self, uint256 currentTime) internal {
        self.initialTimestamp = currentTime;
    }
}
