// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC721EXP using Timestamp-Based Lazy Sliding Window (TLSW) Algorithm.
 * @author Kiwari Labs
 */

import {AbstractTLSW as TLSW} from "../../../abstracts/AbstractTLSW.sol";
import {ERC721EpochBase} from "./ERC721EpochBase.sol";

abstract contract ERC721EpochTLSW is ERC721EpochBase, TLSW {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialBlockTimestamp_,
        uint40 secondsPerEpoch_,
        uint8 windowSize_,
        bool development_
    ) ERC721EpochBase(name_, symbol_) TLSW(initialBlockTimestamp_, secondsPerEpoch_, windowSize_, development_) {}

    function _epochType() internal pure virtual override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.TIME_BASED;
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
        return _secondsInEpoch();
    }

    function _getPointersInWindow() internal view virtual override returns (uint40) {
        return _secondsInWindow();
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return _blockTimestampProvider();
    }
}
