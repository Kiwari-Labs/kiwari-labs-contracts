// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC1155EXP Base abstract contract
/// @author Kiwari Labs

import {SlidingWindow as Slide} from "../../utils/SlidingWindow.sol";
import {SortedCircularDoublyLinkedList as SCDLL} from "../../utils/LightWeightSortedCircularDoublyLinkedList.sol";
import {IERC1155EXPBase} from "./IERC1155EXPBase.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";
import {Arrays} from "@openzeppelin/contracts/utils/Arrays.sol";
import {IERC165, ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import {ERC1155Utils} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Utils.sol";

/// @notice First-In-First-Out (FIFO) may not be necessary for Non-Fungible Tokens (NFTs) in ERC1155 contracts.
///         Since NFTs are always unique with a balance of 1, tracking expiration or balances based on FIFO is less relevant.
///         However, FIFO method can still be useful for managing Fungible Tokens within the same contract.

abstract contract ERC1155EXPBase is Context, ERC165, IERC1155, IERC1155Errors, IERC1155EXPBase, IERC1155MetadataURI {
    using Arrays for uint256[];
    using Arrays for address[];
    using SCDLL for SCDLL.List;
    using Slide for Slide.SlidingWindowState;

    struct Slot {
        uint256 slotBalance;
        mapping(uint256 blockNumber => uint256 balance) blockBalances;
        SCDLL.List list;
    }

    uint8 private DEFAULT_FRAME_SIZE;
    uint8 private DEFAULT_SLOT_SIZE;
    uint24 private BLOCK_TIME; // shared blocktime configuration for all tokenIds
    string private _uri;

    /// @notice Constructor function to initialize the token contract with specified parameters.
    /// @dev Initializes the token contract by setting the name, symbol.
    constructor(string memory uri_, uint24 blocktime_) {
        _setURI(uri_);
        _setBlockTime(blocktime_);
        // _setBaseExpirationPeriod(blockTime_, frameSize_, slotSize_);
    }

    mapping(uint256 id => mapping(address account => mapping(uint256 epoch => mapping(uint8 slot => Slot))))
        private _balances;
    mapping(uint256 id => Slide.SlidingWindowState) private _slidingWindowTokens;
    mapping(uint256 blockNumber => mapping(uint256 id => uint256 balance)) private _worldBlockBalances;
    // initialized default expired period if use _mint(to , id, value, data)
    // passing config when mint with _mint(to, id, value, data, config)

    mapping(address account => mapping(address operator => bool)) private _operatorApprovals;

    function _setURI(string memory newuri) internal virtual {
        _uri = newuri;
    }

    function _setBlockTime(uint24 newblocktime) internal virtual {
        BLOCK_TIME = newblocktime;
    }

    function _setBaseExpirationPeriod(uint24 blockTime, uint8 frameSize, uint8 slotSize) internal {
        // Perform check min/max blocktime
        // Perform check min/max frameSize
        // Perform check min/max slotSize
        BLOCK_TIME = blockTime;
        DEFAULT_FRAME_SIZE = frameSize;
        DEFAULT_SLOT_SIZE = slotSize;
        // emit BaseExpirationPeriod(frameSize, slotSize);
    }

    function _setExpirationPeriodOfToken(uint256 id, uint8 frameSize, uint8 slotSize) internal {
        // Perform check min/max frameSize
        // Perform check min/max slotSize
        // _slidingWindowTokens[id] = frameSize;
        // _slidingWindowTokens[id] = slotSize;
        // emit ExpirationPeriod(id, frameSize, slotSize);
    }

    function _setStartBlockOfToken(uint256 id, uint256 blockNumber) internal {
        // Peform check
        // _slidingWindowTokens[id].updateSlidingWindow(BLOCK_TIME, frameSize, slotSize);
        // emit StartSlidingToken(id);
    }

    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number;
    }

    // @TODO
    function _updateSlingWindowOfId(uint256 id) internal {
        // Perform check is id start or not
        if (_slidingWindowTokens[id].startBlockNumber == 0) {
            // @TODO init slidng window state
            // if (params) {
            // init config sliding window state
            // } else {
            // default config sliding window state
            // }
        }
    }

    function _bufferSlotBalance(
        uint256 id,
        address account,
        uint256 epoch,
        uint8 slot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        Slot storage _spender = _balances[id][account][epoch][slot];
        uint256 key = _locateUnexpiredBlockBalance(
            _spender.list,
            blockNumber,
            _slidingWindowTokens[id].getFrameSizeInBlockLength()
        );
        while (key > 0) {
            unchecked {
                balance += _spender.blockBalances[key];
            }
            key = _spender.list.next(key);
        }
    }

    function _slotBalance(
        uint256 id,
        address account,
        uint256 epoch,
        uint8 startSlot,
        uint8 endSlot
    ) private view returns (uint256 balance) {
        unchecked {
            for (; startSlot <= endSlot; startSlot++) {
                balance += _balances[id][account][epoch][startSlot].slotBalance;
            }
        }
        return balance;
    }

    function _lookBackBalance(
        uint256 id,
        address account,
        uint256 fromEpoch,
        uint256 toEpoch,
        uint8 fromSlot,
        uint8 toSlot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        unchecked {
            balance = _bufferSlotBalance(id, account, fromEpoch, fromSlot, blockNumber);
            // Go to the next slot. Increase the epoch if the slot is over the limit.
            uint8 slotSizeCache = _slidingWindowTokens[id].getSlotsPerEpoch();
            fromSlot = (fromSlot + 1) % slotSizeCache;
            if (fromSlot == 0) {
                fromEpoch++;
            }

            // It is not possible if the fromEpoch is more than toEpoch.
            if (fromEpoch == toEpoch) {
                balance += _slotBalance(id, account, fromEpoch, fromSlot, toSlot);
            } else {
                // Keep it simple stupid first by spliting into 3 part then sum.
                // Part1: calulate balance at fromEpoch in naive in naive way O(n)
                uint8 maxSlotCache = slotSizeCache - 1;
                balance += _slotBalance(id, account, fromEpoch, fromSlot, maxSlotCache);
                // Part2: calulate balance betaween fromEpoch and toEpoch in naive way O(n)
                for (uint256 epoch = fromEpoch + 1; epoch < toEpoch; epoch++) {
                    balance += _slotBalance(id, account, epoch, 0, maxSlotCache);
                }
                // Part3:calulate balance at toEpoch in navie way O(n)
                balance += _slotBalance(id, account, toEpoch, 0, toSlot);
            }
        }
    }

    function _locateUnexpiredBlockBalance(
        SCDLL.List storage list,
        uint256 blockNumber,
        uint256 expirationPeriodInBlockLength
    ) internal view returns (uint256 key) {
        key = list.head();
        unchecked {
            while (blockNumber - key >= expirationPeriodInBlockLength) {
                if (key == 0) {
                    break;
                }
                key = list.next(key);
            }
        }
    }

    /// @custom:gas-inefficiency update balance
    /// transfer Non-Fungible Token in batch take less gasUsed compared to transfer Fungible Token in batch
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values) internal virtual {
        if (ids.length != values.length) {
            revert ERC1155InvalidArrayLength(ids.length, values.length);
        }

        address operator = _msgSender();

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids.unsafeMemoryAccess(i);
            // @TODO uncommented _updateSlingWindowOfId(id);
            uint256 value = values.unsafeMemoryAccess(i);
            uint256 blockNumberCache = _blockNumberProvider();
            uint256 blockLengthCache = _slidingWindowTokens[id].getFrameSizeInBlockLength();
            uint8 slotSizeCache = _slidingWindowTokens[id].getSlotsPerEpoch();

            (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) = _slidingWindowTokens[id].frame(
                blockNumberCache
            );

            if (from == address(0)) {
                // Mint token.
                Slot storage _recipient = _balances[id][to][toEpoch][toSlot];
                unchecked {
                    _recipient.slotBalance += value;
                    _recipient.blockBalances[blockNumberCache] += value;
                }
                _recipient.list.insert(blockNumberCache);
                _worldBlockBalances[blockNumberCache][id] += value;
            } else {
                // Burn token.
                uint256 balance = _lookBackBalance(id, from, fromEpoch, toEpoch, fromSlot, toSlot, blockNumberCache);
                if (balance < value) {
                    revert ERC1155InsufficientBalance(from, balance, value, id);
                }

                uint256 pendingValue = value;
                uint256 balanceCache = 0;

                if (to == address(0)) {
                    while ((fromEpoch < toEpoch || (fromEpoch == toEpoch && fromSlot <= toSlot)) && pendingValue > 0) {
                        Slot storage _spender = _balances[id][from][fromEpoch][fromSlot];

                        uint256 key = _locateUnexpiredBlockBalance(_spender.list, blockNumberCache, blockLengthCache);

                        while (key > 0 && pendingValue > 0) {
                            balanceCache = _spender.blockBalances[key];

                            if (balanceCache <= pendingValue) {
                                unchecked {
                                    pendingValue -= balanceCache;
                                    _spender.slotBalance -= balanceCache;
                                    _spender.blockBalances[key] -= balanceCache;
                                    _worldBlockBalances[key][id] -= balanceCache;
                                }
                                key = _spender.list.next(key);
                                _spender.list.remove(_spender.list.previous(key));
                            } else {
                                unchecked {
                                    _spender.slotBalance -= pendingValue;
                                    _spender.blockBalances[key] -= pendingValue;
                                    _worldBlockBalances[key][id] -= pendingValue;
                                }
                                pendingValue = 0;
                            }
                        }

                        // Go to the next slot. Increase the epoch if the slot is over the limit.
                        if (pendingValue > 0) {
                            unchecked {
                                fromSlot = (fromSlot + 1) % slotSizeCache;
                                if (fromSlot == 0) {
                                    fromEpoch++;
                                }
                            }
                        }
                    }
                } else {
                    // Transfer token.
                    while ((fromEpoch < toEpoch || (fromEpoch == toEpoch && fromSlot <= toSlot)) && pendingValue > 0) {
                        Slot storage _spender = _balances[id][from][fromEpoch][fromSlot];
                        Slot storage _recipient = _balances[id][to][fromEpoch][fromSlot];

                        uint256 key = _locateUnexpiredBlockBalance(_spender.list, blockNumberCache, blockLengthCache);

                        while (key > 0 && pendingValue > 0) {
                            balanceCache = _spender.blockBalances[key];

                            if (balanceCache <= pendingValue) {
                                unchecked {
                                    pendingValue -= balanceCache;
                                    _spender.slotBalance -= balanceCache;
                                    _spender.blockBalances[key] -= balanceCache;

                                    _recipient.slotBalance += balanceCache;
                                    _recipient.blockBalances[key] += balanceCache;
                                    _recipient.list.insert(key);
                                }
                                key = _spender.list.next(key);
                                _spender.list.remove(_spender.list.previous(key));
                            } else {
                                unchecked {
                                    _spender.slotBalance -= pendingValue;
                                    _spender.blockBalances[key] -= pendingValue;

                                    _recipient.slotBalance += pendingValue;
                                    _recipient.blockBalances[key] += pendingValue;
                                }
                                _recipient.list.insert(key);
                                pendingValue = 0;
                            }
                        }

                        // Go to the next slot. Increase the epoch if the slot is over the limit.
                        if (pendingValue > 0) {
                            unchecked {
                                fromSlot = (fromSlot + 1) % slotSizeCache;
                                if (fromSlot == 0) {
                                    fromEpoch++;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (ids.length == 1) {
            uint256 id = ids.unsafeMemoryAccess(0);
            uint256 value = values.unsafeMemoryAccess(0);
            emit TransferSingle(operator, from, to, id, value);
        } else {
            emit TransferBatch(operator, from, to, ids, values);
        }
    }

    function _updateWithAcceptanceCheck(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) internal virtual {
        _update(from, to, ids, values);
        if (to != address(0)) {
            address operator = _msgSender();
            if (ids.length == 1) {
                uint256 id = ids.unsafeMemoryAccess(0);
                uint256 value = values.unsafeMemoryAccess(0);
                ERC1155Utils.checkOnERC1155Received(operator, from, to, id, value, data);
            } else {
                ERC1155Utils.checkOnERC1155BatchReceived(operator, from, to, ids, values, data);
            }
        }
    }

    function _safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) internal {
        if (to == address(0)) {
            revert ERC1155InvalidReceiver(address(0));
        }
        if (from == address(0)) {
            revert ERC1155InvalidSender(address(0));
        }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(from, to, ids, values, data);
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) internal {
        if (to == address(0)) {
            revert ERC1155InvalidReceiver(address(0));
        }
        if (from == address(0)) {
            revert ERC1155InvalidSender(address(0));
        }
        _updateWithAcceptanceCheck(from, to, ids, values, data);
    }

    function _mint(address to, uint256 id, uint256 value, bytes memory data) internal {
        if (to == address(0)) {
            revert ERC1155InvalidReceiver(address(0));
        }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(address(0), to, ids, values, data);
    }

    function _mintBatch(address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal {
        if (to == address(0)) {
            revert ERC1155InvalidReceiver(address(0));
        }
        _updateWithAcceptanceCheck(address(0), to, ids, values, data);
    }

    function _burn(address from, uint256 id, uint256 value) internal {
        if (from == address(0)) {
            revert ERC1155InvalidSender(address(0));
        }
        (uint256[] memory ids, uint256[] memory values) = _asSingletonArrays(id, value);
        _updateWithAcceptanceCheck(from, address(0), ids, values, "");
    }

    function _burnBatch(address from, uint256[] memory ids, uint256[] memory values) internal {
        if (from == address(0)) {
            revert ERC1155InvalidSender(address(0));
        }
        _updateWithAcceptanceCheck(from, address(0), ids, values, "");
    }

    function _setApprovalForAll(address owner, address operator, bool approved) internal virtual {
        if (operator == address(0)) {
            revert ERC1155InvalidOperator(address(0));
        }
        _operatorApprovals[owner][operator] = approved;
        emit ApprovalForAll(owner, operator, approved);
    }

    function _asSingletonArrays(
        uint256 element1,
        uint256 element2
    ) private pure returns (uint256[] memory array1, uint256[] memory array2) {
        assembly ("memory-safe") {
            // Load the free memory pointer
            array1 := mload(0x40)
            // Set array length to 1
            mstore(array1, 1)
            // Store the single element at the next word after the length (where content starts)
            mstore(add(array1, 0x20), element1)

            // Repeat for next array locating it right after the first array
            array2 := add(array1, 0x40)
            mstore(array2, 1)
            mstore(add(array2, 0x20), element2)

            // Update the free memory pointer by pointing after the second array
            mstore(0x40, add(array2, 0x40))
        }
    }

    function _slotOf(
        uint256 id,
        address account,
        uint256 fromEpoch,
        uint8 fromSlot
    ) internal view returns (Slot storage) {
        return _balances[id][account][fromEpoch][fromSlot];
    }

    function balanceOf(address account, uint256 id) public view virtual returns (uint256) {
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 fromEpoch, uint256 toEpoch, uint8 fromSlot, uint8 toSlot) = _slidingWindowTokens[id].frame(
            blockNumberCache
        );
        return _lookBackBalance(id, account, fromEpoch, toEpoch, fromSlot, toSlot, blockNumberCache);
    }

    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    ) public view virtual returns (uint256[] memory) {
        if (accounts.length != ids.length) {
            revert ERC1155InvalidArrayLength(ids.length, accounts.length);
        }

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts.unsafeMemoryAccess(i), ids.unsafeMemoryAccess(i));
        }

        return batchBalances;
    }

    function setApprovalForAll(address operator, bool approved) public virtual {
        _setApprovalForAll(_msgSender(), operator, approved);
    }

    function isApprovedForAll(address account, address operator) public view virtual returns (bool) {
        return _operatorApprovals[account][operator];
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes memory data) public virtual {
        address sender = _msgSender();
        if (from != sender && !isApprovedForAll(from, sender)) {
            revert ERC1155MissingApprovalForAll(sender, from);
        }
        _safeTransferFrom(from, to, id, value, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values,
        bytes memory data
    ) public virtual {
        address sender = _msgSender();
        if (from != sender && !isApprovedForAll(from, sender)) {
            revert ERC1155MissingApprovalForAll(sender, from);
        }
        _safeBatchTransferFrom(from, to, ids, values, data);
    }
}
