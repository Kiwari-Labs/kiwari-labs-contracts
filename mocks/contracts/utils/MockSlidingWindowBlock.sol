// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import {SlidingWindow} from "../../../contracts/utils/algorithms/SlidingWindow.sol";

contract MockSlidingWindowBlock {
    using SlidingWindow for SlidingWindow.Window;
    SlidingWindow.Window public window;

    constructor(uint256 startBlockNumber_, uint40 blocksPerEpoch_, uint8 windowSize_, bool safe_) {
        window.setup(startBlockNumber_ != 0 ? startBlockNumber_ : block.number, blocksPerEpoch_, windowSize_, safe_);
    }

    function updateWindow(uint40 blocksPerEpoch, uint8 windowSize, bool safe) public {
        window.setup(window.initValue(), blocksPerEpoch, windowSize, safe);
    }

    function getInitValue() public view returns (uint256) {
        return window.initValue();
    }

    function windowRange(uint256 blockNumber) public view returns (uint256, uint256) {
        return window.indexRange(blockNumber);
    }

    function windowSize() public view returns (uint8) {
        return window.size();
    }

    function epoch(uint256 blockNumber) public view returns (uint256) {
        return window.indexFor(blockNumber);
    }

    function blocksInEpoch() public view returns (uint256) {
        return window.duration();
    }

    function blocksInWindow() public view returns (uint256) {
        return window.duration() * window.size();
    }
}
