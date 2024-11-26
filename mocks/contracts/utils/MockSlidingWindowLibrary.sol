// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/utils/SlidingWindow.sol";

contract MockSlidingWindowLibrary {
    using SlidingWindow for SlidingWindow.SlidingWindowState;
    SlidingWindow.SlidingWindowState public slidingWindow;

    constructor(uint256 startBlockNumber, uint16 blockPeriod, uint8 frameSize, uint8 slotSize) {
        slidingWindow.updateStartBlock(startBlockNumber != 0 ? startBlockNumber : block.number);
        slidingWindow.updateSlidingWindow(blockPeriod, frameSize, slotSize);
    }

    function updateWindow(uint24 blockTime, uint8 frameSize, uint8 slotSize) public {
        slidingWindow.updateSlidingWindow(blockTime, frameSize, slotSize);
    }

    function frame(
        uint256 blockNumber
    ) public view returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        return slidingWindow.frame(blockNumber);
    }

    function safeFrame(
        uint256 blockNumber
    ) public view returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        return slidingWindow.safeFrame(blockNumber);
    }

    function calculateEpochAndSlot(uint256 blockNumber) public view returns (uint256 epoch, uint8 slot) {
        return slidingWindow.calculateEpochAndSlot(blockNumber);
    }

    function getBlocksPerEpoch() public view returns (uint40) {
        return slidingWindow.getBlocksPerEpoch();
    }

    function getBlocksPerSlot() public view returns (uint40) {
        return slidingWindow.getBlocksPerSlot();
    }

    function getFrameSizeInBlockLength() public view returns (uint40) {
        return slidingWindow.getFrameSizeInBlockLength();
    }

    function getSlotsPerEpoch() public view returns (uint8) {
        return slidingWindow.getSlotsPerEpoch();
    }
}
