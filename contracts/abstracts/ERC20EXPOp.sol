// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP abstract contract
/// @author Kiwari Labs
/// @notice This abstract contract implementing Light Weight Sliding Window and Light Sorted Circular Doubly Linked List.

import "../libraries/LightWeightSlidingWindow.sol";
import "../libraries/LightSortedCircularDoublyLinkedList.sol";
import "../interfaces/IERC20EXP.sol";
import "../interfaces/ISlidingWindow.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract ERC20Expirable is ERC20, IERC20EXP, ISlidingWindow {
    using CircularDoublyLinkedList for CircularDoublyLinkedList.List;
    using SlidingWindow for SlidingWindow.SlidingWindowState;

    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        CircularDoublyLinkedList.List list;
    }

    mapping(address => bool) private _wholeSale;
    mapping(address => uint256) private _receiveBalances;
    mapping(address => mapping(uint256 => mapping(uint8 => Slot))) private _retailBalances;

    SlidingWindow.SlidingWindowState private _slidingWindow;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 blockNumber_,
        uint16 blockTime_,
        uint8 expirePeriod_
    ) ERC20(name_, symbol_) {
        _slidingWindow._startBlockNumber = blockNumber_;
        _slidingWindow.updateSlidingWindow(blockTime_, expirePeriod_);
    }

    /// @notice always return 0 for non-wholesael account.
    /// @dev return available balance from given account.
    /// @param account The address of the account for which the balance is being queried.
    /// @param unsafe The boolean flag for select which balance type is being queried.
    /// @return uint256 return available balance.
    function _unSafeBalanceOf(address account, bool unsafe) private view returns (uint256) {
        if (unsafe) {
            return _receiveBalances[account] + super.balanceOf(account);
        } else {
            return super.balanceOf(account);
        }
    }

    function _slotBalance(
        address account,
        uint256 era,
        uint8 startSlot,
        uint8 endSlot
    ) private view returns (uint256 balanceCache) {
        unchecked {
            for (uint8 slot = startSlot; slot <= endSlot; slot++) {
                balanceCache += _retailBalances[account][era][slot].slotBalance;
            }
        }
        return balanceCache;
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
    ) private view returns (uint256 balanceCache) {
        Slot storage _spender = _retailBalances[account][era][slot];
        uint256 frameSizeInBlockLengthCache = _slidingWindow.getFrameSizeInBlockLength();
        uint256[] memory ascendingList = _spender.list.ascending();
        uint256 length = ascendingList.length;
        for (uint256 i = 0; i < length; i++) {
            uint256 blockKey = ascendingList[i];
            if (blockNumber - blockKey <= frameSizeInBlockLengthCache) {
                balanceCache += _spender.blockBalances[blockKey];
            }
        }
        return balanceCache;
    }

    // if first index invalid move next till found valid key return index as key.
    function _getFirstUnexpiredBlockBalance(
        uint256[] memory list,
        uint256 blockNumber,
        uint256 expirationPeriodInBlockLength
    ) private pure returns (uint256 key) {
        unchecked {
            for (uint256 index = 0; index < list.length; index++) {
                uint256 value = list[index];
                // stop loop when found. always start form head because list is sorted before.
                if (blockNumber - value <= expirationPeriodInBlockLength) {
                    key = value;
                    break;
                }
            }
        }
        return key;
    }

    /// @notice it's optimized assume fromEra and fromSlot already buffered, gap betaween fromEra to toEra
    /// use slotBalance and sum to _balanceCache.
    /// @dev Return available balance from the given account, eras, and slots.
    /// @param account The address of the account for which the balance is being queried.
    /// @param fromEra The starting era for the balance lookup.
    /// @param toEra The ending era for the balance lookup.
    /// @param fromSlot The starting slot within the starting era for the balance lookup.
    /// @param toSlot The ending slot within the ending era for the balance lookup.
    /// @return balanceCache The available balance.
    function _lookBackBalance(
        address account,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot,
        uint256 blockNumber
    ) internal view returns (uint256 balanceCache) {
        if (fromEra & toEra == 0) {
            return _bufferSlotBalance(account, 0, 0, blockNumber);
        } else {
            uint256 index;
            // totalBlockBalance calcurate only buffer era/slot.
            // keep it simple stupid first by spliting into 3 part then sum.
            // part1: calulate balance at fromEra in naive in naive way O(n)
            unchecked {
                for (index = fromSlot; index < 4; index++) {
                    if (index == fromSlot) {
                        balanceCache += _bufferSlotBalance(account, fromEra, uint8(index), blockNumber);
                    } else {
                        balanceCache += _retailBalances[account][fromEra][uint8(index)].slotBalance;
                    }
                }
            }
            // part2: calulate balance betaween fromEra and toEra in naive way O(n)
            unchecked {
                for (index = fromEra + 1; index < toEra; index++) {
                    balanceCache += _slotBalance(account, index, 0, 4);
                }
            }
            // part3:calulate balance at toEra in navie way O(n)
            unchecked {
                balanceCache += _slotBalance(account, toEra, 0, toSlot);
            }
            return balanceCache;
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
            } else if (to == address(0)) {
                // revert if not enough
                // burn non-expirable token from receive balance.
                _receiveBalances[from] -= value;
            } else {
                // update non-expirable token from and to receive balance.
                _receiveBalances[to] += value;
                _receiveBalances[from] -= value;
            }
        }
        emit Transfer(from, to, value);
    }

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
        require(fromBalance >= value, "ERC20: transfer amount exceeds balance");
        uint256 key = _getFirstUnexpiredBlockBalance(
            _sender.list.ascending(),
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
                _recipient.list.insert(key);
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
        unchecked {
            for (uint256 era = fromEra; era <= toEra; era++) {
                uint8 startSlot = (era == fromEra) ? fromSlot : 0;
                uint8 endSlot = (era == toEra) ? toSlot : 3;
                for (uint8 slot = startSlot; slot <= endSlot; slot++) {
                    if (value == 0) {
                        break;
                    }
                    value = _transferFromSlot(from, to, value, era, slot);
                }
            }
        }
        require(value == 0, "ERC20: transfer amount exceeds balance");
    }

    function _transferFromSlot(
        address from,
        address to,
        uint256 remainingValue,
        uint256 era,
        uint8 slot
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
                        _recipient.list.insert(blockKey);
                        remainingValue = 0;
                        break;
                    } else {
                        _sender.blockBalances[blockKey] = 0;
                        _recipient.blockBalances[blockKey] += blockBalance;
                        _recipient.slotBalance += blockBalance;
                        _sender.list.remove(blockKey);
                        _recipient.list.insert(blockKey);
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
        require(to != address(0), "ERC20: mint to the zero address");
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 currentEra, uint8 currentSlot) = _slidingWindow.calculateEraAndSlot(blockNumberCache);
        Slot storage _recipient = _retailBalances[to][currentEra][currentSlot];
        unchecked {
            _recipient.slotBalance += value;
            _recipient.blockBalances[blockNumberCache] += value;
            _recipient.list.insert(blockNumberCache);
        }
        emit Transfer(address(0), to, value);
    }

    /// @notice can't mint expirable token to wholesale account.
    /// @dev burn token direct to retail account.
    /// @param to description
    /// @param value description
    function _burnRetail(address to, uint256 value) internal virtual {
        require(!_wholeSale[to], "can't burn expirable token to non retail account");
        require(to != address(0), "ERC20: burn from the zero address");
        require(balanceOf(to) >= value, "ERC20: burn amount exceeds balance");
        uint256 blockNumber = _blockNumberProvider();
        (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _slidingWindow.safeFrame(blockNumber);
        _updateRetailBalance(to, address(0), value, fromEra, toEra, fromSlot, toSlot, blockNumber);
    }

    /// @notice clear existing balance before, always perform force set receive balance to zero.
    /// @param to description
    function grantWholeSale(address to) public virtual {
        require(!_wholeSale[to], "can't grant exist wholesale");
        _wholeSale[to] = true;
        emit GrantWholeSale(to, true);
    }

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
    /// @param account The address of the account for which the balance is being queried.
    /// @return uint256 return available balance.
    function balanceOf(address account) public view override returns (uint256) {
        if (_wholeSale[account]) {
            /// @notice use _balances[account] as spendable balance and return only spendable balance.
            return _unSafeBalanceOf(account, true);
        } else {
            uint256 blockNumber = _blockNumberProvider();
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _slidingWindow.safeFrame(blockNumber);
            return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot, blockNumber);
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
            if (fromEra > toEra) {
                // handling case given invalid value always return zero.
                return 0;
            } else {
                return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot, _blockNumberProvider());
            }
        }
    }

    /// @notice transfer use safe balanceOf for lookback available balance.
    /// @param to description
    /// @return value description
    /// @custom:inefficientgasusedappetite emit 2 transfer events inefficient gas.
    /// @custom:inefficientgasusedappetite heavy check condition.
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        require(to != address(0), "ERC20: transfer to the zero address");
        address from = msg.sender;
        bool isFromWholeSale = _wholeSale[from];
        bool isToWholeSale = _wholeSale[to];
        // hook before transfer
        _beforeTokenTransfer(from, to, value);
        if (isFromWholeSale && isToWholeSale) {
            // wholesale to wholesale transfer.
            _transfer(from, to, value);
        } else {
            // declaration in else scope to avoid allocate memory for temporary variable if not need.
            uint256 blockNumber = _blockNumberProvider();
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _slidingWindow.safeFrame(blockNumber);
            if (isFromWholeSale && !isToWholeSale) {
                // consolidate by burning wholesale spendable balance and mint expirable to retail balance.
                _burn(from, value);
                _mintRetail(to, value);
            }
            if (!isFromWholeSale && isToWholeSale) {
                // consolidate by burning retail balance and mint non-expirable to whole receive balance.
                _burnRetail(from, value);
                _mintWholeSale(to, value, false);
            }
            if (!isFromWholeSale && !isToWholeSale) {
                _updateRetailBalance(from, to, value, fromEra, toEra, fromSlot, toSlot, blockNumber);
            }
        }
        // hook after transfer
        _afterTokenTransfer(from, to, value);
        return true;
    }

    /// @notice overriding function transferFrom
    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, value);
        transfer(to, value);
        return true;
    }

    /// @dev return is given address is whole sale address.
    /// @return bool return boolean.
    function wholeSale(address account) public view returns (bool) {
        return _wholeSale[account];
    }

    function tokenList(address account, uint256 era, uint8 slot) public view returns (uint256[] memory) {
        return _retailBalances[account][era][slot].list.ascending();
    }

    /// @notice due to token can expiration there is no actaul totalSupply.
    /// @return uint256 ZERO value.
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

    function slotPerEra() external pure override returns (uint8) {
        return SlidingWindow.getSlotPerEra();
    }
}
