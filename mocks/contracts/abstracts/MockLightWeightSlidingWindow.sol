// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/abstracts/LightWeightSlidingWindow.sol";

contract MockLightWeightSlidingWindow is SlidingWindow {
    constructor(
        uint256 startBlockNumber,
        uint16 blockPeriod,
        uint8 frameSize
    ) SlidingWindow(startBlockNumber, blockPeriod, frameSize) {}

    function updateWindow(uint24 blockTime, uint8 frameSize) public {
        _updateSlidingWindow(blockTime, frameSize);
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
