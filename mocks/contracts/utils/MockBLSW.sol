// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import {BLSW as LSW} from "../../../contracts/utils/algorithms/BLSW.sol";

contract MockBLSW {
    using LSW for LSW.SlidingWindowState;
    LSW.SlidingWindowState public slidingWindow;

    constructor(uint256 startBlockNumber, uint40 blockPeriod, uint8 frameSize) {
        slidingWindow.initializedBlock(startBlockNumber != 0 ? startBlockNumber : block.number);
        slidingWindow.initializedState(blockPeriod, frameSize, false);
    }

    function updateWindow(uint40 blockTime, uint8 windowSize, bool development) public {
        slidingWindow.initializedState(blockTime, windowSize, development);
    }

    function frame(uint256 blockNumber) public view returns (uint256 from, uint256 to) {
        return slidingWindow.windowRange(blockNumber);
    }

    function safeFrame(uint256 blockNumber) public view returns (uint256 from, uint256 to) {
        return slidingWindow.safeWindowRange(blockNumber);
    }

    function calculateEpoch(uint256 blockNumber) public view returns (uint256 epoch) {
        return slidingWindow.getCurrentEpoch(blockNumber);
    }

    function getBlocksPerEpoch() public view returns (uint40) {
        return slidingWindow.blocksInEpoch();
    }

    function getFrameSizeInBlockLength() public view returns (uint40) {
        return slidingWindow.blocksInWindow();
    }
}
