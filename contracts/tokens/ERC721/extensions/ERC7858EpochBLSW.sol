// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC721EXP using Block-Height-Based Lazy Sliding Window (BLSW) Algorithm.
 * @author Kiwari Labs
 */

import {AbstractBLSW as BLSW} from "../../../abstracts/AbstractBLSW.sol";
import {ERC7858EpochBase} from "./ERC7858EpochBase.sol";

abstract contract ERC7858EpochBLSW is ERC7858EpochBase, BLSW {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialBlockNumber_,
        uint40 blocksPerEpoch_,
        uint8 windowSize_,
        bool development_
    ) ERC7858EpochBase(name_, symbol_) BLSW(initialBlockNumber_, blocksPerEpoch_, windowSize_, development_) {}

    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.BLOCKS_BASED;
    }

    function epochType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.BLOCKS_BASED;
    }

    function _getEpoch(uint256 pointer) internal view virtual override returns (uint256) {
        return _epoch(pointer);
    }

    function _getWindowRage(uint256 pointer) internal view virtual override returns (uint256 fromEpoch, uint256 toEpoch) {
        return _windowRage(pointer);
    }

    function _getWindowSize() internal view virtual override returns (uint8) {
        return _windowSize();
    }

    function _getPointersInEpoch() internal view virtual override returns (uint40) {
        return _blocksInEpoch();
    }

    function _getPointersInWindow() internal view virtual override returns (uint40) {
        return _blocksInWindow();
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return _blockNumberProvider();
    }
}
