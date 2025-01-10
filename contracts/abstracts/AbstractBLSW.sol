// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title Abstract Lazy Sliding Window
/// @author Kiwari Labs

import {BLSW as slide} from "../utils/algorithms/BLSW.sol";

abstract contract AbstractBLSW {
    using slide for slide.Window;

    slide.Window private _window;

    constructor(uint256 initialBlockNumber, uint40 blocksPerEpoch_, uint8 windowSize_, bool safe_) {
        _window.initializedBlock(initialBlockNumber != 0 ? initialBlockNumber : _blockNumberProvider());
        _updateSlidingWindow(blocksPerEpoch_, windowSize_, safe_);
    }

    /// @notice for support both Layer 1 (L1) and Layer 2 (L2) networks.
    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number; // default
    }

    function _updateSlidingWindow(uint40 blocksPerEpoch, uint8 windowSize, bool safe) internal {
        _window.initializedState(blocksPerEpoch, windowSize, safe);
        // emit
    }

    function _epoch(uint256 blockNumber) internal view returns (uint256) {
        return _window.epoch(blockNumber);
    }

    function _windowRage(uint256 blockNumber) internal view returns (uint256, uint256) {
        return _window.windowRange(blockNumber);
    }

    function _safeWindowRange(uint256 blockNumber) internal view returns (uint256, uint256) {
        return _window.safeWindowRange(blockNumber);
    }

    function _windowSize() internal view returns (uint8) {
        return _window.windowSize();
    }

    function _blocksInEpoch() internal view returns (uint40) {
        return _window.blocksInEpoch();
    }

    function _blocksInWindow() internal view returns (uint40) {
        return _window.blocksInWindow();
    }
}
