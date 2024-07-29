// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/abstracts/SlidingWindow.sol";

contract MockSlidingWindow is SlidingWindow {
    constructor(
        uint256 startBlockNumber,
        uint16 blockPeriod,
        uint8 frameSize,
        uint8 slotSize
    ) SlidingWindow(startBlockNumber, blockPeriod, frameSize, slotSize) {}

    function updateWindow(uint24 blockTime, uint8 frameSize, uint8 slotSize) public {
        _updateSlidingWindow(blockTime, frameSize, slotSize);
    }

    function frame(
        uint256 blockNumber
    ) public view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _frame(blockNumber);
    }

    function safeFrame(
        uint256 blockNumber
    ) public view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _safeFrame(blockNumber);
    }

    function calculateEraAndSlot(uint256 blockNumber) public view returns (uint256 era, uint8 slot) {
        return _calculateEraAndSlot(blockNumber);
    }
}
