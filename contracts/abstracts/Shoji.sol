// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @title Shoji (障子)' is a lightweight version of the Fusuma. Shoji provide efficiency and handly sliding window algorithm.
/// @author Kiwari
/// @notice Some parameter in Fusuma was pre-define as a constant variable in Shoji.

import "../interfaces/ISlidingWindow.sol";

abstract contract Shoji is ISlidingWindow {
    // 49 bytes allocated for global variables
    uint8 private constant SLOT_PER_ERA = 4;
    uint8 private constant MINIMUM_FRAME_SIZE = 1;
    uint8 private constant MAXIMUM_FRAME_SIZE = 8;
    uint8 private constant MINIMUM_BLOCKTIME_IN_MILLI_SECONDS = 100; // 100 milliseconds.
    uint24 private constant MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS = 600_000; // 10 minutes.
    uint40 private constant YEAR_IN_MILLI_SECONDS = 31_556_926_000;

    // 50 bytes for variables type.
    uint40 private _blockPerEra;
    uint40 private _blockPerSlot;
    uint40 private _frameSizeInBlockLength;
    uint8[2] private _frameSizeInEraAndSlotLength;
    uint8 private _frameSize;
    uint256 private immutable _startBlockNumber;

    constructor(uint256 startBlock, uint24 blockTime, uint8 frameSize) {
        _startBlockNumber = startBlock;
        _updateSlidingWindow(blockTime, frameSize);
    }

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

    function _calculateEra(uint256 blockNumber) internal view returns (uint256) {
        unchecked {
            uint256 startblockNumberCache = _startBlockNumber;
            // Calculate era based on the difference between the current block and start block
            if (startblockNumberCache > 0 && blockNumber > startblockNumberCache) {
                return (blockNumber - startblockNumberCache) / _blockPerEra;
            }
        }
    }

    function _calculateSlot(uint256 blockNumber) internal view returns (uint8) {
        unchecked {
            uint256 startblockNumberCache = _startBlockNumber;
            uint40 blockPerYearCache = _blockPerEra;
            if (blockNumber > startblockNumberCache) {
                return
                    uint8(
                        ((blockNumber - startblockNumberCache) % blockPerYearCache) / (blockPerYearCache / SLOT_PER_ERA)
                    );
            }
        }
    }

    function _updateSlidingWindow(uint24 blockTime, uint8 frameSize) internal {
        // if (blockTime < MINIMUM_BLOCKTIME_IN_MILLI_SECONDS || blockTime > MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS) {
        //     revert InvalidBlockTime();
        // }
        // if (frameSize < MINIMUM_FRAME_SIZE || frameSize > MAXIMUM_FRAME_SIZE) {
        //     revert InvalidFrameSize();
        // }
        unchecked {
            _blockPerEra = YEAR_IN_MILLI_SECONDS / blockTime;
            _blockPerSlot = _blockPerEra / SLOT_PER_ERA;
            _frameSize = frameSize;
            _frameSizeInBlockLength = _blockPerSlot * _frameSize;
            if (frameSize <= SLOT_PER_ERA) {
                _frameSizeInEraAndSlotLength[0] = 0;
                _frameSizeInEraAndSlotLength[1] = frameSize;
            } else {
                _frameSizeInEraAndSlotLength[0] = frameSize / SLOT_PER_ERA;
                _frameSizeInEraAndSlotLength[1] = frameSize % SLOT_PER_ERA;
            }
        }
    }

    function _blockNumberProvider() internal view returns (uint256) {
        return block.number;
    }

    function _calculateEraAndSlot(uint256 blockNumber) internal view returns (uint256 era, uint8 slot) {
        era = _calculateEra(blockNumber);
        slot = _calculateSlot(blockNumber);
        return (era, slot);
    }

    function _calculateBlockDifferent(uint256 blockNumber) internal view returns (uint256) {
        uint256 frameSizeInBlockLengthCache = getFrameSizeInBlockLength();
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
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (toEra, toSlot) = _calculateEraAndSlot(blockNumber);
        blockNumber = _calculateBlockDifferent(blockNumber);
        (fromEra, fromSlot) = _calculateEraAndSlot(blockNumber);
        return (fromEra, toEra, fromSlot, toSlot);
    }

    function _safeFrame(
        uint256 blockNumber
    ) internal view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (fromEra, toEra, fromSlot, toSlot) = _frame(blockNumber);
        (fromEra, fromSlot) = _frameBuffer(fromEra, fromSlot);
        return (fromEra, toEra, fromSlot, toSlot);
    }

    function getBlockPerEra() public view  returns (uint40) {
        return _blockPerEra;
    }

    function getBlockPerSlot() public view  returns (uint40) {
        return _blockPerSlot;
    }

    function getFrameSizeInBlockLength() public view  returns (uint40) {
        return _frameSizeInBlockLength;
    }

    function getFrameSizeInSlotLength() public view  returns (uint8) {
        return _frameSize;
    }

    function getFrameSizeInEraAndSlotLength() public view  returns (uint8[2] memory) {
        return _frameSizeInEraAndSlotLength;
    }

    function getSlotPerEra() public pure  returns (uint8) {
        return SLOT_PER_ERA;
    }

    function currentSlot() public view  returns (uint8) {
        uint256 blockNumber = _blockNumberProvider();
        return _calculateSlot(blockNumber);
    }

    function currentEra() public view  returns (uint256) {
        uint256 blockNumber = _blockNumberProvider();
        return _calculateEra(blockNumber);
    }

    function frame() public view  returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        uint256 blockNumber = _blockNumberProvider();
        return _frame(blockNumber);
    }

    function safeFrame() public view  returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        uint256 blockNumber = _blockNumberProvider();
        return _safeFrame(blockNumber);
    }

    function currentEraAndSlot() public view  returns (uint256 era, uint8 slot) {
        uint256 blockNumber = _blockNumberProvider();
        (era, slot) = _calculateEraAndSlot(blockNumber);
        return (era, slot);
    }
}
