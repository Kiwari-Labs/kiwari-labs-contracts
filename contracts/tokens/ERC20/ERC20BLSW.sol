// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {AbstractBLSW as BLSW} from "../../abstracts/AbstractBLSW.sol";
import {ERC20EXPBase} from "./ERC20EXPBase.sol";
import {IERC7818} from "./interfaces/IERC7818.sol";

/**
 * @title ERC20EXP using Block-Height-Based Lazy Sliding Window (BLSW) Algorithm.
 * @author Kiwari Labs
 */

abstract contract ERC20BLSW is IERC7818, ERC20EXPBase, BLSW {
    /**
     * @notice Constructor function to initialize the token contract with specified parameters.
     * @dev Initializes the token contract by setting the name, symbol, and initializing the sliding window parameters.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param initialBlockNumber_ The initial block number.
     * @param blocksPerEpoch_ The blocks per epoch.
     * @param windowSize_ The window size.
     * @param development_ The development mode flag.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialBlockNumber_,
        uint40 blocksPerEpoch_,
        uint8 windowSize_,
        bool development_
    ) ERC20EXPBase(name_, symbol_) BLSW(initialBlockNumber_, blocksPerEpoch_, windowSize_, development_) {}

    function _getInitialPointer() internal view virtual override returns (uint256) {
        return _getInitialBlockNumber();
    }

    function _epochType() internal pure virtual override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
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
