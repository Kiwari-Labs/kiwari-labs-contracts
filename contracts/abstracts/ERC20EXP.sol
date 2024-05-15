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
    function _unSafeBalanceOf(address account, bool unsafe) internal view virtual returns (uint256) {
        if (unsafe) {
            return _receiveBalances[account] + super.balanceOf(account);
        } else {
            return super.balanceOf(account);
        }
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
    ) public view returns (uint256) {
        if (fromEra == 0 && toEra == 0) {
            return _bufferSlotBalance(account, 0, 0);
        } else {
            uint256 _balanceCache;
            // totalBlockBalance calcurate only buffer era/slot.
            // KISS keep it simple stupid first by spliting into 3 part then sum.
            // part1: calulate balance at fromEra in naive in naive way O(n)
            for (uint8 slot = fromSlot; slot < 4; slot++) {
                if (slot == fromSlot) {
                    _balanceCache += _bufferSlotBalance(account, fromEra, slot);
                } else {
                    _balanceCache += _retailBalances[account][fromEra][slot].slotBalance;
                }
            }
            // part2: calulate balance betaween fromEra and toEra in naive way O(n)
            for (uint256 era = fromEra + 1; era < toEra; era++) {
                _balanceCache += _slotBalance(account, era, 0, 4);
            }
            // part3:calulate balance at toEra in navie way O(n)
            _balanceCache += _slotBalance(account, toEra, 0, toSlot);
            return _balanceCache;
        }
    }

    function _slotBalance(
        address account,
        uint256 era,
        uint8 startSlot,
        uint8 endSlot
    ) internal view returns (uint256) {
        uint256 _balanceCache;
        for (uint8 slot = startSlot; slot <= endSlot; slot++) {
            _balanceCache += _retailBalances[account][era][slot].slotBalance;
        }
        return _balanceCache;
    }

    /// @custom:inefficientgasusedappetite heavy loop through array of blockindexed in wrostcase
    function _bufferSlotBalance(address account, uint256 era, uint8 slot) public view returns (uint256) {
        Slot storage s = _retailBalances[account][era][slot]; // storage pointer 1
        uint256 blockIndexedLength = s.list.length(); // cache the 'length' of list it in the memory
        // If the length is equal to zero then skip the entire slot and return zero as output.
        if (blockIndexedLength == 0) {
            return 0;
        }
        uint256 blockNumberCache = _blockNumberProvider();
        uint256 lastestBlockCache = s.list.last();
        uint256 expirationPeriodInBlockLengthCache = expirationPeriodInBlockLength();
        // If the latest block is outside the expiration period, skip entrie slot return 0.
        if (blockNumberCache - lastestBlockCache >= expirationPeriodInBlockLengthCache) {
            return 0;
        }
        uint256[] memory tmpList = s.list.ascendingList();
        uint256 key = _getFirstValidOfList(tmpList, blockNumberCache, expirationPeriodInBlockLengthCache);
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
        for (uint256 i = 0; i < tmpList.length; i++) {
            key = tmpList[i];
            balanceCache += s.blockBalances[key];
        }
        return balanceCache;
    }

    //
    // if first index valid and return offset of usable key entire list are valid return first index as key offset.
    // if first index invalid move next till found valid key return index as key offset.
    function _getFirstValidOfList(
        uint256[] memory list,
        uint256 blockNumberCache,
        uint256 expirationPeriodInBlockLengthCache
    ) internal pure returns (uint256) {
        uint256 key;
        for (uint256 i = 0; i < list.length; i++) {
            uint256 value = list[i];
            if (blockNumberCache - value <= expirationPeriodInBlockLengthCache) {
                key = value;
                break;
            }
        }
        return key;
    }

    /// @notice can't mint non-expirable token to non wholesale account.
    /// @dev minting new token direct to wholesale account.
    /// @param to description
    /// @param value description
    /// @param spendable true if want to mint to spendable balance false if want to mint to receive balance
    // @TODO change to internal function
    function _mintWholeSale(address to, uint256 value, bool spendable) external {
        // @TODO uncomment
        // if (!wholeSale[to] ?) {
        //  revert notWholeSale(to);
        // }
        // if (value == 0) {
        //  revert mintZero(to);
        // }
        // @TODO not let to mint zero value
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
    // @TODO change to internal function
    function _burnWholeSale(address to, uint256 value, bool spendable) external {
        // @TODO uncomment
        // if (!wholeSale[to]) {
        //  revert notWholeSale(to);
        // }
        // if (value == 0) {
        //  revert burnZero(to);
        // }
        // @TODO not let to burn zero value
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
    // @TODO change to internal function
    function _mintRetail(address to, uint256 value) public {
        // @TODO uncomment
        // if (!wholeSale[to]) {
        //  revert notRetail(to);
        // }
        // if (value == 0) {
        //  revert mintZero(to);
        // }
        uint256 blockNumberCache = _blockNumberProvider();
        (uint256 _currentEra, uint8 _currentSlot) = _calculateEraAndSlot(blockNumberCache);
        _updateRetailBalance(address(0), to, value, 0, _currentEra, 0, _currentSlot, TRANSCTION_TYPES.MINT);
    }

    /// @notice can't mint expirable token to wholesale account.
    /// @dev burn token direct to retail account.
    /// @param to description
    /// @param value description
    // @TODO change to internal function
    function _burnRetail(address to, uint256 value) public {
        // @TODO uncomment
        // if (!wholeSale[to]) {
        //  revert notRetail(to);
        // }
        // if (value == 0) {
        //  revert burnZero(to);
        // }
        (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safePagination();
        _updateRetailBalance(to, address(0), value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.BURN);
    }

    /// @notice _receiveBalances[] can't use be same as spendable balance.
    /// @param from description
    /// @param to description
    /// @param value description
    function _updateReceiveBalance(address from, address to, uint256 value) internal virtual {
        if (from == address(0)) {
            // mint non-expirable token to receive balance.
            _receiveBalances[to] += value;
        } else {
            // revert if not enough
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
    ) internal virtual {
        uint256 blockNumberCache = _blockNumberProvider();
        if (txTypes == TRANSCTION_TYPES.MINT) {
            // uint256 blockNumberCache = _blockNumberProvider();
            Slot storage slot = _retailBalances[to][toEra][toSlot]; // storage pointer 1
            // {
            slot.slotBalance += value;
            slot.blockBalances[blockNumberCache] += value;
            slot.list.insert(blockNumberCache, abi.encodePacked(""));
            // }
        }
        uint256 expirationPeriodInBlockLengthCache = expirationPeriodInBlockLength();
        if (txTypes == TRANSCTION_TYPES.DEFAULT) {
            uint256 balanceCache = balanceOf(from);
            if (balanceCache < value) {
                // @TODO uncomment
                //     revert ERC20InsufficientBalance();
            }
            // @TODO search for first usable balance
            // @TODO CDLLS MUST BE first in first out (FIFO) and utilizing sorted list
            // Case
            // if buffer slot can't contain all value move to next slot or next era
            // sFrom.slotBalance -= value;
            // sFrom.list.remove[index];
            // sTo.slotBalance += value;
            // if the node from sFrom assume called 'index' not exist in sTo perform sTo.list.insert(index);
            // move entrie slot if consume all slot balance
            // sTo.blockIndexed[index] += sFrom.blockIndexed[index];
            // move to next
            // sFrom.list.nodes[index].next;
            Slot storage sFrom; // storage pointer 1
            Slot storage sTo; // storage pointer 2
            uint256 bufferSlotBalanceCache = _bufferSlotBalance(to, fromEra, fromSlot);
            // if buffer slot can't contain all value move to next slot or next era
            if (bufferSlotBalanceCache < value) {
                // lFrom = sFrom.list;
                // lTo = sTo.list;
                // move era move slot
                // for (uint256 i = fromEra; fromEra < toEra; i++) {
                //     for (uint8 slot = fromSlot; slot <= 7; slot++) {
                //         sFrom = _retailBalances[from][fromEra][fromSlot]; // change pointer of storage pointer 1
                //         sTo = _retailBalances[to][fromEra][fromSlot]; // change pointer of storage pointer 2
                //         lFrom = sFrom.list; // change pointer of storage pointer 3
                //         lTo = sTo.list; // change pointer of storage pointer 4
                //         // getKey only in buffer slot
                //         uint256 key = _getFirstValidOfList(
                //             lFrom.ascendingList(),
                //             blockNumberCache,
                //             expirationPeriodInBlockLengthCache
                //         );
                //         // if not buffer slot you can use head -> tail
                //     }
                // }
            }
            // if buffer slot greater than value not move to next slot or next era deduct balance
            if (bufferSlotBalanceCache > value) {
                sFrom = _retailBalances[from][fromEra][fromSlot];
                sTo = _retailBalances[to][fromEra][fromSlot];
                uint256 key = _getFirstValidOfList(
                    sFrom.list.ascendingList(),
                    blockNumberCache,
                    expirationPeriodInBlockLengthCache
                );
                sFrom.blockBalances[key] -= value;
                sTo.blockBalances[key] += value;
                sTo.list.insert(key, abi.encodePacked(""));
            }
            // if buffer slot can contain all value not move to next slot or next era
            if (bufferSlotBalanceCache == value) {
                sFrom = _retailBalances[from][fromEra][fromSlot];
                sTo = _retailBalances[to][fromEra][fromSlot];
                uint256 key = _getFirstValidOfList(
                    sFrom.list.ascendingList(),
                    blockNumberCache,
                    expirationPeriodInBlockLengthCache
                );
                sFrom.blockBalances[key] = 0;
                sFrom.list.remove(key);
                sTo.blockBalances[key] += value;
                sTo.list.insert(key, abi.encodePacked(""));
            }
        }
        if (txTypes == TRANSCTION_TYPES.BURN) {
            // it's completely black hole when perform burn not update data on address(0)
            // address(0) not require to insert into list
            Slot storage sFrom; // storage pointer 1
            uint256 bufferSlotBalanceCache = _bufferSlotBalance(to, fromEra, fromSlot);
            if (bufferSlotBalanceCache < value) {
                // for (uint256 era = fromEra; era <= toEra; era++) {
                //     // every era contain 4 slots start slot is 0 and end slot is 3
                //     for (uint8 slot = fromSlot; slot <= 7; slot++) {
                //         sFrom = _retailBalances[from][era][slot];
                //         sTo = _retailBalances[to][era][slot];
                //         // @TODO search for first usable balance of sender
                //         // @TODO SCDLLS MUST BE first in first out (FIFO) and utilizing sorted list
                //         // deduct balance from `from` and add to `to` which is address(0)
                //         // saving gas used by not to insert block balance to address(0)
                //         // while value not equal to 0 move to next of index
                //         if (sFrom.slotBalance >= value) {
                //             sFrom.slotBalance -= value; // deduct balance
                //             sTo.slotBalance += value; // addition balance
                //             // deduct balance of block balance
                //             // if current valid blockNumber not cover the value
                //             // delete empty blockBalance then move to next bloackBalance till match value
                //             // sFrom.blockBalances[index] -= value;
                //         } else {
                //             value -= sFrom.slotBalance;
                //             sFrom.slotBalance = 0; // consume all slot balance
                //             sTo.slotBalance += value; // addition balance
                //             // sFrom.list.remove(index);
                //         }
                //     }
                // }
            } 
            if (bufferSlotBalanceCache > value) {
                // if buffer slot can contain all value not move to next slot or next era
                sFrom = _retailBalances[from][fromEra][fromSlot];
                uint256 key = _getFirstValidOfList(
                    sFrom.list.ascendingList(),
                    blockNumberCache,
                    expirationPeriodInBlockLengthCache
                );
                sFrom.blockBalances[key] -= value;
            }
            if (bufferSlotBalanceCache == value) {
                // if buffer slot can contain all value not move to next slot or next era
                sFrom = _retailBalances[from][fromEra][fromSlot];
                uint256 key = _getFirstValidOfList(
                    sFrom.list.ascendingList(),
                    blockNumberCache,
                    expirationPeriodInBlockLengthCache
                );
                sFrom.blockBalances[key] = 0;
                sFrom.list.remove(key);
            }
        }
        emit Transfer(from, to, value);
    }

    /// @notice clear existing balance before, always perform force set receive balance to zero.
    /// @param to description
    /// @param auth description
    function setWholeSale(address to, bool auth) public virtual {
        // @TODO avoid accidentially clean all balance, change to custom error revert.
        require(_wholeSale[to] != auth, "Wholesale status unchanged");
        _wholeSale[to] = auth;
        uint256 spendableBalance = super.balanceOf(to);
        uint256 receiveBalance = _receiveBalances[to];
        if (spendableBalance != 0) {
            // clean spendable balance
            _burn(to, spendableBalance);
        }
        if (_receiveBalances[to] != 0) {
            // clean receive balance
            _updateReceiveBalance(to, address(0), receiveBalance);
        }
        // @TODO uncomment
        // emit GrantWholeSale(to, auth);
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
    ) public view returns (uint256) {
        // for whole account ignore fromEra, fromSlot, toEra and toSlot
        if (_wholeSale[account]) {
            return _unSafeBalanceOf(account, true);
        } else {
            if (fromEra <= toEra) {
                //@TODO create function unsafeLookBack;
                return _lookBackBalance(account, fromEra, toEra, fromSlot, toSlot);
            } else {
                // handling case given invalid value always return zero.
                return 0;
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
        // _beforeTokenTransfer(from, to, amount);
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
        // _afterTokenTransfer(from, to, value);
        return true;
    }

    /// @notice overriding function transferFrom
    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        address spender = msg.sender;
        _spendAllowance(from, spender, value);
        // @TODO check who is msg.sender
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
         * totalSupply will only counting spendable balance of all wholeSale account.
         */
        return 0;
    }

    /// @notice abstract function
    // function _beforeTokenTransfer(address from, address to, uint amount) internal virtual {
    //     // logic here
    // };

    /// @notice abstract function
    // function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {
    //     // logic here
    // };
}
