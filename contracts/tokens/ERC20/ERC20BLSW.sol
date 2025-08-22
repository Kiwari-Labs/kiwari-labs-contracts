// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC20EXP using Block-Height-Based Lazy Sliding Window (BLSW) Algorithm.
 * @author Kiwari Labs
 */

import {ERC20EXPBase} from "./ERC20EXPBase.sol";
import {IERC7818} from "./interfaces/IERC7818.sol";

abstract contract ERC20BLSW is IERC7818, ERC20EXPBase {
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
    ) ERC20EXPBase(name_, symbol_, initialBlockNumber_, blocksPerEpoch_, windowSize_, development_) {}

    function epochType() public pure virtual override(ERC20EXPBase, IERC7818) returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override(ERC20EXPBase) returns (uint256) {
        return block.number;
    }
}
