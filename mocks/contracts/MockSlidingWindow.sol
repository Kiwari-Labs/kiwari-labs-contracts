// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/libraries/SlidingWindow.sol";

contract MockSlidingWindow {
    using SlidingWindow for SlidingWindow.SlidingWindowState;
    SlidingWindow.SlidingWindowState public slidingWindow;

    constructor(uint256 startBlockNumber, uint16 blockPeriod, uint8 frameSize, uint8 slotSize) {
        slidingWindow._startBlockNumber = startBlockNumber != 0 ? startBlockNumber : block.number;
        slidingWindow.updateSlidingWindow(blockPeriod, frameSize, slotSize);
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

    function getSlotPerEra() public view returns (uint8) {
        return slidingWindow.getSlotPerEra();
    }
}
