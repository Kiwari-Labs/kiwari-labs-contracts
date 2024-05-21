// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.5.0 <0.9.0;

/// @title Shoji (障子)' is a lightweight version of the Fusuma. Shoji provide efficiency and handly sliding window algorithm.
/// @author Kiwari
/// @notice Some parameter in Fusuma was pre-define as a constant variable in Shoji.

library SlidingWindow {
    // 12 bytes allocated for global variables
    uint8 private constant SLOT_PER_ERA = 4;
    uint8 private constant MINIMUM_FRAME_SIZE = 1;
    uint8 private constant MAXIMUM_FRAME_SIZE = 8;
    uint8 private constant MINIMUM_BLOCKTIME_IN_MILLI_SECONDS = 100; // 100 milliseconds.
    uint24 private constant MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS = 600_000; // 10 minutes.
    uint40 private constant YEAR_IN_MILLI_SECONDS = 31_556_926_000;

    // 50 bytes for variables type.
    struct SlidingWindowInfo {
        uint40 _blockPerEra;
        uint40 _blockPerSlot;
        uint40 _frameSizeInBlockLength;
        uint8[2] _frameSizeInEraAndSlotLength;
        uint8 _frameSize;
        uint256 _startBlockNumber;
    }

    error InvalidBlockTime();
    error InvalidFrameSize();

    function _frameBuffer(uint256 era, uint8 slot) private pure returns (uint256, uint8) {
        unchecked {
            if (era > 0 && slot > 0) {
                if (slot < 3) {
                    slot--;
                } else {
                    era--;
                    slot = (SLOT_PER_ERA - 1);
                }
            }
        }
        return (era, slot);
    }

    function _calculateEra(SlidingWindowInfo storage self, uint256 blockNumber) internal view returns (uint256) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            // Calculate era based on the difference between the current block and start block
            if (startblockNumberCache > 0 && blockNumber > startblockNumberCache) {
                return (blockNumber - startblockNumberCache) / self._blockPerEra;
            }
        }
    }

    function _calculateSlot(SlidingWindowInfo storage self, uint256 blockNumber) internal view returns (uint8) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            uint40 blockPerYearCache = self._blockPerEra;
            if (blockNumber > startblockNumberCache) {
                return
                    uint8(
                        ((blockNumber - startblockNumberCache) % blockPerYearCache) / (blockPerYearCache / SLOT_PER_ERA)
                    );
            }
        }
    }

    function _updateSlidingWindow(SlidingWindowInfo storage self, uint24 blockTime, uint8 frameSize) internal {
        if (blockTime < MINIMUM_BLOCKTIME_IN_MILLI_SECONDS || blockTime > MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS) {
            revert InvalidBlockTime();
        }
        if (frameSize < MINIMUM_FRAME_SIZE || frameSize > MAXIMUM_FRAME_SIZE) {
            revert InvalidFrameSize();
        }
        unchecked {
            self._blockPerEra = YEAR_IN_MILLI_SECONDS / blockTime;
            self._blockPerSlot = self._blockPerEra / SLOT_PER_ERA;
            self._frameSize = frameSize;
            self._frameSizeInBlockLength = self._blockPerSlot * self._frameSize;
            if (frameSize <= SLOT_PER_ERA) {
                self._frameSizeInEraAndSlotLength[0] = 0;
                self._frameSizeInEraAndSlotLength[1] = frameSize;
            } else {
                self._frameSizeInEraAndSlotLength[0] = frameSize / SLOT_PER_ERA;
                self._frameSizeInEraAndSlotLength[1] = frameSize % SLOT_PER_ERA;
            }
        }
    }

    function _calculateEraAndSlot(
        SlidingWindowInfo storage self,
        uint256 blockNumber
    ) internal view returns (uint256 era, uint8 slot) {
        era = _calculateEra(self, blockNumber);
        slot = _calculateSlot(self, blockNumber);
        return (era, slot);
    }

    function _calculateBlockDifferent(SlidingWindowInfo storage self, uint256 blockNumber) internal view returns (uint256) {
        uint256 frameSizeInBlockLengthCache = getFrameSizeInBlockLength(self);
        unchecked {
            if (blockNumber < frameSizeInBlockLengthCache) {
                // If the current block is within the expiration period
                return blockNumber;
            } else {
                // If the current block is beyond the expiration period
                return blockNumber - frameSizeInBlockLengthCache;
            }
        }
    }

    function _frame(
        SlidingWindowInfo storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = _calculateEraAndSlot(self, blockNumber);
        blockNumber = _calculateBlockDifferent(self, blockNumber);
        (fromEra, fromSlot) = _calculateEraAndSlot(self, blockNumber);
        return (fromEra, toEra, fromSlot, toSlot);
    }

    function _safeFrame(
        SlidingWindowInfo storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (fromEra, toEra, fromSlot, toSlot) = _frame(self, blockNumber);
        (fromEra, fromSlot) = _frameBuffer(fromEra, fromSlot);
        return (fromEra, toEra, fromSlot, toSlot);
    }

    function getBlockPerEra(SlidingWindowInfo storage self) public view returns (uint40) {
        return self._blockPerEra;
    }

    function getBlockPerSlot(SlidingWindowInfo storage self) public view returns (uint40) {
        return self._blockPerSlot;
    }

    function getFrameSizeInBlockLength(SlidingWindowInfo storage self) public view returns (uint40) {
        return self._frameSizeInBlockLength;
    }

    function getFrameSizeInSlotLength(SlidingWindowInfo storage self) public view returns (uint8) {
        return self._frameSize;
    }

    function getFrameSizeInEraAndSlotLength(SlidingWindowInfo storage self) public view returns (uint8[2] memory) {
        return self._frameSizeInEraAndSlotLength;
    }

    function getSlotPerEra() public pure returns (uint8) {
        return SLOT_PER_ERA;
    }
}
