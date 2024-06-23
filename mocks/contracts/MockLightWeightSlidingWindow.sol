// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/libraries/LightWeightSlidingWindow.sol";

contract MockLighWeightSlidingWindow {
    SlidingWindow.SlidingWindowState public slidingWindow;

    constructor(uint16 blockPeriod, uint8 frameSize) {
        slidingWindow._startBlockNumber = block.number;
        SlidingWindow.updateSlidingWindow(slidingWindow, blockPeriod, frameSize);
    }

    // @TODO adding test case.
}
