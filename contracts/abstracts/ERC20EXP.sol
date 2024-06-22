// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP abstract contract
/// @author Kiwari Labs

import "../libraries/SlidingWindow.sol";
import "../libraries/SortedCircularDoublyLinkedList.sol";
import "../interfaces/IERC20EXP.sol";
import "../interfaces/ISlidingWindow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract ERC20Expirable is ERC20, IERC20EXP, ISlidingWindow {
    using SortedCircularDoublyLinkedList for SortedCircularDoublyLinkedList.List;
    using SlidingWindow for SlidingWindow.SlidingWindowState;

    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        SortedCircularDoublyLinkedList.List list;
    }

    mapping(address => bool) private _wholeSale;
    mapping(address => uint256) private _receiveBalances;
    mapping(address => mapping(uint256 => mapping(uint8 => Slot))) private _retailBalances;

    SlidingWindow.SlidingWindowState private _slidingWindow;

    error ERC20InsufficientBalance(address from, uint256 fromBalance, uint256 value);
    error ERC20InvalidSender(address from);
    error ERC20InvalidReceiver(address to);
    // error ERC20InvalidApprover(address(0));
    // error ERC20InvalidSpender(address(0));
    // error ERC20InsufficientAllowance(spender, currentAllowance, value);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 blockNumber_,
        uint16 blockTime_,
        uint8 expirePeriod_
    ) ERC20(name_, symbol_) {
        _slidingWindow._startBlockNumber = blockNumber_;
        _slidingWindow.updateSlidingWindow(blockTime_, expirePeriod_, 4);
    }

    /// @notice always return 0 for non-wholesale account.
    /// @dev return available balance from given account.
    /// @param account The address of the account for which the balance is being queried.
    /// @param unsafe The boolean flag for select which balance type is being queried.
    /// @return balance return available balance.
    function _unSafeBalanceOf(address account, bool unsafe) private view returns (uint256 balance) {
        balance = super.balanceOf(account);
        unchecked {
            if (unsafe) {
                balance += _receiveBalances[account];
            }
        }
    }

    function _slotBalance(
        address account,
        uint256 era,
        uint8 startSlot,
        uint8 endSlot
    ) private view returns (uint256 balance) {
        unchecked {
            while (startSlot <= endSlot) {
                balance += _retailBalances[account][era][startSlot].slotBalance;
                startSlot++;
            }
        }
    }

    function _blockNumberProvider() internal view virtual returns (uint256) {
        return block.number;
    }

    /// @custom:inefficientgasusedappetite heavy loop through array of blockindexed in wrostcase
    function _bufferSlotBalance(
        address account,
        uint256 era,
        uint8 slot,
        uint256 blockNumber
    ) private view returns (uint256 balance) {
        Slot storage _spender = _retailBalances[account][era][slot];
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

    // if first index invalid move next till found valid key return index as key.
    /// @param list list of block number in sorted list.
    /// @param blockNumber current block number.
    /// @param expirationPeriodInBlockLength block length
    /// @return key valid index
    function _getFirstUnexpiredBlockBalance(
        SortedCircularDoublyLinkedList.List storage list,
        uint256 blockNumber,
        uint256 expirationPeriodInBlockLength
    ) private view returns (uint256 key) {
        key = list.head();
        unchecked {
            while (blockNumber - key >= expirationPeriodInBlockLength) {
                key = list.next(key);
            }
        }
    }

    /// @notice it's optimized assume fromEra and fromSlot already buffered, gap betaween fromEra to toEra
    /// use slotBalance and sum to balance.
    /// @dev Return available balance from the given account, eras, and slots.
    /// @param account The address of the account for which the balance is being queried.
    /// @param fromEra The starting era for the balance lookup.
    /// @param toEra The ending era for the balance lookup.
    /// @param fromSlot The starting slot within the starting era for the balance lookup.
    /// @param toSlot The ending slot within the ending era for the balance lookup.
    /// @param blockNumber The current blocknumber.
    /// @return balance The available balance.
    function _lookBackBalance(
        address account,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot,
        uint256 blockNumber
    ) internal view returns (uint256 balance) {
        if (fromEra == toEra) {
            balance = _bufferSlotBalance(account, fromEra, fromSlot, blockNumber);
        } else if (fromEra < toEra) {
            // totalBlockBalance calcurate only buffer era/slot.
            // keep it simple stupid first by spliting into 3 part then sum.
            // part1: calulate balance at fromEra in naive in naive way O(n)
            unchecked {
                for (uint8 i = fromSlot; i < 4; i++) {
                    if (i == fromSlot) {
                        balance += _bufferSlotBalance(account, fromEra, i, blockNumber);
                    } else {
                        balance += _retailBalances[account][fromEra][i].slotBalance;
                    }
                }
            }
            // part2: calulate balance betaween fromEra and toEra in naive way O(n)
            unchecked {
                for (uint256 j = fromEra + 1; j < toEra; j++) {
                    balance += _slotBalance(account, j, 0, 4);
                }
            }
            // part3:calulate balance at toEra in navie way O(n)
            unchecked {
                balance += _slotBalance(account, toEra, 0, toSlot);
            }
        }
    }

    /// @notice _receiveBalances[] can't use be same as spendable balance.
    /// @param from description
    /// @param to description
    /// @param value description
    function _updateReceiveBalance(address from, address to, uint256 value) internal virtual {
        unchecked {
            if (from == address(0)) {
                // mint non-expirable token to receive balance.
                _receiveBalances[to] += value;
            } else {
                // revert if not enough
                // burn non-expirable token from receive balance.
                _receiveBalances[from] -= value;
                // update non-expirable token from and to receive balance.
                _receiveBalances[to] += value;
            }
        }
        emit Transfer(from, to, value);
    }

    /// @custom:dataintegrityerrorappetite ignore to insert operation on address(0) for saving gas
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
        Slot storage _recipient = _retailBalances[to][toEra][toSlot];
        Slot storage _sender = _retailBalances[from][fromEra][fromSlot];
        uint256 fromBalance = balanceOf(from);
        if (fromBalance < value) {
            revert ERC20InsufficientBalance(from, fromBalance, value);
        }
        uint256 key = _getFirstUnexpiredBlockBalance(
            _sender.list,
            blockNumber,
            _slidingWindow.getFrameSizeInBlockLength()
        );
        fromBalance = _sender.blockBalances[key];
        if (fromBalance == 0) {
            unchecked {
                if (fromSlot < 3) {
                    fromSlot++;
                } else {
                    fromSlot = 0;
                    fromEra++;
                }
            }
        }
        if (fromBalance < value) {
            _firstInFirstOutTransfer(from, to, value, fromEra, toEra, fromSlot, toSlot);
        } else {
            unchecked {
                _sender.blockBalances[key] -= value;
                if (_sender.blockBalances[key] == 0) {
                    _sender.list.remove(key);
                }
                _recipient.blockBalances[key] += value;
                _recipient.list.insert(key, abi.encode(""));
            }
        }
        emit Transfer(from, to, value);
    }

    function _firstInFirstOutTransfer(
        address from,
        address to,
        uint256 value,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot
    ) internal {
        uint256 remainingValue = value;
        unchecked {
            for (uint256 era = fromEra; era <= toEra; era++) {
                uint8 startSlot = (era == fromEra) ? fromSlot : 0;
                uint8 endSlot = (era == toEra) ? toSlot : 3;

                for (uint8 slot = startSlot; slot <= endSlot; slot++) {
                    if (remainingValue == 0) break;

                    remainingValue = _transferFromSlot(from, to, remainingValue, era, slot, abi.encodePacked(""));
                }
            }
        }
        if (value > 0) {
            revert ERC20InsufficientBalance(from, 0, value);
        }
    }

    function _transferFromSlot(
        address from,
        address to,
        uint256 remainingValue,
        uint256 era,
        uint8 slot,
        bytes memory emptyBytes
    ) internal returns (uint256) {
        Slot storage _sender = _retailBalances[from][era][slot];
        Slot storage _recipient = _retailBalances[to][era][slot];
        uint256[] memory blocks = _sender.list.ascending();
        unchecked {
            uint256 length = blocks.length;
            for (uint256 i = 0; i < length && remainingValue > 0; i++) {
                uint256 blockKey = blocks[i];
                uint256 blockBalance = _sender.blockBalances[blockKey];
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

    /// @notice can't mint non-expirable token to non wholesale account.
    /// @dev minting new token direct to wholesale account.
    /// @param to description
    /// @param value description
    /// @param spendable true if want to mint to spendable balance false if want to mint to receive balance
    function _mintWholeSale(address to, uint256 value, bool spendable) internal virtual {
        require(_wholeSale[to], "can't mint non-expirable token to non wholesale account");
        if (spendable) {
            _mint(to, value);
        } else {
            _updateReceiveBalance(address(0), to, value);
        }
    }

    /// @notice can't burn non-expirable token to non wholesale account.
    /// @dev direct burn from wholesale account.
    /// @param to description
    /// @param value description
    /// @param spendable true if want to burn from spendable balance false if want to burn from receive balance
    function _burnWholeSale(address to, uint256 value, bool spendable) internal virtual {
        require(_wholeSale[to], "can't burn non-expirable token to non wholesale account");
        if (spendable) {
            _burn(to, value);
        } else {
            _updateReceiveBalance(to, address(0), value);
        }
    }

    /// @notice can't mint expirable token to wholesale account.
    /// @dev minting new token direct to retail account.
    /// @param to description
    /// @param value description
    function _mintRetail(address to, uint256 value) internal virtual {
        require(!_wholeSale[to], "can't mint expirable token to non retail account");
        if (to == address(0)) {
            revert ERC20InvalidReceiver(address(0));
        }
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 currentEra, uint8 currentSlot) = _slidingWindow.calculateEraAndSlot(blockNumberCache);
        Slot storage _recipient = _retailBalances[to][currentEra][currentSlot];
        unchecked {
            _recipient.slotBalance += value;
            _recipient.blockBalances[blockNumberCache] += value;
            _recipient.list.insert(blockNumberCache, abi.encodePacked(""));
        }
        emit Transfer(address(0), to, value);
    }

    /// @notice can't mint expirable token to wholesale account.
    /// @dev burn token direct to retail account.
    /// @param to description
    /// @param value description
    function _burnRetail(address to, uint256 value) internal virtual {
        require(!_wholeSale[to], "can't burn expirable token to non retail account");
        if (to == address(0)) {
            revert ERC20InvalidSender(address(0));
        }
        uint256 fromBalance = balanceOf(to);
        if (fromBalance < value) {
            revert ERC20InsufficientBalance(to, fromBalance, value);
        }
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _slidingWindow.safeFrame(blockNumberCache);
        _updateRetailBalance(to, address(0), value, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
    }

    /// @param to description
    function grantWholeSale(address to) public virtual {
        require(!_wholeSale[to], "can't grant exist wholesale");
        _wholeSale[to] = true;
        emit GrantWholeSale(to, true);
    }

    /// @notice clear existing balance before, always perform force set receive balance to zero.
    /// @param to description
    function revokeWholeSale(address to) public virtual {
        require(_wholeSale[to], "can't revoke non-wholesale");
        _wholeSale[to] = false;
        uint256 spendableBalance = super.balanceOf(to);
        uint256 receiveBalance = _receiveBalances[to];
        if (spendableBalance > 0) {
            // clean spendable balance
            _burn(to, spendableBalance);
        }
        if (_receiveBalances[to] > 0) {
            // clean receive balance
            _updateReceiveBalance(to, address(0), receiveBalance);
        }
        emit GrantWholeSale(to, false);
    }

    /// @notice overriding balanceOf to use as safe balance.
    /// @dev return available balance from given account
    /// @inheritdoc IERC20
    function balanceOf(address account) public view override returns (uint256) {
        if (_wholeSale[account]) {
            /// @notice use _balances[account] as spendable balance and return only spendable balance.
            return _unSafeBalanceOf(account, true);
        } else {
            uint256 blockNumberCache = _blockNumberProvider();
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _slidingWindow.safeFrame(blockNumberCache);
            return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot, blockNumberCache);
        }
    }

    /// @notice overloading function balanceOf considered to be unsafe balance if provide incorrect pagination.
    /// @dev return available balance from given account, eras, and slots.
    /// @param account The address of the account for which the balance is being queried.
    /// @param fromEra The starting era for the balance lookup.
    /// @param fromSlot The starting slot within the starting era for the balance lookup.
    /// @param toEra The ending era for the balance lookup.
    /// @param toSlot The ending slot within the ending era for the balance lookup.
    /// @return uint256 return available balance.
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

    /// @notice transfer use safe balanceOf for lookback available balance.
    /// @custom:inefficientgasusedappetite emit 2 transfer events inefficient gas.
    function _customTransfer(address from, address to, uint256 value) internal {
        require(to != address(0), "ERC20: transfer to the zero address");
        // hook before transfer
        _beforeTokenTransfer(from, to, value);
        uint256 selector = (_wholeSale[to] ? 2 : 0) | (_wholeSale[from] ? 1 : 0);
        if (selector == 0) {
            uint256 blockNumberCache = _blockNumberProvider();
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _slidingWindow.safeFrame(blockNumberCache);
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

    /// @inheritdoc IERC20
    /// @notice transfer use safe balanceOf for lookback available balance.
    /// @custom:inefficientgasusedappetite emit 2 transfer events inefficient gas.
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

    /// @dev return is given address is whole sale address.
    /// @param account description
    /// @return bool return boolean.
    function wholeSale(address account) public view returns (bool) {
        return _wholeSale[account];
    }

    /// @param account description
    /// @param era description
    /// @param slot description
    /// @return list of token
    function tokenList(address account, uint256 era, uint8 slot) public view returns (uint256[] memory) {
        return _retailBalances[account][era][slot].list.ascending();
    }

    /// @notice due to token can expiration there is no actaul totalSupply.
    /// @inheritdoc IERC20
    function totalSupply() public pure override returns (uint256) {
        /* @note if not override totalSupply,
         * totalSupply will only counting spendable balance of all _wholeSale account.
         */
        return 0;
    }

    /// @notice abstract function
    function _beforeTokenTransfer(address from, address to, uint amount) internal virtual override {}

    /// @notice abstract function
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual override {}

    function blockPerEra() external view override returns (uint40) {
        return _slidingWindow._blockPerEra;
    }
    function blockPerSlot() external view override returns (uint40) {
        return _slidingWindow._blockPerSlot;
    }

    function currentEraAndSlot() external view override returns (uint256 era, uint8 slot) {
        return _slidingWindow.calculateEraAndSlot(_blockNumberProvider());
    }

    function getFrameSizeInBlockLength() external view override returns (uint40) {
        return _slidingWindow.getFrameSizeInBlockLength();
    }

    function getFrameSizeInSlotLegth() external view override returns (uint8) {
        return _slidingWindow.getFrameSizeInSlotLength();
    }

    function getFrameSizeInEraLength() external view override returns (uint8) {
        return _slidingWindow.getFrameSizeInEraLength();
    }

    function frame() external view override returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _slidingWindow.frame(_blockNumberProvider());
    }

    function safeFrame() external view override returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        return _slidingWindow.safeFrame(_blockNumberProvider());
    }

    function slotPerEra() external view override returns (uint8) {
        return _slidingWindow.getSlotPerEra();
    }
}
