// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP abstract contract
/// @author Kiwari Labs

import "../libraries/SlidingWindow.sol";
import "../libraries/SortedCircularDoublyLinkedList.sol";
import "../interfaces/ISlidingWindow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract ERC20Expirable is ERC20, ISlidingWindow {
    using SortedCircularDoublyLinkedList for SortedCircularDoublyLinkedList.List;
    using SlidingWindow for SlidingWindow.SlidingWindowState;

    /// @notice Struct representing a slot containing balances mapped by blocks.
    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        SortedCircularDoublyLinkedList.List list;
    }

    mapping(address => mapping(uint256 => mapping(uint8 => Slot))) private _balances;

    SlidingWindow.SlidingWindowState private _slidingWindow;

    /// @notice Constructor function to initialize the token contract with specified parameters.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param blockNumber_ The starting block number for the sliding window.
    /// @param blockTime_ The duration of each block in milliseconds..
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 blockNumber_,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) ERC20(name_, symbol_) {
        _slidingWindow._startBlockNumber = blockNumber_;
        _slidingWindow.updateSlidingWindow(blockTime_, frameSize_, slotSize_);
    }

    /// @dev Determines the sliding window frame based on the provided block number.
    /// @notice Allowing for override detector to be the frame or safe frame.
    /// @param blockNumber The block number used as a reference point for computing detector.
    /// @return fromEra The starting era of the detector.
    /// @return toEra The ending era of the detector.
    /// @return fromSlot The starting slot within the starting era of the detector.
    /// @return toSlot The ending slot within the ending era of the detector.
    function _detector(
        uint256 blockNumber
    ) internal view virtual returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _slidingWindow.frame(blockNumber);
    }

    /// @dev Returns the current block number.
    /// @notice ALlowing for override in subsecond blocktime network.
    /// @return The current network block number.
    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number;
    }

    /// @dev Retrieves the total slot balance for the specified account and era,
    /// iterating through the range of slots from startSlot to endSlot inclusive.
    /// @param account The address of the account for which the balance is being queried.
    /// @param era The era (time period) from which to retrieve balances.
    /// @param startSlot The starting slot index within the era to retrieve balances.
    /// @param endSlot The ending slot index within the era to retrieve balances.
    /// @return balance The total balance across the specified slots within the era.
    function _slotBalance(
        address account,
        uint256 era,
        uint8 startSlot,
        uint8 endSlot
    ) private view returns (uint256 balance) {
        unchecked {
            for (; startSlot <= endSlot; startSlot++) {
                balance += _balances[account][era][startSlot].slotBalance;
            }
        }
    }

    /// @dev Calculates the total balance within a specific era and slot for the given account,
    /// considering all block balances that have not expired relative to the current blockNumber.
    /// This function loops through a sorted list of block indices and sums up corresponding balances.
    /// @param account The address of the account for which the balance is being calculated.
    /// @param era The era (time period) from which to retrieve balances.
    /// @param slot The specific slot within the era to retrieve balances.
    /// @param blockNumber The current block number for determining balance validity.
    /// @return balance The total buffered balance within the specified era and slot.
    /// @custom:inefficientgasusedappetite This function can consume significant gas due to potentially
    /// iterating through a large array of block indices.
    function _bufferSlotBalance(
        address account,
        uint256 era,
        uint8 slot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        Slot storage _spender = _balances[account][era][slot];
        uint256 key = _getFirstUnexpiredBlockBalance(
            _spender.list,
            blockNumber,
            _slidingWindow.getFrameSizeInBlockLength()
        );
        while (key > 0) {
            unchecked {
                balance += _spender.blockBalances[key];
            }
            key = _spender.list.next(key);
        }
    }

    /// @dev Finds the first valid block balance index in a sorted list of block numbers.
    /// The index is considered valid if the block number difference between the current blockNumber
    /// and the block number at the index (key) is less than the expirationPeriodInBlockLength.
    /// @param list The sorted circular doubly linked list of block numbers.
    /// @param blockNumber The current block number.
    /// @param expirationPeriodInBlockLength The maximum allowed difference between blockNumber and the key.
    /// @return key The index of the first valid block balance.
    function _getFirstUnexpiredBlockBalance(
        SortedCircularDoublyLinkedList.List storage list,
        uint256 blockNumber,
        uint256 expirationPeriodInBlockLength
    ) private view returns (uint256 key) {
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

    /// @notice Optimized to assume fromEra and fromSlot are already buffered, covering
    /// the gap between fromEra and toEra using slotBalance and summing to balance.
    /// @dev Returns the available balance from the given account, eras, and slots.
    /// @param account The address of the account for which the balance is being queried.
    /// @param fromEra The starting era for the balance lookup.
    /// @param toEra The ending era for the balance lookup.
    /// @param fromSlot The starting slot within the starting era for the balance lookup.
    /// @param toSlot The ending slot within the ending era for the balance lookup.
    /// @param blockNumber The current block number.
    /// @return balance The available balance.
    function _lookBackBalance(
        address account,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        unchecked {
            balance = _bufferSlotBalance(account, fromEra, fromSlot, blockNumber);
            fromSlot = (fromSlot + 1) % _slidingWindow._slotSize;
            if (fromSlot == 0) {
                fromEra++;
            }

            if (fromEra == toEra) {
                balance += _slotBalance(account, fromEra, fromSlot, toSlot);
            } else if (fromEra < toEra) {
                // keep it simple stupid first by spliting into 3 part then sum.
                // part1: calulate balance at fromEra in naive in naive way O(n)
                uint8 maxSlotCache = _slidingWindow._slotSize - 1;
                balance += _slotBalance(account, fromEra, fromSlot, maxSlotCache);
                // part2: calulate balance betaween fromEra and toEra in naive way O(n)
                for (uint256 era = fromEra + 1; era < toEra; era++) {
                    balance += _slotBalance(account, era, 0, maxSlotCache);
                }
                // part3:calulate balance at toEra in navie way O(n)
                balance += _slotBalance(account, toEra, 0, toSlot);
            }
        }
    }

    /// @notice Returns the available balance of tokens for a given account.
    /// @dev Calculates and returns the available balance based on the frame.
    /// @inheritdoc IERC20
    function balanceOf(address account) public view virtual override returns (uint256) {
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _detector(blockNumberCache);
        return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
    }

    function _update(address from, address to, uint256 value) internal virtual override {
        // hook before transfer
        _beforeTokenTransfer(from, to, value);

        uint256 blockNumberCache = _blockNumberProvider();

        if (from == address(0)) {
            // mint expirable token.
            (uint256 currentEra, uint8 currentSlot) = _slidingWindow.calculateEraAndSlot(blockNumberCache);
            Slot storage _recipient = _balances[to][currentEra][currentSlot];
            unchecked {
                _recipient.slotBalance += value;
                _recipient.blockBalances[blockNumberCache] += value;
            }
            _recipient.list.insert(blockNumberCache, (""));
        } else {
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _detector(blockNumberCache);
            uint256 balance = _lookBackBalance(from, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
            if (balance < value) {
                revert ERC20InsufficientBalance(from, balance, value);
            }

            uint256 era = fromEra;
            uint8 slot = fromSlot;

            uint256 pendingValue = value;

            if (to == address(0)) {
                // burn expirable token.
                while ((era < toEra || (era == toEra && slot <= toSlot)) && pendingValue != 0) {
                    Slot storage _spender = _balances[from][era][slot];

                    uint256 key = _getFirstUnexpiredBlockBalance(
                        _spender.list,
                        blockNumberCache,
                        _slidingWindow.getFrameSizeInBlockLength()
                    );

                    unchecked {
                        while (key > 0 && pendingValue != 0) {
                            uint256 blockBalancesCache = _spender.blockBalances[key];
                            if (blockBalancesCache <= pendingValue) {
                                pendingValue -= blockBalancesCache;
                                _spender.slotBalance -= blockBalancesCache;
                                _spender.blockBalances[key] = 0;
                                _spender.list.remove(key);
                            } else {
                                _spender.slotBalance -= pendingValue;
                                _spender.blockBalances[key] -= pendingValue;
                                pendingValue = 0;
                            }

                            key = _spender.list.next(key);
                        }

                        slot = (slot + 1) % _slidingWindow._slotSize;
                        if (slot == 0) {
                            era++;
                        }
                    }
                }
            } else {
                // transfer expirable token.
                while ((era < toEra || (era == toEra && slot <= toSlot)) && pendingValue != 0) {
                    Slot storage _spender = _balances[from][era][slot];
                    Slot storage _recipient = _balances[to][era][slot];

                    uint256 key = _getFirstUnexpiredBlockBalance(
                        _spender.list,
                        blockNumberCache,
                        _slidingWindow.getFrameSizeInBlockLength()
                    );

                    unchecked {
                        while (key > 0 && pendingValue != 0) {
                            uint256 blockBalancesCache = _spender.blockBalances[key];
                            if (blockBalancesCache <= pendingValue) {
                                pendingValue -= blockBalancesCache;
                                _spender.slotBalance -= blockBalancesCache;
                                _spender.blockBalances[key] = 0;
                                _spender.list.remove(key);
                                _recipient.slotBalance += blockBalancesCache;
                                _recipient.blockBalances[key] = blockBalancesCache;
                                _recipient.list.insert(key, (""));
                            } else {
                                _spender.slotBalance -= pendingValue;
                                _spender.blockBalances[key] -= pendingValue;
                                _recipient.slotBalance += pendingValue;
                                _recipient.blockBalances[key] = pendingValue;
                                _recipient.list.insert(key, (""));
                                pendingValue = 0;
                            }

                            key = _spender.list.next(key);
                        }

                        slot = (slot + 1) % _slidingWindow._slotSize;
                        if (slot == 0) {
                            era++;
                        }
                    }
                }
            }
        }

        emit Transfer(from, to, value);

        // hook after transfer
        _afterTokenTransfer(from, to, value);
    }

    /// @dev Retrieves the list of token balances stored for the specified account, era, and slot.
    /// @param account The address of the account for which the token list is being retrieved.
    /// @param era The era (time period) within which the token balances are stored.
    /// @param slot The slot index within the specified era for which the token balances are stored.
    /// @return list Returns an array of token balances in ascending order of block numbers.
    function tokenList(address account, uint256 era, uint8 slot) public view virtual returns (uint256[] memory) {
        return _balances[account][era][slot].list.ascending();
    }

    /// @notice Returns 0 as there is no actual total supply due to token expiration.
    /// @inheritdoc IERC20
    function totalSupply() public pure override returns (uint256) {
        /* @note If not overridden, totalSupply will only count spendable balances of all _wholeSale accounts. */
        return 0;
    }

    /// @notice Abstract hook called before every token transfer operation.
    /// @param from The address sending tokens.
    /// @param to The address receiving tokens.
    /// @param amount The amount of tokens being transferred.
    function _beforeTokenTransfer(address from, address to, uint amount) internal virtual {}

    /// @notice Abstract hook called after every token transfer operation.
    /// @param from The address sending tokens.
    /// @param to The address receiving tokens.
    /// @param amount The amount of tokens being transferred.
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    /// @inheritdoc ISlidingWindow
    function blockPerEra() external view virtual override returns (uint40) {
        return _slidingWindow._blockPerEra;
    }

    /// @inheritdoc ISlidingWindow
    function blockPerSlot() external view virtual override returns (uint40) {
        return _slidingWindow._blockPerSlot;
    }

    /// @inheritdoc ISlidingWindow
    function currentEraAndSlot() external view virtual override returns (uint256 era, uint8 slot) {
        return _slidingWindow.calculateEraAndSlot(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function getFrameSizeInBlockLength() external view virtual override returns (uint40) {
        return _slidingWindow.getFrameSizeInBlockLength();
    }

    /// @inheritdoc ISlidingWindow
    function getFrameSizeInSlotLegth() external view virtual override returns (uint8) {
        return _slidingWindow.getFrameSizeInSlotLength();
    }

    /// @inheritdoc ISlidingWindow
    function getFrameSizeInEraLength() external view virtual override returns (uint8) {
        return _slidingWindow.getFrameSizeInEraLength();
    }

    /// @inheritdoc ISlidingWindow
    function frame()
        external
        view
        virtual
        override
        returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot)
    {
        return _slidingWindow.frame(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function safeFrame()
        external
        view
        virtual
        override
        returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot)
    {
        return _slidingWindow.safeFrame(_blockNumberProvider());
    }

    /// @inheritdoc ISlidingWindow
    function slotPerEra() external view virtual override returns (uint8) {
        return _slidingWindow.getSlotPerEra();
    }
}
