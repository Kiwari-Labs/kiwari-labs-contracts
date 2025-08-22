// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC20EXP using Timestamp-Based Lazy Sliding Window (TLSW) Algorithm.
 * @author Kiwari Labs
 */

import {ERC20EXPBase} from "./ERC20EXPBase.sol";
import {IERC7818} from "./interfaces/IERC7818.sol";

abstract contract ERC20TLSW is IERC7818, ERC20EXPBase {
    /**
     * @notice Constructor function to initialize the token contract with specified parameters.
     * @dev Initializes the token contract by setting the name, symbol, and initializing the sliding window parameters.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param initialBlockTimestamp_ The initial block timestamp.
     * @param secondsPerEpoch_ The seconds per epoch.
     * @param windowSize_ The window size.
     * @param development_ The development mode flag.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialBlockTimestamp_,
        uint40 secondsPerEpoch_,
        uint8 windowSize_,
        bool development_
    ) ERC20EXPBase(name_, symbol_, initialBlockTimestamp_, secondsPerEpoch_, windowSize_, development_) {}

    function epochType() public pure virtual override(ERC20EXPBase, IERC7818) returns (EPOCH_TYPE) {
        return EPOCH_TYPE.TIME_BASED;
    }

    function _pointerProvider() internal view virtual override(ERC20EXPBase) returns (uint256) {
        return block.timestamp;
    }
}
