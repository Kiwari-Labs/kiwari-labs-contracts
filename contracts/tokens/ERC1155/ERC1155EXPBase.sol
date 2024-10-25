// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC1155EXP Base abstract contract
/// @author Kiwari Labs

import {SlidingWindow as Slide} from "../../utils/SlidingWindow.sol";
import {SortedCircularDoublyLinkedList as SCDLL} from "../../utils/LightWeightSortedCircularDoublyLinkedList.sol";
import {IERC1155EXPBase} from "./IERC1155EXPBase.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

/// @notice First-In-First-Out (FIFO) may not be necessary for non-fungible tokens (NFTs) in ERC1155 contracts.
///         Since NFTs are always unique with a balance of 1, tracking expiration or balances based on FIFO is less relevant.
///         However, FIFO method can still be useful for managing fungible tokens within the same contract.

abstract contract ERC1155EXPBase is IERC1155, IERC1155EXPBase, IERC1155MetadataURI {
    using SCDLL for SCDLL.List;
    using Slide for Slide.SlidingWindowState;

    struct Slot {
        uint256 slotBalance;
        mapping(uint256 blockNumber => uint256 balance) blockBalances;
        SCDLL.List list;
    }

    uint24 private BLOCK_TIME; // shared blocktime configuration for all tokenIds

    mapping(uint256 id => mapping(address account => mapping(uint256 era => mapping(uint8 slot => Slot))))
        private _balances;
    mapping(uint256 id => Slide.SlidingWindowState) private _slidingWindowTokens;
    // initialized default expired period if use _mint(to , id, value, data)
    // passing config when mint with _mint(to, id, value, data)

    mapping(address account => mapping(address operator => bool)) private _operatorApprovals;

    /// @notice Constructor function to initialize the token contract with specified parameters.
    /// @dev Initializes the token contract by setting the name, symbol.
    constructor() {
        // initialized contract for default configuration for all token that not pass config.
    }

    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number;
    }

    // @TODO finish other method
    /// @custom:gas-inefficiency balanceOf(accounts, ids)
    /// @custom:gas-inefficiency _safeBatchTransferFrom(from, to, ids, values, data)
    /// @custom:gas-inefficiency _mintBatch(to, ids, values, data)
    /// @custom:gas-inefficiency _burnBatch(from, ids, values)
}
