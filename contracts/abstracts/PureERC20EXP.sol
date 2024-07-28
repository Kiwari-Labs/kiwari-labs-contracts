// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP abstract contract
/// @author Kiwari Labs

import "../libraries/SlidingWindow.sol";
import "../libraries/SortedCircularDoublyLinkedList.sol";
import "../interfaces/ISlidingWindow.sol";
import "../interfaces/IPureERC20EXP.sol";
import "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

abstract contract ERC20Expirable is IERC20Metadata, IERC20Errors, IPureERC20EXP, ISlidingWindow {
    using SortedCircularDoublyLinkedList for SortedCircularDoublyLinkedList.List;
    using SlidingWindow for SlidingWindow.SlidingWindowState;

    string private _name;
    string private _symbol;

    /// @notice Struct representing a slot containing balances mapped by blocks.
    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        SortedCircularDoublyLinkedList.List list;
    }

    mapping(address => mapping(uint256 => mapping(uint8 => Slot))) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

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
    ) {
        _name = name_;
        _symbol = symbol_;
        _slidingWindow._startBlockNumber = blockNumber_;
        _slidingWindow.updateSlidingWindow(blockTime_, frameSize_, slotSize_);
    }

    /// @notice Allows for the override _frame to use either the frame or safeFrame.
    /// @dev Determines the sliding window frame based on the provided block number.
    /// @param blockNumber The block number used as a reference point for computing the frame.
    /// @return fromEra The starting era of the frame.
    /// @return toEra The ending era of the frame.
    /// @return fromSlot The starting slot within the starting era of the frame.
    /// @return toSlot The ending slot within the ending era of the frame.
    function _frame(
        uint256 blockNumber
    ) internal view virtual returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _slidingWindow.frame(blockNumber);
    }

    /// @notice Allows for override in subsecond blocktime network.
    /// @dev Returns the current block number.
    /// @return The current network block number.
    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number;
    }

    /// @notice Retrieves the total slot balance for the specified account and era,
    /// iterating through the range of slots from startSlot to endSlot inclusive.
    /// This function reads slot balances stored in a mapping `_balances`.
    /// @dev This function assumes that the provided `startSlot` is less than or equal to `endSlot`.
    /// It calculates the cumulative balance by summing the `slotBalance` of each slot within the specified range.
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
        return balance;
    }

    /// @notice Calculates the total buffered balance within a specific era and slot for the given account,
    /// considering all block balances that have not expired relative to the current block number.
    /// This function iterates through a sorted list of block indices and sums up corresponding balances.
    /// @dev This function is used to determine the total buffered balance for an account within a specific era and slot.
    /// It loops through a sorted list of block indices stored in `_spender.list` and sums up the balances from `_spender.blockBalances`.
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

    /// @notice Finds the index of the first valid block balance in a sorted list of block numbers.
    /// A block balance index is considered valid if the difference between the current blockNumber
    /// and the block number at the index (key) is less than the expirationPeriodInBlockLength.
    /// @dev This function is used to determine the first valid block balance index within a sorted circular doubly linked list.
    /// It iterates through the list starting from the head and stops when it finds a valid index or reaches the end of the list.
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
            // Go to the next slot. Increase the era if the slot is over the limit.
            fromSlot = (fromSlot + 1) % _slidingWindow._slotSize;
            if (fromSlot == 0) {
                fromEra++;
            }

            // It is not possible if the fromEra is more than toEra.
            if (fromEra == toEra) {
                balance += _slotBalance(account, fromEra, fromSlot, toSlot);
            } else {
                // Keep it simple stupid first by spliting into 3 part then sum.
                // Part1: calulate balance at fromEra in naive in naive way O(n)
                uint8 maxSlotCache = _slidingWindow._slotSize - 1;
                balance += _slotBalance(account, fromEra, fromSlot, maxSlotCache);
                // Part2: calulate balance betaween fromEra and toEra in naive way O(n)
                for (uint256 era = fromEra + 1; era < toEra; era++) {
                    balance += _slotBalance(account, era, 0, maxSlotCache);
                }
                // Part3:calulate balance at toEra in navie way O(n)
                balance += _slotBalance(account, toEra, 0, toSlot);
            }
        }
    }

    /// @notice Internal function to update token balances during token transfers or operations.
    /// @dev Handles various scenarios including minting, burning, and transferring tokens with expiration logic.
    /// @param from The address from which tokens are being transferred (or minted/burned).
    /// @param to The address to which tokens are being transferred (or burned to if `to` is `zero address`).
    /// @param value The amount of tokens being transferred, minted, or burned.
    function _update(address from, address to, uint256 value) internal virtual{
        // Hook before transfer
        _beforeTokenTransfer(from, to, value);

        uint256 blockNumberCache = _blockNumberProvider();
        
        uint256 blocLengthCache = _slidingWindow.getFrameSizeInBlockLength();

        if (from == address(0)) {
            // Mint expirable token.
            (uint256 currentEra, uint8 currentSlot) = _slidingWindow.calculateEraAndSlot(blockNumberCache);
            Slot storage _recipient = _balances[to][currentEra][currentSlot];uint8 slotSizeCache = _slidingWindow._slotSize;
            unchecked {
                _recipient.slotBalance += value;
                _recipient.blockBalances[blockNumberCache] += value;
            }
            _recipient.list.insert(blockNumberCache, (""));
        } else {
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _frame(blockNumberCache);
            uint256 balance = _lookBackBalance(from, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
            if (balance < value) {
                revert ERC20InsufficientBalance(from, balance, value);
            }

            uint256 pendingValue = value;
            uint256 balanceCache = 0;

            if (to == address(0)) {
                // Burn expirable token.
                while ((fromEra < toEra || (fromEra == toEra && fromSlot <= toSlot)) && pendingValue > 0) {
                    Slot storage _spender = _balances[from][fromEra][fromSlot];

                    uint256 key = _getFirstUnexpiredBlockBalance(
                        _spender.list,
                        blockNumberCache,
                        blocLengthCache
                    );

                    while (key > 0 && pendingValue > 0) {
                        balanceCache = _spender.blockBalances[key];

                        if (balanceCache <= pendingValue) {
                            unchecked {
                                pendingValue -= balanceCache;
                                _spender.slotBalance -= balanceCache;
                                _spender.blockBalances[key] -= balanceCache;
                            }
                            key = _spender.list.next(key);
                            _spender.list.remove(_spender.list.previous(key));
                        } else {
                            unchecked {
                                _spender.slotBalance -= pendingValue;
                                _spender.blockBalances[key] -= pendingValue;
                            }
                            pendingValue = 0;
                        }
                    }

                    // Go to the next slot. Increase the era if the slot is over the limit.
                    if (pendingValue > 0) {
                        unchecked {
                            fromSlot = (fromSlot + 1) % slotSizeCache;
                            if (fromSlot == 0) {
                                fromEra++;
                            }
                        }
                    }
                }
            } else {
                // Transfer expirable token.
                while ((fromEra < toEra || (fromEra == toEra && fromSlot <= toSlot)) && pendingValue > 0) {
                    Slot storage _spender = _balances[from][fromEra][fromSlot];
                    Slot storage _recipient = _balances[to][fromEra][fromSlot];

                    uint256 key = _getFirstUnexpiredBlockBalance(
                        _spender.list,
                        blockNumberCache,
                        blocLengthCache
                    );

                    while (key > 0 && pendingValue > 0) {
                        balanceCache = _spender.blockBalances[key];

                        if (balanceCache <= pendingValue) {
                            unchecked {
                                pendingValue -= balanceCache;
                                _spender.slotBalance -= balanceCache;
                                _spender.blockBalances[key] -= balanceCache;

                                _recipient.slotBalance += balanceCache;
                                _recipient.blockBalances[key] += balanceCache;
                                _recipient.list.insert(key, (""));
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
                            _recipient.list.insert(key, (""));
                            pendingValue = 0;
                        }
                    }

                    // Go to the next slot. Increase the era if the slot is over the limit.
                    if (pendingValue > 0) {
                        unchecked {
                            fromSlot = (fromSlot + 1) % slotSizeCache;
                            if (fromSlot == 0) {
                                fromEra++;
                            }
                        }
                    }
                }
            }
        }

        emit Transfer(from, to, value);

        // Hook after transfer
        _afterTokenTransfer(from, to, value);
    }

    // @TODO Natspec
    function _mint(address account, uint256 value) internal {
        _update(address(0), account, value);
    }

    // @TODO Natspec
    function _burn(address account, uint256 value) internal {
        _update(account, address(0), value);
    }

    /// @inheritdoc IPureERC20EXP
    function tokenList(address account, uint256 era, uint8 slot) public view virtual returns (uint256[] memory list) {
        list = _balances[account][era][slot].list.ascending();
    }

    /// @notice Abstract hook called before every token transfer operation.
    /// @dev This function is called before every token transfer operation for additional checks or actions.
    /// @param from The address sending tokens.
    /// @param to The address receiving tokens.
    /// @param amount The amount of tokens being transferred.
    function _beforeTokenTransfer(address from, address to, uint amount) internal virtual {}

    /// @notice Abstract hook called after every token transfer operation.
    /// @dev This function is called after every token transfer operation for additional processing or logging.
    /// @param from The address sending tokens.
    /// @param to The address receiving tokens.
    /// @param amount The amount of tokens being transferred.
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}

    /// @notice Returns 0 as there is no actual total supply due to token expiration.
    /// @dev This function returns the total supply of tokens, which is constant and set to 0.
    /// @inheritdoc IERC20
    function totalSupply() public pure override returns (uint256) {
        return 0;
    }

    /// @inheritdoc IERC20Metadata
    function name() public view override returns (string memory) {
        return _name;
    }

    /// @inheritdoc IERC20Metadata
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /// @inheritdoc IERC20Metadata
    function decimals() public pure override returns (uint8) {
        return 18;
    }

    /// @inheritdoc IERC20
    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    /// @notice Returns the available balance of tokens for a given account.
    /// @dev Calculates and returns the available balance based on the frame.
    /// @inheritdoc IERC20
    function balanceOf(address account) public view virtual override returns (uint256) {
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _frame(blockNumberCache);
        return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
    }

    /// @inheritdoc IERC20
    function transfer(address to, uint256 value) public override returns (bool) {
        address from = msg.sender;
        _update(from, to, value);
        return true;
    }

    /// @inheritdoc IERC20
    // @TODO add logic
    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        // ...
        // _spendAllowance(from, to, value);
        _update(from, to, value);
        return true;
    }

    /// @inheritdoc IERC20
    // @TODO add logic
    function approve(address spender, uint256 value) public override returns (bool) {
        // ...
        // _updateAllowance(owner, spender, value);

        return true;
    }

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
    function getFrameSizeInSlotLength() external view virtual override returns (uint8) {
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
