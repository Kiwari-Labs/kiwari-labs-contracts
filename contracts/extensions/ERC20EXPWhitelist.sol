// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP abstract contract with Unexpirable token address exeption.
/// @author Kiwari Labs

import "../abstracts/SlidingWindow.sol";
import "../libraries/SortedCircularDoublyLinkedList.sol";
import "../interfaces/IERC20EXP.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract ERC20EXPWhitelist is ERC20, IERC20EXP, SlidingWindow {
    using SortedCircularDoublyLinkedList for SortedCircularDoublyLinkedList.List;

    /// @notice Struct representing a slot containing balances mapped by blocks.
    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        SortedCircularDoublyLinkedList.List list;
    }

    mapping(address => bool) private _wholeSale;
    mapping(address => uint256) private _receiveBalances;
    mapping(address => mapping(uint256 => mapping(uint8 => Slot))) private _retailBalances;

    /// @notice Constructor function to initialize the token contract with specified parameters.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param blockNumber_ The starting block number for the sliding window.
    /// @param blockTime_ The duration of each block in milliseconds..
    /// @param expirePeriod_ The expiration period of each block in the sliding window, in blocks.
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 blockNumber_,
        uint16 blockTime_,
        uint8 expirePeriod_
    ) ERC20(name_, symbol_) SlidingWindow(blockNumber_, blockTime_, expirePeriod_, 4) {}

    /// @notice Always returns 0 for non-wholesale accounts.
    /// @dev Returns the available balance for the given account.
    /// @param account The address of the account for which the balance is being queried.
    /// @param unsafe Flag to select the balance type:
    /// - `false`: Returns the ERC20 token balance only.
    /// - `true`: Includes the non-expirable token balance (_receiveBalances).
    /// @return balance The available balance based on the selected type.
    function _unSafeBalanceOf(address account, bool unsafe) private view returns (uint256 balance) {
        balance = super.balanceOf(account);
        unchecked {
            if (unsafe) {
                balance += _receiveBalances[account];
            }
        }
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
                balance += _retailBalances[account][era][startSlot].slotBalance;
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
        Slot storage _spender = _retailBalances[account][era][slot];
        uint256 key = _getFirstUnexpiredBlockBalance(_spender.list, blockNumber, _getFrameSizeInBlockLength());
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

    /// @notice Optimized to assume fromEra and fromSlot are already buffered, covering the gap between fromEra and toEra
    ///    using slotBalance and summing to balance.
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
    ) internal view returns (uint256 balance) {
        unchecked {
            if (fromEra == toEra) {
                balance = _bufferSlotBalance(account, fromEra, fromSlot, blockNumber);
                if (fromSlot < toSlot) {
                    balance += _slotBalance(account, fromEra, fromSlot + 1, toSlot);
                }
            } else if (fromEra < toEra) {
                // totalBlockBalance calcurate only buffer era/slot.
                // keep it simple stupid first by spliting into 3 part then sum.
                // part1: calulate balance at fromEra in naive in naive way O(n)
                uint8 maxSlotCache = _getSlotPerEra() - 1;
                balance += _bufferSlotBalance(account, fromEra, fromSlot, blockNumber);
                if (fromSlot < 3) {
                    balance += _slotBalance(account, fromEra, fromSlot + 1, maxSlotCache);
                }
                // part2: calulate balance betaween fromEra and toEra in naive way O(n)
                for (uint256 era = fromEra + 1; era < toEra; era++) {
                    balance += _slotBalance(account, era, 0, maxSlotCache);
                }
                // part3:calulate balance at toEra in navie way O(n)
                balance += _slotBalance(account, toEra, 0, toSlot);
            }
        }
    }

    /// @notice Updates the receive balance by either minting or burning non-expirable tokens.
    /// @dev This function handles the minting of tokens to the `to` address if `from` is the zero address,
    /// and burning of tokens from the `from` address if `from` is not the zero address. It also updates
    /// the receive balance for both the `from` and `to` addresses accordingly.
    /// @param from The address of the account from which tokens are being transferred or burned. If `from` is the zero address, tokens are minted to the `to` address.
    /// @param to The address of the account to which tokens are being transferred or minted.
    /// @param value The amount of tokens to be transferred, minted, or burned.
    function _updateReceiveBalance(address from, address to, uint256 value) internal virtual {
        unchecked {
            uint256 balance = _receiveBalances[from];
            if (from == address(0)) {
                // mint non-expirable token to receive balance.
                _receiveBalances[to] += value;
            } else if (to == address(0)) {
                if (balance < value) {
                    revert ERC20InsufficientBalance(from, balance, value);
                }
                _receiveBalances[from] -= value;
            } else {
                if (balance < value) {
                    revert ERC20InsufficientBalance(from, balance, value);
                }
                // burn non-expirable token from receive balance.
                _receiveBalances[from] -= value;
                // update non-expirable token from and to receive balance.
                _receiveBalances[to] += value;
            }
        }
        emit Transfer(from, to, value);
    }

    /// @notice Updates the retail balance by transferring a specified value of tokens from one account to another.
    /// @dev This function checks the balance and performs the transfer either directly or through a FIFO transfer method
    /// if the balance in the specified slot is insufficient. It also handles balance expiry and slot management.
    /// @param from The address of the account from which tokens are being transferred.
    /// @param to The address of the account to which tokens are being transferred.
    /// @param value The amount of tokens to be transferred.
    /// @param fromEra The era from which the transfer starts.
    /// @param toEra The era to which the transfer ends.
    /// @param fromSlot The slot within the starting era from which the transfer starts.
    /// @param toSlot The slot within the ending era to which the transfer ends.
    /// @param blockNumber The current block number used to determine the validity of the transfer.
    function _updateRetailBalance(
        address from,
        address to,
        uint256 value,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot,
        uint256 blockNumber
    ) internal {
        uint256 fromBalance = balanceOf(from);
        if (fromBalance < value) {
            revert ERC20InsufficientBalance(from, fromBalance, value);
        }
        Slot storage _sender = _retailBalances[from][fromEra][fromSlot];
        uint256 key = _getFirstUnexpiredBlockBalance(_sender.list, blockNumber, _getFrameSizeInBlockLength());
        fromBalance = _sender.blockBalances[key];
        if (fromBalance == 0) {
            _handleTransfer(from, to, value, fromEra, toEra, fromSlot, toSlot);
        } else if (fromBalance >= value) {
            Slot storage _recipient = _retailBalances[to][fromEra][fromSlot];
            _directTransfer(_sender, _recipient, value, key);
        } else {
            Slot storage _recipient = _retailBalances[to][fromEra][fromSlot];
            uint256 remainingValue = _transferFromSlotStartFromKey(_sender, _recipient, value, key);
            if (remainingValue > 0) {
                _handleTransfer(from, to, value, fromEra, toEra, fromSlot, toSlot);
            }
        }
        emit Transfer(from, to, value);
    }

    function _transferFromSlotStartFromKey(
        Slot storage sender,
        Slot storage recipient,
        uint256 value,
        uint256 key
    ) private returns (uint256 blockBalance) {
        // Loop until value is transferred or end of slot is reached
        bytes memory emptyBytes = abi.encodePacked("");
        uint256[] memory blocks = sender.list.pathToTail(key);
        unchecked {
            uint256 length = blocks.length;
            uint256 blockKey;
            for (uint256 i = 0; i < length && value > 0; i++) {
                blockKey = blocks[i];
                blockBalance = sender.blockBalances[blockKey];
                if (blockBalance > 0) {
                    if (blockBalance >= value) {
                        sender.blockBalances[blockKey] -= value;
                        if (sender.blockBalances[blockKey] == 0) {
                            sender.list.remove(blockKey);
                        }
                        recipient.blockBalances[blockKey] += value;
                        recipient.slotBalance += value;
                        recipient.list.insert(blockKey, emptyBytes);
                        value = 0;
                        break;
                    } else {
                        sender.blockBalances[blockKey] = 0;
                        sender.list.remove(blockKey);
                        recipient.blockBalances[blockKey] += blockBalance;
                        recipient.slotBalance += blockBalance;
                        recipient.list.insert(blockKey, emptyBytes);
                        value -= blockBalance;
                    }
                }
            }
        }
        return value;
    }

    /// @notice use for preventing stack too deep in update retail balance by spliting into small function.
    /// @dev private function to perform a direct transfer of tokens by key.
    /// @param sender The slot storage of the sender.
    /// @param recipient The slot storage of the recipient.
    /// @param value The amount of tokens to transfer.
    /// @param key The key associated with the block balance.
    function _directTransfer(Slot storage sender, Slot storage recipient, uint256 value, uint256 key) private {
        unchecked {
            uint256 balance = sender.blockBalances[key] - value;
            sender.blockBalances[key] = balance;
            if (balance == 0) {
                sender.list.remove(key);
            }
            recipient.blockBalances[key] += value;
            recipient.list.insert(key, abi.encodePacked(""));
        }
    }

    /// @notice use for preventing stack too deep in update retail balance by spliting into small function.
    /// @dev private function to handle token transfer when sender's balance is not enough.
    /// @param from The address from which tokens are transferred.
    /// @param to The address to which tokens are transferred.
    /// @param value The amount of tokens to transfer.
    /// @param fromEra The era (time period) of the sender's balance.
    /// @param toEra The era (time period) of the recipient's balance.
    /// @param fromSlot The slot index of the sender's balance.
    /// @param toSlot The slot index of the recipient's balance.
    function _handleTransfer(
        address from,
        address to,
        uint256 value,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot
    ) private {
        unchecked {
            if (fromSlot < 3) {
                fromSlot++;
            } else {
                fromSlot = 0;
                fromEra++;
            }
        }
        _firstInFirstOutTransfer(from, to, value, fromEra, toEra, fromSlot, toSlot);
    }

    /// @notice Transfers tokens from one account to another in a first-in-first-out manner across specified eras and slots.
    /// @dev This function performs a transfer by iterating through the eras and slots, transferring the specified value
    /// in a FIFO order until the value is exhausted or all slots are processed.
    /// @param from The address of the account from which tokens are being transferred.
    /// @param to The address of the account to which tokens are being transferred.
    /// @param value The total amount of tokens to be transferred.
    /// @param fromEra The starting era from which the transfer should begin.
    /// @param toEra The ending era up to which the transfer should be processed.
    /// @param fromSlot The starting slot within the starting era.
    /// @param toSlot The ending slot within the ending era.
    function _firstInFirstOutTransfer(
        address from,
        address to,
        uint256 value,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot
    ) internal {
        bytes memory emptyBytes = abi.encodePacked("");
        unchecked {
            for (uint256 era = fromEra; era <= toEra; era++) {
                uint8 startSlot = (era == fromEra) ? fromSlot : 0;
                uint8 endSlot = (era == toEra) ? toSlot : 3;
                for (uint8 slot = startSlot; slot <= endSlot; slot++) {
                    if (value == 0) break;
                    value = _transferFromSlot(from, to, value, era, slot, emptyBytes);
                }
            }
        }
    }

    /// @notice Transfers a specified value of tokens from one slot to another, adjusting balances accordingly.
    /// @dev Transfers tokens from the sender's slot balance to the recipient's slot balance in a FIFO manner.
    /// @param from The address of the account from which tokens are being transferred.
    /// @param to The address of the account to which tokens are being transferred.
    /// @param remainingValue The amount of tokens to be transferred.
    /// @param era The era from which the tokens are being transferred.
    /// @param slot The slot within the era from which the tokens are being transferred.
    /// @return blockBalance The remaining value that could not be transferred due to insufficient balance.
    function _transferFromSlot(
        address from,
        address to,
        uint256 remainingValue,
        uint256 era,
        uint8 slot,
        bytes memory emptyBytes
    ) internal returns (uint256 blockBalance) {
        Slot storage _sender = _retailBalances[from][era][slot];
        Slot storage _recipient = _retailBalances[to][era][slot];
        uint256[] memory blocks = _sender.list.ascending();
        uint256 length = blocks.length;
        unchecked {
            for (uint256 i = 0; i < length && remainingValue > 0; i++) {
                uint256 blockKey = blocks[i];
                blockBalance = _sender.blockBalances[blockKey];
                if (blockBalance > 0) {
                    if (blockBalance >= remainingValue) {
                        _sender.blockBalances[blockKey] -= remainingValue;
                        _recipient.blockBalances[blockKey] += remainingValue;
                        _recipient.slotBalance += remainingValue;
                        if (_sender.blockBalances[blockKey] == 0) {
                            _sender.list.remove(blockKey);
                        }
                        _recipient.list.insert(blockKey, emptyBytes);
                        remainingValue = 0;
                        break;
                    } else {
                        _sender.blockBalances[blockKey] = 0;
                        _recipient.blockBalances[blockKey] += blockBalance;
                        _recipient.slotBalance += blockBalance;
                        _sender.list.remove(blockKey);
                        _recipient.list.insert(blockKey, emptyBytes);
                        remainingValue -= blockBalance;
                    }
                }
            }
        }
        return remainingValue;
    }

    /// @notice Only allows minting non-expirable tokens to wholesale accounts.
    /// @dev Mints new tokens directly to a wholesale account.
    /// @param to The address of the wholesale account to mint tokens to.
    /// @param value The amount of tokens to mint.
    /// @param spendable Set to true to mint tokens to spendable balance, false to mint to receive balance.
    function _mintWholeSale(address to, uint256 value, bool spendable) internal virtual {
        require(_wholeSale[to], "can't mint non-expirable token to non wholesale account");
        if (spendable) {
            _mint(to, value);
        } else {
            if (to == address(0)) {
                revert ERC20InvalidReceiver(address(0));
            }
            _updateReceiveBalance(address(0), to, value);
        }
    }

    /// @notice Only allows burning non-expirable tokens from wholesale accounts.
    /// @dev Directly burns tokens from a wholesale account.
    /// @param to The address of the wholesale account from which tokens will be burned.
    /// @param value The amount of tokens to burn.
    /// @param spendable Set to true to burn tokens from spendable balance, false to burn from receive balance.
    function _burnWholeSale(address to, uint256 value, bool spendable) internal virtual {
        require(_wholeSale[to], "can't burn non-expirable token to non wholesale account");
        if (spendable) {
            _burn(to, value);
        } else {
            _updateReceiveBalance(to, address(0), value);
        }
    }

    /// @notice Cannot mint expirable tokens to wholesale accounts.
    /// @dev Mints new tokens directly to a retail account.
    /// @param to The address of the retail account receiving the minted tokens.
    /// @param value The amount of tokens to mint.
    function _mintRetail(address to, uint256 value) internal virtual {
        require(!_wholeSale[to], "can't mint expirable token to non retail account");
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 currentEra, uint8 currentSlot) = _calculateEraAndSlot(blockNumberCache);
        Slot storage _recipient = _retailBalances[to][currentEra][currentSlot];
        unchecked {
            _recipient.slotBalance += value;
            _recipient.blockBalances[blockNumberCache] += value;
            _recipient.list.insert(blockNumberCache, abi.encodePacked(""));
        }
        emit Transfer(address(0), to, value);
    }

    /// @notice Cannot burn expirable tokens from wholesale accounts.
    /// @dev Burns tokens directly from a retail account.
    /// @param to The address of the retail account from which tokens are burned.
    /// @param value The amount of tokens to burn.
    function _burnRetail(address to, uint256 value) internal virtual {
        require(!_wholeSale[to], "can't burn expirable token to non retail account");
        if (to == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safeFrame(blockNumberCache);
        _updateRetailBalance(to, address(0), value, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
    }

    //// @inheritdoc IERC20EXP
    function grantWholeSale(address to) public virtual override {
        require(!_wholeSale[to], "can't grant exist wholesale");
        _wholeSale[to] = true;
        emit GrantWholeSale(to, true);
    }

    /// @inheritdoc IERC20EXP
    function revokeWholeSale(address to) public virtual override {
        require(_wholeSale[to], "can't revoke non-wholesale");
        uint256 balance = super.balanceOf(to);
        if (balance > 0) {
            // clean spendable balance
            _burn(to, balance);
        }
        uint256 receiveBalance = _receiveBalances[to];
        if (receiveBalance > 0) {
            // clean receive balance
            _updateReceiveBalance(to, address(0), receiveBalance);
        }
        _wholeSale[to] = false;
        emit GrantWholeSale(to, false);
    }

    /// @notice Returns the available balance of tokens for a given account.
    /// @dev If the account is a wholesale account, returns the spendable balance.
    /// Otherwise, calculates and returns the available balance based on the safe frame.
    /// @inheritdoc IERC20
    function balanceOf(address account) public view override returns (uint256) {
        if (_wholeSale[account]) {
            /// @notice Uses `_balances[account]` as the spendable balance and returns only the spendable balance.
            return _unSafeBalanceOf(account, true);
        } else {
            uint256 blockNumberCache = _blockNumberProvider();
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safeFrame(blockNumberCache);
            return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
        }
    }

    /// @inheritdoc IERC20EXP
    function balanceOf(
        address account,
        uint256 fromEra,
        uint8 fromSlot,
        uint256 toEra,
        uint8 toSlot
    ) public view override returns (uint256) {
        // for whole account ignore fromEra, fromSlot, toEra and toSlot
        if (_wholeSale[account]) {
            return _unSafeBalanceOf(account, true);
        } else {
            return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot, _blockNumberProvider());
        }
    }

    /// @notice Performs a custom token transfer operation using safe balanceOf for calculating available balances.
    /// @custom:inefficientgasusedappetite Emits 2 transfer events which may result in inefficient gas usage.
    /// @param from The address from which tokens are being transferred.
    /// @param to The address to which tokens are being transferred.
    /// @param value The amount of tokens being transferred.
    function _customTransfer(address from, address to, uint256 value) internal {
        // hook before transfer
        _beforeTokenTransfer(from, to, value);
        uint256 selector = (_wholeSale[to] ? 2 : 0) | (_wholeSale[from] ? 1 : 0);
        if (selector == 0) {
            if (to == address(0)) {
                revert ERC20InvalidReceiver(address(0));
            }
            uint256 blockNumberCache = _blockNumberProvider();
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safeFrame(blockNumberCache);
            _updateRetailBalance(from, to, value, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
        } else if (selector == 1) {
            // consolidate by burning retail balance and mint non-expirable to whole receive balance.
            _burnRetail(from, value);
            _mintWholeSale(to, value, false);
        } else if (selector == 2) {
            // consolidate by burning wholesale spendable balance and mint expirable to retail balance.
            _burn(from, value);
            _mintRetail(to, value);
        } else {
            // wholesale to wholesale transfer.
            _transfer(from, to, value);
        }

        // hook after transfer
        _afterTokenTransfer(from, to, value);
    }

    /// @notice transfer use safe balanceOf for lookback available balance.
    /// @inheritdoc IERC20
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        _customTransfer(msg.sender, to, value);
        return true;
    }

    /// @inheritdoc IERC20
    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, value);
        _customTransfer(from, to, value);
        return true;
    }

    /// @dev Checks if the given address is a wholesale account.
    /// @param account The address to check.
    /// @return bool Returns true if the address is a wholesale account, false otherwise.
    function wholeSale(address account) public view returns (bool) {
        return _wholeSale[account];
    }

    /// @dev Retrieves the list of token balances stored for the specified account, era, and slot.
    /// @param account The address of the account for which the token list is being retrieved.
    /// @param era The era (time period) within which the token balances are stored.
    /// @param slot The slot index within the specified era for which the token balances are stored.
    /// @return list Returns an array of token balances in ascending order of block numbers.
    function tokenList(address account, uint256 era, uint8 slot) public view returns (uint256[] memory) {
        return _retailBalances[account][era][slot].list.ascending();
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
}
