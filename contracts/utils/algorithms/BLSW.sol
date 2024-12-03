// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Implementation of a Block-Height-Based Lazy Sliding Window Algorithm.
/// @author Kiwari Labs

library BLSW {
    uint8 private constant MINIMUM_WINDOW_SIZE = 0x1; // 1 epoch
    uint8 private constant MAXIMUM_WINDOW_SIZE = 0x20; // 32 epoch
    uint8 private constant MINIMUM_BLOCKTIME = 0x64; // 100 ms
    uint24 private constant MAXIMUM_BLOCKTIME = 0x927C0; // 600_000 ms
    uint40 private constant YEAR_IN_MILLISECONDS = 0x758F07A30; // 31_556_926_000 ms

    struct SlidingWindowState {
        uint256 initialBlockNumber;
        uint40 blocksPerEpoch;
        uint8 windowSize;
    }

    error InvalidBlockTime();
    error InvalidWindowSize();

    function _computeEpoch(
        uint256 initialBlockNumber,
        uint256 blockNumber,
        uint256 duration
    ) private pure returns (uint256 result) {
        assembly {
            if and(gt(blockNumber, initialBlockNumber), gt(initialBlockNumber, 0)) {
                result := div(sub(blockNumber, initialBlockNumber), duration)
            }
        }
    }

    function _computeEpochRange(uint256 current, uint256 windowSize, bool safe) private pure returns (uint256 result) {
        assembly {
            let from := sub(current, windowSize)
            if safe {
                if gt(current, windowSize) {
                    result := sub(from, 0x1)
                }
            }
            if iszero(lt(current, windowSize)) {
                result := from
            }
        }
    }

    function epoch(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint256) {
        return _computeEpoch(self.initialBlockNumber, blockNumber, self.blocksPerEpoch);
    }

    function blocksInEpoch(SlidingWindowState storage self) internal view returns (uint40) {
        return self.blocksPerEpoch;
    }

    function blocksInWindow(SlidingWindowState storage self) internal view returns (uint40) {
        return self.blocksPerEpoch * self.windowSize;
    }

    function windowRange(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256, uint256) {
        uint256 current = _computeEpoch(self.initialBlockNumber, blockNumber, self.blocksPerEpoch);
        return (_computeEpochRange(current, self.windowSize, false), current);
    }

    /// @notice buffering 1 `epoch` for ensure
    function safeWindowRange(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256, uint256) {
        uint256 current = _computeEpoch(self.initialBlockNumber, blockNumber, self.blocksPerEpoch);
        return (_computeEpochRange(current, self.windowSize, true), current);
    }

    /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
    function initializedState(
        SlidingWindowState storage self,
        uint40 blockTime,
        uint8 windowSize,
        bool development
    ) internal {
        if (!development) {
            if (blockTime < MINIMUM_BLOCKTIME || blockTime > MAXIMUM_BLOCKTIME) {
                revert InvalidBlockTime();
            }
            if (windowSize < MINIMUM_WINDOW_SIZE || windowSize > MAXIMUM_WINDOW_SIZE) {
                revert InvalidWindowSize();
            }
        }
        unchecked {
            self.blocksPerEpoch = (YEAR_IN_MILLISECONDS / blockTime) >> 2;
            self.windowSize = windowSize;
        }
    }

    function initializedBlock(SlidingWindowState storage self, uint256 blockNumber) internal {
        self.initialBlockNumber = blockNumber;
    }
}
