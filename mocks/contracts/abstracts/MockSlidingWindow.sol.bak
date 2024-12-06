// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/abstracts/SlidingWindow.sol";

contract MockSlidingWindow is SlidingWindow {
    constructor(
        uint256 startBlockNumber,
        uint40 blockPeriod,
        uint8 frameSize,
        uint8 slotSize
    ) SlidingWindow(startBlockNumber, blockPeriod, frameSize, slotSize, false) {}

    function updateWindow(uint40 blockTime, uint8 frameSize, uint8 slotSize, bool development) public {
        _updateSlidingWindow(blockTime, frameSize, slotSize, development);
    }

    function frame(
        uint256 blockNumber
    ) public view returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        return _frame(blockNumber);
    }

    function safeFrame(
        uint256 blockNumber
    ) public view returns (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) {
        return _safeFrame(blockNumber);
    }

    function calculateEpochAndSlot(uint256 blockNumber) public view returns (uint256 epoch, uint8 slot) {
        return _calculateEpochAndSlot(blockNumber);
    }
}
