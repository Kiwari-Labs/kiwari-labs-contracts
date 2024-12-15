// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Implementation of a Timestamp-Based Lazy Sliding Window Algorithm.
/// @author Kiwari Labs

library TLSW {
    uint8 private constant MINIMUM_WINDOW_SIZE = 0x01; // 1 epoch
    uint8 private constant MAXIMUM_WINDOW_SIZE = 0x20; // 32 epoch
    uint40 private constant MINIMUM_DURATION = 0xE10; // 3_600 sec
    uint40 private constant MAXIMUM_DURATION = 0x1E1853E; // 31_556_926  sec

    struct Window {
        uint256 initialTimestamp;
        uint40 secondsPerEpoch;
        uint40 secondsPerWindow;
        uint8 epochsPerWindow;
    }

    error InvalidDuration();
    error InvalidWindowSize();

    function _computeEpoch(uint256 initialTimestamp, uint256 currentTime, uint256 duration) private pure returns (uint256 current) {
        assembly {
            if and(gt(currentTime, initialTimestamp), gt(initialTimestamp, 0)) {
                current := div(sub(currentTime, initialTimestamp), duration)
            }
        }
    }

    function _computeEpochRange(
        uint256 initialTimestamp,
        uint256 currentTime,
        uint256 duration,
        uint256 windowSize,
        bool safe
    ) private pure returns (uint256 fromEpoch, uint256 toEpoch) {
        assembly {
            if and(gt(currentTime, initialTimestamp), gt(initialTimestamp, 0)) {
                toEpoch := div(sub(currentTime, initialTimestamp), duration)
            }

            let from := sub(toEpoch, windowSize)
            if iszero(lt(toEpoch, windowSize)) {
                fromEpoch := from
            }
            if safe {
                if gt(toEpoch, windowSize) {
                    fromEpoch := sub(from, 0x1)
                }
            }
        }
    }

    function secondsInEpoch(Window storage self) internal view returns (uint40) {
        return self.secondsPerEpoch;
    }

    function secondsInWindow(Window storage self) internal view returns (uint40) {
        return self.secondsPerWindow;
    }

    function windowSize(Window storage self) internal view returns (uint8) {
        return self.epochsPerWindow;
    }

    function epoch(Window storage self, uint256 currentTime) internal view returns (uint256) {
        return _computeEpoch(self.initialTimestamp, currentTime, self.secondsPerEpoch);
    }

    function windowRange(Window storage self, uint256 currentTime) internal view returns (uint256, uint256) {
        return _computeEpochRange(self.initialTimestamp, currentTime, self.secondsPerEpoch, self.secondsPerWindow, false);
    }

    /// @notice buffering 1 `epoch` for ensure
    function safeWindowRange(Window storage self, uint256 currentTime) internal view returns (uint256, uint256) {
        return _computeEpochRange(self.initialTimestamp, currentTime, self.secondsPerEpoch, self.secondsPerWindow, true);
    }

    /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
    function initializedState(Window storage self, uint40 secondsPerEpoch, uint8 windowSize, bool safe) internal {
        if (safe) {
            if (secondsPerEpoch < MINIMUM_DURATION || secondsPerEpoch > MAXIMUM_DURATION) {
                revert InvalidDuration();
            }
            if (windowSize < MINIMUM_WINDOW_SIZE || windowSize > MAXIMUM_WINDOW_SIZE) {
                revert InvalidWindowSize();
            }
        }
        unchecked {
            self.secondsPerEpoch = secondsPerEpoch;
            self.secondsPerWindow = secondsPerEpoch * windowSize;
            self.epochsPerWindow = windowSize;
        }
    }

    function initializedTimestamp(Window storage self, uint256 currentTime) internal {
        self.initialTimestamp = currentTime;
    }
}
