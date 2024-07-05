// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/libraries/LightWeightSlidingWindow.sol";

contract MockLightWeightSlidingWindow {
    using SlidingWindow for SlidingWindow.SlidingWindowState;
    SlidingWindow.SlidingWindowState public slidingWindow;

    constructor(uint256 startBlockNumber, uint16 blockPeriod, uint8 frameSize) {
        slidingWindow._startBlockNumber = startBlockNumber != 0 ? startBlockNumber : block.number;
        slidingWindow.updateSlidingWindow(blockPeriod, frameSize);
    }

    function updateWindow(uint24 blockTime, uint8 frameSize) public {
        slidingWindow.updateSlidingWindow(blockTime, frameSize);
    }

    function setStartBlock(uint256 startBlock) public {
        slidingWindow._startBlockNumber = startBlock;
    }

    function frame(
        uint256 blockNumber
    ) public view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return slidingWindow.frame(blockNumber);
    }

    function safeFrame(
        uint256 blockNumber
    ) public view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return slidingWindow.safeFrame(blockNumber);
    }

    function calculateEraAndSlot(uint256 blockNumber) public view returns (uint256 era, uint8 slot) {
        return slidingWindow.calculateEraAndSlot(blockNumber);
    }

    function getBlockPerEra() public view returns (uint40) {
        return slidingWindow.getBlockPerEra();
    }

    function getBlockPerSlot() public view returns (uint40) {
        return slidingWindow.getBlockPerSlot();
    }

    function getFrameSizeInBlockLength() public view returns (uint40) {
        return slidingWindow.getFrameSizeInBlockLength();
    }

    function getFrameSizeInEraLength() public view returns (uint8) {
        return slidingWindow.getFrameSizeInEraLength();
    }

    function getFrameSizeInSlotLength() public view returns (uint8) {
        return slidingWindow.getFrameSizeInSlotLength();
    }

    function getFrameSizeInEraAndSlotLength() public view returns (uint8[2] memory) {
        return slidingWindow.getFrameSizeInEraAndSlotLength();
    }

    function getSlotPerEra() public pure returns (uint8) {
        return SlidingWindow.getSlotPerEra();
    }
}
