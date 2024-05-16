// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP abstract contract
/// @author ERC20EXP <erc20exp@protonmail.com>

import "../abstracts/Calendar.sol";
import "../interfaces/IERC20EXP.sol";
import "../libraries/CircularDoublyLinkedList.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract ERC20Expirable is Calendar, ERC20, IERC20EXP {
    using CircularDoublyLinkedList for CircularDoublyLinkedList.List;

    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        CircularDoublyLinkedList.List list;
    }

    enum TRANSCTION_TYPES {
        DEFAULT,
        MINT,
        BURN
    }

    mapping(address => bool) private _wholeSale;
    mapping(address => uint256) private _receiveBalances;
    mapping(address => mapping(uint256 => mapping(uint8 => Slot))) private _retailBalances;

    // @TODO Change expirePeriod from length of slot into length of blocks
    // https://github.com/MASDXI/ERC20EXP/issues/4#issue-2234558942
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 blockNumber_,
        uint16 blockTime_,
        uint8 expirePeriod_
    ) ERC20(name_, symbol_) Calendar(blockNumber_, blockTime_, expirePeriod_) {}

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
    ) private view returns (uint256) {
        uint256 _balanceCache;
        unchecked {
            while (startSlot <= endSlot) {
                _balanceCache += _retailBalances[account][era][startSlot].slotBalance;
                startSlot++;
            }
        }
        return _balanceCache;
    }

    /// @custom:inefficientgasusedappetite heavy loop through array of blockindexed in wrostcase
    function _bufferSlotBalance(address account, uint256 era, uint8 slot) private view returns (uint256) {
        Slot storage s = _retailBalances[account][era][slot];
        // If the latest block is zero or outside the expiration period, skip entrie slot return 0.
        uint256 lastestBlockCache = s.list.tail();
        if (lastestBlockCache == 0) {
            return 0;
        }
        uint256 blockNumberCache = _blockNumberProvider();
        uint256 expirationPeriodInBlockLengthCache = expirationPeriodInBlockLength();
        if (blockNumberCache - lastestBlockCache >= expirationPeriodInBlockLengthCache) {
            return 0;
        }
        uint256[] memory tmpList = s.list.ascendingList();
        uint256 key = _getFirstUnexpiredBlockBalance(tmpList, blockNumberCache, expirationPeriodInBlockLengthCache);
        // perfrom resize to zero reuse the array memory variable
        assembly {
            mstore(tmpList, 0)
        }
        // Calculate the total balance using only the valid blocks.
        tmpList = s.list.partitionListGivenToLast(key);
        if (tmpList.length == 0) {
            return 0;
        }
        uint256 balanceCache;
        unchecked {
            for (uint256 i = 0; i < tmpList.length; i++) {
                key = tmpList[i];
                balanceCache += s.blockBalances[key];
            }
        }
        return balanceCache;
    }

    // if first index invalid move next till found valid key return index as key.
    function _getFirstUnexpiredBlockBalance(
        uint256[] memory list,
        uint256 blockNumberCache,
        uint256 expirationPeriodInBlockLengthCache
    ) private pure returns (uint256) {
        uint256 key;
        unchecked {
            for (uint256 i = 0; i < list.length; i++) {
                uint256 value = list[i];
                // stop loop when found. always start form head because list is sorted before.
                if (blockNumberCache - value <= expirationPeriodInBlockLengthCache) {
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
    /// @return uint256 The available balance.
    function _lookBackBalance(
        address account,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot
    ) internal view returns (uint256) {
        if (fromEra == 0 && toEra == 0) {
            return _bufferSlotBalance(account, 0, 0);
        } else {
            uint256 _balanceCache;
            // totalBlockBalance calcurate only buffer era/slot.
            // keep it simple stupid first by spliting into 3 part then sum.
            // part1: calulate balance at fromEra in naive in naive way O(n)
            unchecked {
                for (uint8 slot = fromSlot; slot < 4; slot++) {
                    if (slot == fromSlot) {
                        _balanceCache += _bufferSlotBalance(account, fromEra, slot);
                    } else {
                        _balanceCache += _retailBalances[account][fromEra][slot].slotBalance;
                    }
                }
            }
            // part2: calulate balance betaween fromEra and toEra in naive way O(n)
            unchecked {
                for (uint256 era = fromEra + 1; era < toEra; era++) {
                    _balanceCache += _slotBalance(account, era, 0, 4);
                }
            }
            // part3:calulate balance at toEra in navie way O(n)
            _balanceCache += _slotBalance(account, toEra, 0, toSlot);
            return _balanceCache;
        }
    }

    /// @notice _receiveBalances[] can't use be same as spendable balance.
    /// @param from description
    /// @param to description
    /// @param value description
    function _updateReceiveBalance(address from, address to, uint256 value) private {
        if (from == address(0)) {
            // mint non-expirable token to receive balance.
            _receiveBalances[to] += value;
        } else {
            // @TODO handle revert if exceed balance.
            if (to == address(0)) {
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

    /// @custom:dataintegrityerrorappetite ignore to insert operation on address(0) for saving gas
    function _updateRetailBalance(
        address from,
        address to,
        uint256 value,
        uint256 fromEra,
        uint256 toEra,
        uint8 fromSlot,
        uint8 toSlot,
        TRANSCTION_TYPES txTypes
    ) private {
        uint256 blockNumberCache = _blockNumberProvider();
        if (txTypes == TRANSCTION_TYPES.MINT) {
            // v4.8 openzeppelin errror msg
            require(to != address(0), "ERC20: mint to the zero address");
            Slot storage slot = _retailBalances[to][toEra][toSlot];
            slot.slotBalance += value;
            slot.blockBalances[blockNumberCache] += value;
            slot.list.insert(blockNumberCache, abi.encodePacked(""));
            emit Transfer(from, to, value);
            return;
        }
        uint256 fromBalance = balanceOf(from);
        uint256 expirationPeriodInBlockLengthCache = expirationPeriodInBlockLength();
        if (txTypes == TRANSCTION_TYPES.DEFAULT) {
            // v4.8 openzeppelin errror msg
            require(fromBalance >= value, "ERC20: transfer amount exceeds balance");
            require(to != address(0), "ERC20: transfer to the zero address");
            // @TODO avoid code if possible duplicate in DEFAULT and BURN it's
            // can be refactor to increase maintainability balancing optimization and maintain
            Slot storage sFrom = _retailBalances[from][fromEra][fromSlot];
            Slot storage sTo = _retailBalances[to][fromEra][fromSlot];
            uint256 bufferSlotBalanceCache = _bufferSlotBalance(from, fromEra, fromSlot);
            uint256 key = _getFirstUnexpiredBlockBalance(
                sFrom.list.ascendingList(),
                blockNumberCache,
                expirationPeriodInBlockLengthCache
            );
            // if buffer slot can't contain all value move to next slot or next era
            if (bufferSlotBalanceCache < value) {
                // @TODO CDLLS MUST BE first in first out (FIFO) and utilizing sorted list.
            }
            // if buffer slot greater than value not move to next slot or next era deduct balance.
            if (bufferSlotBalanceCache > value) {
                sFrom.blockBalances[key] -= value;
                sTo.blockBalances[key] += value;
                sTo.list.insert(key, abi.encodePacked(""));
            }
            // if buffer slot can contain all value not move to next slot or next era.
            if (bufferSlotBalanceCache == value) {
                sFrom.blockBalances[key] = 0;
                sFrom.list.remove(key);
                sTo.blockBalances[key] += value;
                sTo.list.insert(key, abi.encodePacked(""));
            }
            emit Transfer(from, to, value);
            return;
        }
        if (txTypes == TRANSCTION_TYPES.BURN) {
            // v4.8 openzeppelin errror msg
            require(fromBalance >= value, "ERC20: burn amount exceeds balance");
            require(from != address(0), "ERC20: burn from the zero address");
            // it's completely black hole when perform burn not update data on address(0)
            // address(0) not require to insert into list
            Slot storage sFrom = _retailBalances[from][fromEra][fromSlot];
            uint256 bufferSlotBalanceCache = _bufferSlotBalance(to, fromEra, fromSlot);
            uint256 key = _getFirstUnexpiredBlockBalance(
                sFrom.list.ascendingList(),
                blockNumberCache,
                expirationPeriodInBlockLengthCache
            );
            if (bufferSlotBalanceCache < value) {
                // @TODO CDLLS MUST BE first in first out (FIFO) and utilizing sorted list.
            }
            if (bufferSlotBalanceCache > value) {
                // if buffer slot can contain all value not move to next slot or next era.
                sFrom = _retailBalances[from][fromEra][fromSlot];
                sFrom.blockBalances[key] -= value;
            }
            if (bufferSlotBalanceCache == value) {
                // if buffer slot can contain all value not move to next slot or next era.
                sFrom = _retailBalances[from][fromEra][fromSlot];
                sFrom.blockBalances[key] = 0;
                sFrom.list.remove(key);
            }
            emit Transfer(from, to, value);
            return;
        }
    }

    /// @notice can't mint non-expirable token to non wholesale account.
    /// @dev minting new token direct to wholesale account.
    /// @param to description
    /// @param value description
    /// @param spendable true if want to mint to spendable balance false if want to mint to receive balance
    function _mintWholeSale(address to, uint256 value, bool spendable) internal virtual {
        require(!_wholeSale[to], "can't mint non-expirable token to non wholesale account");
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
        require(!_wholeSale[to], "can't burn non-expirable token to non wholesale account");
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
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 _currentEra, uint8 _currentSlot) = _calculateEraAndSlot(blockNumberCache);
        _updateRetailBalance(address(0), to, value, 0, _currentEra, 0, _currentSlot, TRANSCTION_TYPES.MINT);
    }

    /// @notice can't mint expirable token to wholesale account.
    /// @dev burn token direct to retail account.
    /// @param to description
    /// @param value description
    function _burnRetail(address to, uint256 value) internal virtual {
        require(!_wholeSale[to], "can't burn expirable token to non retail account");
        (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safePagination();
        _updateRetailBalance(to, address(0), value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.BURN);
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
            return super.balanceOf(account);
        } else {
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safePagination();
            return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot);
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
                return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot);
            }
        }
    }

    /// @notice transfer use safe balanceOf for lookback available balance.
    /// @param to description
    /// @return value description
    /// @custom:inefficientgasusedappetite emit 2 transfer events inefficient gas.
    /// @custom:inefficientgasusedappetite heavy check condition.
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        address from = msg.sender;
        bool isFromWholeSale = _wholeSale[from];
        bool isToWholeSale = _wholeSale[to];
        // hook before transfer
        _beforeTokenTransfer(from, to, value);
        if (isFromWholeSale && isToWholeSale) {
            // wholesale to wholesale transfer.
            _transfer(from, to, value);
        } else {
            // declaration in else scope to avoid allocate memory for temporay varialbe if not need.
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safePagination();
            if (isFromWholeSale && !isToWholeSale) {
                // consolidate by burning wholesale spendable balance and mint expirable to retail balance.
                _burn(from, value);
                _updateRetailBalance(address(0), to, value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.MINT);
            }
            if (!isFromWholeSale && isToWholeSale) {
                // consolidate by burning retail balance and mint non-expirable to whole receive balance.
                _updateRetailBalance(from, address(0), value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.BURN);
                _updateReceiveBalance(from, to, value);
            }
            if (!isFromWholeSale && !isToWholeSale) {
                _updateRetailBalance(from, to, value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.DEFAULT);
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
}
