// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Implementation of a Timestamp-Based Lazy Sliding Window Algorithm.
/// @author Kiwari Labs

library TLSW {
    uint8 private constant MINIMUM_WINDOW_SIZE = 0x1; // 1 epoch
    uint8 private constant MAXIMUM_WINDOW_SIZE = 0x20; // 32 epoch
    uint16 private constant MINIMUM_DURATION = 0xE10; // 3_600 sec
    uint32 private constant MAXIMUM_DURATION = 0x1E1853E; // 31_556_926  sec

    struct SlidingWindowState {
        uint40 secondsPerEpoch;
        uint8 windowSize;
        uint256 initialTimestamp;
    }

    error InvalidDuration();
    error InvalidWindowSize();

    function _computeEpoch(uint256 startTimestamp, uint256 blockNumber, uint256 duration) private pure returns (uint256) {
        assembly {
            if and(gt(blockNumber, startTimestamp), gt(startTimestamp, 0)) {
                mstore(0x20, div(sub(blockNumber, startTimestamp), duration))
                return(0x20, 0x20)
            }
        }
    }

    function _computeEpochRange(uint256 current, uint256 windowSize, bool safe) private pure returns (uint256) {
        assembly {
            let from := sub(current, windowSize)
            if iszero(lt(current, windowSize)) {
                mstore(0x20, from)
                return(0x20, 0x20)
            }
            if safe {
                if gt(current, windowSize) {
                    mstore(0x20, sub(from, 0x1))
                    return(0x20, 0x20)
                }
                return(0x20, 0x20)
            }
        }
    }

    function getCurrentEpoch(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint256) {
        return _computeEpoch(self.initialTimestamp, blockNumber, self.secondsPerEpoch);
    }

    function secondsInEpoch(SlidingWindowState storage self) internal view returns (uint40) {
        return self.secondsPerEpoch;
    }

    function secondsInWindow(SlidingWindowState storage self) internal view returns (uint40) {
        return self.secondsPerEpoch * self.windowSize;
    }

    function windowRange(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint256 from, uint256 to) {
        uint256 current = _computeEpoch(self.initialTimestamp, blockNumber, self.secondsPerEpoch);
        return (current, _computeEpochRange(current, self.windowSize, false));
    }

    /// @notice buffering 1 `epoch` for ensure
    function safeWindowRange(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint256 from, uint256 to) {
        uint256 current = _computeEpoch(self.initialTimestamp, blockNumber, self.secondsPerEpoch);
        return (current, _computeEpochRange(current, self.windowSize, true));
    }

    /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
    function initializedState(SlidingWindowState storage self, uint40 secondsPerEpoch, uint8 windowSize, bool development) internal {
        if (!development) {
            if (secondsPerEpoch < MINIMUM_DURATION || secondsPerEpoch > MAXIMUM_DURATION) {
                revert InvalidDuration();
            }
            if (windowSize < MINIMUM_WINDOW_SIZE || windowSize > MAXIMUM_WINDOW_SIZE) {
                revert InvalidWindowSize();
            }
        }
        unchecked {
            self.secondsPerEpoch = secondsPerEpoch;
            self.windowSize = windowSize;
        }
    }

    function initializedTimestamp(SlidingWindowState storage self, uint256 timestamp) internal {
        self.initialTimestamp = timestamp;
    }
}
