// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Implementation of a Block-Height-Based Lazy Sliding Window Algorithm.
/// @author Kiwari Labs

library BLSW {
    uint8 private constant MINIMUM_WINDOW_SIZE = 0x01; // 1 epoch
    uint8 private constant MAXIMUM_WINDOW_SIZE = 0x20; // 32 epoch
    uint8 private constant MINIMUM_BLOCKTIME = 0x64; // 100 ms
    uint24 private constant MAXIMUM_BLOCKTIME = 0x927C0; // 600_000 ms
    uint40 private constant YEAR_IN_MILLISECONDS = 0x758F07A30; // 31_556_926_000 ms

    struct Window {
        uint256 initialBlockNumber;
        uint40 blocksPerEpoch;
        uint40 blocksPerWindow;
        uint8 epochsPerWindow;
    }

    error InvalidBlockTime();
    error InvalidWindowSize();

    function _computeEpoch(uint256 initialBlockNumber, uint256 blockNumber, uint256 duration) private pure returns (uint256 current) {
        assembly {
            if and(gt(blockNumber, initialBlockNumber), gt(initialBlockNumber, 0)) {
                current := div(sub(blockNumber, initialBlockNumber), duration)
            }
        }
    }

    function _computeEpochRange(
        uint256 initialBlockNumber,
        uint256 blockNumber,
        uint256 duration,
        uint256 windowSize,
        bool safe
    ) private pure returns (uint256 fromEpoch, uint256 toEpoch) {
        assembly {
            if and(gt(blockNumber, initialBlockNumber), gt(initialBlockNumber, 0)) {
                toEpoch := div(sub(blockNumber, initialBlockNumber), duration)
            }

            let from := sub(toEpoch, windowSize)
            if safe {
                if gt(toEpoch, windowSize) {
                    fromEpoch := sub(from, 0x1)
                }
            }
            if iszero(lt(toEpoch, windowSize)) {
                fromEpoch := from
            }
        }
    }

    function blocksInEpoch(Window storage self) internal view returns (uint40) {
        return self.blocksPerEpoch;
    }

    function blocksInWindow(Window storage self) internal view returns (uint40) {
        return self.blocksPerWindow;
    }

    function epoch(Window storage self, uint256 blockNumber) internal view returns (uint256) {
        return _computeEpoch(self.initialBlockNumber, blockNumber, self.blocksPerEpoch);
    }

    function windowSize(Window storage self) internal view returns (uint8) {
        return self.epochsPerWindow;
    }

    function windowRange(Window storage self, uint256 blockNumber) internal view returns (uint256, uint256) {
        return _computeEpochRange(self.initialBlockNumber, blockNumber, self.blocksPerEpoch, self.epochsPerWindow, false);
    }

    /// @notice buffering 1 `epoch` for ensure
    function safeWindowRange(Window storage self, uint256 blockNumber) internal view returns (uint256, uint256) {
        return _computeEpochRange(self.initialBlockNumber, blockNumber, self.blocksPerEpoch, self.epochsPerWindow, true);
    }

    /// @custom:truncate https://docs.soliditylang.org/en/latest/types.html#division
    function initializedState(Window storage self, uint40 blockTime, uint8 windowSize, bool safe) internal {
        if (safe) {
            if (blockTime < MINIMUM_BLOCKTIME || blockTime > MAXIMUM_BLOCKTIME) {
                revert InvalidBlockTime();
            }
            if (windowSize < MINIMUM_WINDOW_SIZE || windowSize > MAXIMUM_WINDOW_SIZE) {
                revert InvalidWindowSize();
            }
        }
        unchecked {
            uint40 blocksPerEpoch = (YEAR_IN_MILLISECONDS / blockTime) >> 2;
            self.blocksPerEpoch = blocksPerEpoch;
            self.blocksPerWindow = blocksPerEpoch * windowSize;
            self.epochsPerWindow = windowSize;
        }
    }

    function initializedBlock(Window storage self, uint256 blockNumber) internal {
        self.initialBlockNumber = blockNumber;
    }
}
