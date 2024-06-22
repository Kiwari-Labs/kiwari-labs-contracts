// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/libraries/SlidingWindow.sol";

contract MockSlidingWindow {
    SlidingWindow.SlidingWindowState public slidingWindow;

    constructor(uint16 blockPeriod, uint8 frameSize, uint8 slotSize) {
        slidingWindow._startBlockNumber = block.number;
        SlidingWindow.updateSlidingWindow(slidingWindow, blockPeriod, frameSize, slotSize);
    }

    // @TODO adding test case.
}
