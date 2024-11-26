// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/utils/LightWeightSlidingWindow.sol";

contract MockLightWeightSlidingWindowLibrary {
    using SlidingWindow for SlidingWindow.SlidingWindowState;
    SlidingWindow.SlidingWindowState public slidingWindow;

    constructor(uint256 startBlockNumber, uint16 blockPeriod, uint8 frameSize) {
        slidingWindow._startBlockNumber = startBlockNumber != 0 ? startBlockNumber : block.number;
        slidingWindow.updateSlidingWindow(blockPeriod, frameSize);
    }

    function updateWindow(uint24 blockTime, uint8 frameSize) public {
        slidingWindow.updateSlidingWindow(blockTime, frameSize);
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

    function getBlockPerEpoch() public view returns (uint40) {
        return slidingWindow.getBlockPerEpoch();
    }

    function getBlockPerSlot() public view returns (uint40) {
        return slidingWindow.getBlockPerSlot();
    }

    function getFrameSizeInBlockLength() public view returns (uint40) {
        return slidingWindow.getFrameSizeInBlockLength();
    }

    function getSlotPerEpoch() public pure returns (uint8) {
        return SlidingWindow.getSlotPerEpoch();
    }
}
