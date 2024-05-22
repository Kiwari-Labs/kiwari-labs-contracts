// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity >=0.5.0 <0.9.0;

/// @title Fusuma (襖) is an implemation sliding window algorithm in Solidity, Fusuma sliding and relying on block-height rather than block-timestmap.
/// @author Kiwari
/// @notice Fusuma designed to compatible with subsecond blocktime on both Layer 1 Network (L1) and Layer 2 Network (L2).

library FullSlidingWindow {
    // 13 bytes for constant variables.
    uint8 private constant MINIMUM_SLOT_PER_ERA = 1;
    uint8 private constant MAXIMUM_SLOT_PER_ERA = 12;
    uint8 private constant MINIMUM_FRAME_SIZE = 1;
    uint8 private constant MAXIMUM_FRAME_SIZE = 64;
    uint8 private constant MINIMUM_BLOCKTIME_IN_MILLI_SECONDS = 100;
    uint24 private constant MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS = 600_000;
    uint40 private constant YEAR_IN_MILLI_SECONDS = 31_556_926_000;

    // 50 bytes for struct variables type.
    struct SlidingWindowState {    
        uint40 _blockPerEra;
        uint40 _blockPerSlot;
        uint40 _frameSizeInBlockLength;
        uint8[2] _frameSizeInEraAndSlotLength;
        uint8 _slotSize;
        uint256 _startBlockNumber;
    }

    error InvalidBlockTime();
    error InvalidFrameSize();
    error InvalidSlotPerEra();

    function _calculateEra(SlidingWindowState storage self, uint256 blockNumber) private view returns (uint256) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            // Calculate era based on the difference between the current block and start block
            if (startblockNumberCache > 0 && blockNumber > startblockNumberCache) {
                return (blockNumber - startblockNumberCache) / self._blockPerEra;
            } else {
                return 0;
            }
        }
    }

    function _calculateSlot(SlidingWindowState storage self, uint256 blockNumber) private view returns (uint8) {
        unchecked {
            uint256 startblockNumberCache = self._startBlockNumber;
            uint40 blockPerYearCache = self._blockPerEra;
            if (blockNumber > startblockNumberCache) {
                return
                    uint8(((blockNumber - startblockNumberCache) % blockPerYearCache) / (blockPerYearCache / self._slotSize));
            } else {
                return 0;
            }
        }
    }

    function _frameBuffer(SlidingWindowState storage self, uint256 era, uint8 slot) private view returns (uint256, uint8) {
        unchecked {
            uint8 slotPerEraCache = self._slotSize - 1;
            if (era > 0 && slot > 0) {
                if (slot < slotPerEraCache) {
                    slot--;
                } else {
                    era--;
                    slot = slotPerEraCache;
                }
            }
        }
        return (era, slot);
    }

    function updateSlidingWindow(SlidingWindowState storage self, uint24 blockTime, uint8 frameSize, uint8 slotSize) internal {
        if (blockTime < MINIMUM_BLOCKTIME_IN_MILLI_SECONDS || blockTime > MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS) {
            revert InvalidBlockTime();
        }
        if (frameSize < MINIMUM_FRAME_SIZE || frameSize > MAXIMUM_FRAME_SIZE) {
            revert InvalidFrameSize();
        }
        if (slotSize < MINIMUM_SLOT_PER_ERA || slotSize > MAXIMUM_SLOT_PER_ERA) {
            revert InvalidSlotPerEra();
        }
        unchecked {
            self._blockPerEra = YEAR_IN_MILLI_SECONDS / blockTime;
            self._blockPerSlot = self._blockPerEra / slotSize;
            self._frameSizeInBlockLength = self._blockPerSlot * frameSize;
            self._slotSize = slotSize;
            if (frameSize <= slotSize) {
                self._frameSizeInEraAndSlotLength[0] = 0;
                self._frameSizeInEraAndSlotLength[1] = frameSize;
            } else {
                self._frameSizeInEraAndSlotLength[0] = frameSize / slotSize;
                self._frameSizeInEraAndSlotLength[1] = frameSize % slotSize;
            }
        }
    }

    function calculateEraAndSlot(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint256 era, uint8 slot) {
        era = _calculateEra(self, blockNumber);
        slot = _calculateSlot(self, blockNumber);
        return (era, slot);
    }

    function calculateBlockDifferent(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint256) {
        uint256 frameSizeInBlockLengthCache = self._frameSizeInBlockLength;
        unchecked {
            if (blockNumber >= frameSizeInBlockLengthCache) {
                // If the current block is beyond the expiration period
                return blockNumber - frameSizeInBlockLengthCache;
            } else {
                // If the current block is within the expiration period
                return blockNumber;
            }
        }
    }

    function currentEraAndSlot(SlidingWindowState storage self, uint256 blockNumber) internal view returns (uint256 era, uint8 slot) {
        (era, slot) = calculateEraAndSlot(self, blockNumber);
        return (era, slot);
    }

    function frame(
        SlidingWindowState storage self, uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = calculateEraAndSlot(self, blockNumber);
        blockNumber = calculateBlockDifferent(self, blockNumber);
        (fromEra, fromSlot) = calculateEraAndSlot(self, blockNumber);
        return (fromEra, toEra, fromSlot, toSlot);
    }

    function safeFrame(
        SlidingWindowState storage self, uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = calculateEraAndSlot(self, blockNumber);
        blockNumber = calculateBlockDifferent(self, blockNumber);
        (fromEra, fromSlot) = calculateEraAndSlot(self, blockNumber);
        (fromEra, fromSlot) = _frameBuffer(self, fromEra, fromSlot);
        return (fromEra, toEra, fromSlot, toSlot);
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

    function getSlotPerEra(SlidingWindowState storage self) internal view returns (uint8) {
        return self._slotSize;
    }
}
