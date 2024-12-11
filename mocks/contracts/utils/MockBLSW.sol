// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import {BLSW as LSW} from "../../../contracts/utils/algorithms/BLSW.sol";

contract MockBLSW {
    using LSW for LSW.Window;
    LSW.Window public window;

    constructor(uint256 startBlockNumber, uint40 blockTime, uint8 windowSize, bool safe) {
        window.initializedBlock(startBlockNumber != 0 ? startBlockNumber : block.number);
        window.initializedState(blockTime, windowSize, safe);
    }

    function updateWindow(uint40 blockTime, uint8 windowSize, bool safe) public {
        window.initializedState(blockTime, windowSize, safe);
    }

    function windowRange(uint256 blockNumber) public view returns (uint256, uint256) {
        return window.windowRange(blockNumber);
    }

    function windowSize() public view returns (uint8) {
        return window.windowSize();
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
