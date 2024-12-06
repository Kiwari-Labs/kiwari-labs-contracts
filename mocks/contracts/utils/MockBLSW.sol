// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import {BLSW as LSW} from "../../../contracts/utils/algorithms/BLSW.sol";

contract MockBLSW {
    using LSW for LSW.Window;
    LSW.Window public window;

    constructor(uint256 startBlockNumber, uint40 blockPeriod, uint8 frameSize) {
        window.initializedBlock(startBlockNumber != 0 ? startBlockNumber : block.number);
        window.initializedState(blockPeriod, frameSize, false);
    }

    function updateWindow(uint40 blockTime, uint8 windowSize, bool development) public {
        window.initializedState(blockTime, windowSize, development);
    }

    function windowRange(uint256 blockNumber) public view returns (uint256, uint256) {
        return window.windowRange(blockNumber);
    }

    function safeWindowRange(uint256 blockNumber) public view returns (uint256, uint256) {
        return window.safeWindowRange(blockNumber);
    }

    function epoch(uint256 blockNumber) public view returns (uint256) {
        return window.epoch(blockNumber);
    }

    function blocksInEpoch() public view returns (uint40) {
        return window.blocksInEpoch();
    }

    function blocksInWindow() public view returns (uint40) {
        return window.blocksInWindow();
    }
}
