// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @title Fusuma (襖) is an implemation sliding window algorithm in Solidity, Fusuma sliding and relying on block-height rather than block-timestmap.
/// @author Kiwari
/// @notice Fusuma designed to compatible with subsecond EVM L1 or L2.

library Fusuma {
    // 51 bytes for struct variables type.
    struct SlidingWindow {
        uint40 blockPerEra;
        uint40 blockPerSlot;
        uint40 frameSizeInBlockLength;
        uint8[2] frameSizeInEraAndSlotLength;
        uint8 frameSize;
        uint8 slotSize;
        uint256 startBlockNumber; 
    }

    // 13 bytes for constant variables.
    uint8 private constant MINIMUM_SLOT_PER_ERA = 1;
    uint8 private constant MAXIMUM_SLOT_PER_ERA = 12;
    uint8 private constant MINIMUM_FRAME_SIZE = 1;
    uint8 private constant MAXIMUM_FRAME_SIZE = 64;
    uint8 private constant MINIMUM_BLOCKTIME_IN_MILLI_SECONDS = 100;
    uint24 private constant MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS = 600_000;
    uint40 private constant YEAR_IN_MILLI_SECONDS = 31_556_926_000;

    error InvalidBlockTime();
    error InvalidFrameSize();
    error InvalidSlotPerEra();

    function _calculateEra(SlidingWindow storage self, uint256 blockNumber) private view returns (uint256) {
        unchecked {
            uint256 startblockNumberCache = self.startBlockNumber;
            // Calculate era based on the difference between the current block and start block
            if (startblockNumberCache != 0 && blockNumber > startblockNumberCache) {
                return (blockNumber - startblockNumberCache) / self.blockPerEra;
            } else {
                return 0;
            }
        }
    }

    function _calculateSlot(SlidingWindow storage self, uint256 blockNumber) private view returns (uint8) {
        unchecked {
            uint256 startblockNumberCache = self.startBlockNumber;
            uint40 blockPerYearCache = self.blockPerEra;
            if (blockNumber > startblockNumberCache) {
                return
                    uint8(
                        ((blockNumber - startblockNumberCache) % blockPerYearCache) / (blockPerYearCache / self.slotSize)
                    );
            } else {
                return 0;
            }
        }
    }

    function _frameBuffer(SlidingWindow storage self, uint256 era, uint8 slot) private view returns (uint256, uint8) {
        unchecked {
            uint8 slotPerEraCache = self.slotSize - 1;
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

    function updateSlidingWindow(
        SlidingWindow storage self,
        uint24 blockTime,
        uint8 frameSize,
        uint8 slotSize
    ) internal {
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
            self.blockPerEra = YEAR_IN_MILLI_SECONDS / blockTime;
            self.blockPerSlot = self.blockPerEra / slotSize;
            self.frameSize = frameSize;
            self.frameSizeInBlockLength = self.blockPerSlot * self.frameSize;
            self.slotSize = slotSize;
            if (frameSize <= slotSize) {
                self.frameSizeInEraAndSlotLength[0] = 0;
                self.frameSizeInEraAndSlotLength[1] = frameSize;
            } else {
                self.frameSizeInEraAndSlotLength[0] = frameSize / slotSize;
                self.frameSizeInEraAndSlotLength[1] = frameSize % slotSize;
            }
        }
    }

    function calculateEraAndSlot(
        SlidingWindow storage self,
        uint256 blockNumber
    ) internal view returns (uint256 era, uint8 slot) {
        era = _calculateEra(self, blockNumber);
        slot = _calculateSlot(self, blockNumber);
        return (era, slot);
    }

    function calculateBlockDifferent(SlidingWindow storage self, uint256 blockNumber) internal view returns (uint256) {
        uint256 frameSizeInBlockLengthCache = self.frameSizeInBlockLength;
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

    function currentEraAndSlot(
        SlidingWindow storage self,
        uint256 blockNumber
    ) internal view returns (uint256 era, uint8 slot) {
        (era, slot) = calculateEraAndSlot(self, blockNumber);
        return (era, slot);
    }

    function frame(
        SlidingWindow storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = calculateEraAndSlot(self, blockNumber);
        blockNumber = calculateBlockDifferent(self, blockNumber);
        (fromEra, fromSlot) = calculateEraAndSlot(self, blockNumber);
        return (fromEra, toEra, fromSlot, toSlot);
    }

    function safeFrame(
        SlidingWindow storage self,
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = calculateEraAndSlot(self, blockNumber);
        blockNumber = calculateBlockDifferent(self, blockNumber);
        (fromEra, fromSlot) = calculateEraAndSlot(self, blockNumber);
        (fromEra, fromSlot) = _frameBuffer(self, fromEra, fromSlot);
        return (fromEra, toEra, fromSlot, toSlot);
    }

    function getBlockPerEra(SlidingWindow storage self) internal view returns (uint40) {
        return self.blockPerEra;
    }

    function getBlockPerSlot(SlidingWindow storage self) internal view returns (uint40) {
        return self.blockPerSlot;
    }

    function getFrameSizeInBlockLength(SlidingWindow storage self) internal view returns (uint40) {
        return self.frameSizeInBlockLength;
    }

    function getFrameSizeInSlotLength(SlidingWindow storage self) internal view returns (uint8) {
        return self.frameSize;
    }

    function getFrameSizeInEraAndSlotLength(SlidingWindow storage self) internal view returns (uint8[2] memory) {
        return self.frameSizeInEraAndSlotLength;
    }

    function getSlotPerEra(SlidingWindow storage self) internal view returns (uint8) {
        return self.slotSize;
    }
}