// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC1155EXP Base abstract contract
/// @author Kiwari Labs

import {SlidingWindow} from "../../abstracts/SlidingWindow.sol";
import {SortedCircularDoublyLinkedList as SCDLL} from "../../utils/LightWeightSortedCircularDoublyLinkedList.sol";
import {IERC1155EXPBase} from "../../interfaces/IERC1155EXPBase.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

/// @notice First-In-First-Out (FIFO) may not be necessary for non-fungible tokens (NFTs) in ERC1155 contracts.
///         Since NFTs are always unique with a balance of 1, tracking expiration or balances based on FIFO is less relevant.
///         However, FIFO method can still be useful for managing fungible tokens within the same contract.

abstract contract ERC1155EXPBase is IERC1155, IERC1155EXPBase, IERC1155MetadataURI, SlidingWindow {
    using SCDLL for SCDLL.List;

    struct Slot {
        uint256 slotBalance;
        mapping(uint256 blockNumber => uint256 balance) blockBalances;
        SCDLL.List list;
    }

    mapping(uint256 id => mapping(address account => mapping(uint256 era => mapping(uint8 slot => Slot))))
        private _balances;
    mapping(address account => mapping(address operator => bool)) private _operatorApprovals;

    /// @notice Constructor function to initialize the token contract with specified parameters.
    /// @dev Initializes the token contract by setting the name, symbol, and initializing the sliding window parameters.
    /// @param blockNumber_ The starting block number for the sliding window.
    /// @param blockTime_ The duration of each block in milliseconds..
    constructor(
        uint256 blockNumber_,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) SlidingWindow(blockNumber_, blockTime_, frameSize_, slotSize_) {}

    // @TODO finish other method
}
