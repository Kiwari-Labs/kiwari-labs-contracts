// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import {BLSW as LSW} from "../../../contracts/utils/algorithms/BLSW.sol";

contract MockBLSW {
    using LSW for LSW.SlidingWindowState;
    LSW.SlidingWindowState public state;

    constructor(uint256 startBlockNumber, uint40 blockPeriod, uint8 frameSize) {
        state.initializedBlock(startBlockNumber != 0 ? startBlockNumber : block.number);
        state.initializedState(blockPeriod, frameSize, false);
    }

    function updateWindow(uint40 blockTime, uint8 windowSize, bool development) public {
        state.initializedState(blockTime, windowSize, development);
    }

    function window(uint256 blockNumber) public view returns (uint256, uint256) {
        return state.windowRange(blockNumber);
    }

    function safeWindow(uint256 blockNumber) public view returns (uint256, uint256) {
        return state.safeWindowRange(blockNumber);
    }

    function epoch(uint256 blockNumber) public view returns (uint256) {
        return state.epoch(blockNumber);
    }

    function blocksInEpoch() public view returns (uint40) {
        return state.blocksInEpoch();
    }

    function blocksInWindow() public view returns (uint40) {
        return state.blocksInWindow();
    }
}
