// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title Shoji (障子) is a lightweight version of the Fusuma. Shoji provide efficiency and handly sliding window algorithm.
/// @author Kiwari Labs
/// @notice Some parameter in Fusuma was pre-define as a constant variable in Shoji.

library SlidingWindow {
    uint8 private constant TWO_BITS = 2;
    uint8 private constant THREE_BITS = 3;
    uint8 private constant SLOT_PER_ERA = 4;
    uint8 private constant MINIMUM_FRAME_SIZE = 1;
    uint8 private constant MAXIMUM_FRAME_SIZE = 8;
    uint8 private constant MINIMUM_BLOCKTIME_IN_MILLI_SECONDS = 100; // 100 milliseconds.
    uint24 private constant MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS = 600_000; // 10 minutes.
    uint40 private constant YEAR_IN_MILLI_SECONDS = 31_556_926_000;

    struct SlidingWindowState {
        uint40 _blockPerEra;
        uint40 _blockPerSlot;
        uint40 _frameSizeInBlockLength;
        uint8[2] _frameSizeInEraAndSlotLength;
        uint256 _startBlockNumber;
    }

    error InvalidBlockTime();
    error InvalidFrameSize();

    function calculateEra(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint256 value) {
        unchecked {
            value = self._startBlockNumber;
            uint256 blockPerEraCache = self._blockPerEra;
            assembly {
                switch and(gt(value, 0), gt(blockNumber, value))
                case 1 {
                    value := div(sub(blockNumber, value), blockPerEraCache)
                }
                default {
                    value := 0
                }
            }
        }
    }

    function calculateSlot(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint8 slot) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            uint40 blockPerYearCache = self._blockPerEra;
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

    function updateSlidingWindow(SlidingWindowState storage self, uint24 blockTime, uint8 frameSize) internal {
        if (blockTime < MINIMUM_BLOCKTIME_IN_MILLI_SECONDS || blockTime > MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS) {
            revert InvalidBlockTime();
        }
        if (frameSize < MINIMUM_FRAME_SIZE || frameSize > MAXIMUM_FRAME_SIZE) {
            revert InvalidFrameSize();
        }
        unchecked {
            self._blockPerEra = YEAR_IN_MILLI_SECONDS / blockTime;
            self._blockPerSlot = self._blockPerEra >> TWO_BITS;
            self._frameSizeInBlockLength = self._blockPerSlot * frameSize;
            if (frameSize <= SLOT_PER_ERA) {
                self._frameSizeInEraAndSlotLength[0] = 0;
                self._frameSizeInEraAndSlotLength[1] = frameSize;
            } else {
                self._frameSizeInEraAndSlotLength[0] = frameSize >> TWO_BITS;
                self._frameSizeInEraAndSlotLength[1] = frameSize & THREE_BITS;
            }
        }
    }

    function calculateEraAndSlot(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 era, uint8 slot) {
        era = calculateEra(self, blockNumber);
        slot = calculateSlot(self, blockNumber);
    }

    function calculateBlockDifferent(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 blocks) {
        blocks = getFrameSizeInBlockLength(self);
        unchecked {
            if (blockNumber < blocks) {
                blocks = blockNumber;
            } else {
                blocks = blockNumber - blocks;
            }
        }
    }

    function frame(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = calculateEraAndSlot(self, blockNumber);
        blockNumber = calculateBlockDifferent(self, blockNumber);
        (fromEra, fromSlot) = calculateEraAndSlot(self, blockNumber);
    }

    function safeFrame(
        SlidingWindowState storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (fromEra, toEra, fromSlot, toSlot) = frame(self, blockNumber);
        assembly {
            if and(gt(fromEra, 0), gt(fromSlot, 0)) {
                if lt(fromSlot, 3) {
                    fromSlot := sub(fromSlot, 1)
                }
                if eq(fromSlot, 3) {
                    fromEra := sub(fromEra, 1)
                    fromSlot := sub(SLOT_PER_ERA, 1)
                }
            }
        }
    }

    function getBlockPerEra(SlidingWindowState storage self) internal view returns (uint40) {
        return self._blockPerEra;
    }

    function getBlockPerSlot(SlidingWindowState storage self) internal view returns (uint40) {
        return self._blockPerSlot;
    }

    function getFrameSizeInBlockLength(SlidingWindowState storage self) internal view returns (uint40) {
        return self._frameSizeInBlockLength;
    }

    function getFrameSizeInEraLength(SlidingWindowState storage self) internal view returns (uint8) {
        return self._frameSizeInEraAndSlotLength[0];
    }

    function getFrameSizeInSlotLength(SlidingWindowState storage self) internal view returns (uint8) {
        return self._frameSizeInEraAndSlotLength[1];
    }

    function getFrameSizeInEraAndSlotLength(SlidingWindowState storage self) internal view returns (uint8[2] memory) {
        return self._frameSizeInEraAndSlotLength;
    }

    function getSlotPerEra() internal pure returns (uint8) {
        return SLOT_PER_ERA;
    }
}
