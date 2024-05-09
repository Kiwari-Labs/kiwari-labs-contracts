// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP abstract contract
/// @author ERC20EXP <erc20exp@protonmail.com>

import "../abstracts/Calendar.sol";
import "../interfaces/IERC20EXP.sol";
// import "../libraries/CircularDoublyLinkedList.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract ERC20Expirable is Calendar, ERC20, IERC20EXP {
    // @TODO make CDLLS into lib
    // using CircularDoublyLinkedList for CircularDoublyLinkedList;

    // struct CDLLS  {
    //     mapping(uint256 => Node) nodes;
    //     uint256 head;
    //     uint256 middle;
    //     uint256 tail;
    //     uint256 size;
    // }

    // struct Slot {
    //     uint256 slotBalance;
    //     mapping(uint256 => uint256) blockBalances;
    //     uint256[] blockIndexed;
    //     // @TODO use list instead of array;
    //     CDLLS list;
    // }

    // enum TRANSCTION_TYPES { DEFAULT, MINT, BURN }

    mapping(address => bool) private _wholeSale;
    mapping(address => uint256) private _receiveBalances;
    mapping(address => mapping(uint256 => mapping(uint8 => Slot)))
        private _retailBalances;

    // @TODO Change expirePeriod from length of slot into length of blocks
    // url: https://github.com/MASDXI/ERC20EXP/issues/4#issue-2234558942
    constructor(string memory name_, string memory symbol_, uint256 blockNumber_, uint16 blockTime_, uint8 expirePeriod_)
        ERC20(name_, symbol_) 
        Calendar(blockNumber_, blockTime_, expirePeriod_) {
    }

    /// @notice always return 0 for non-wholesael account.
    /// @dev return available balance from given account.
    /// @param account The address of the account for which the balance is being queried.
    /// @param unsafe The boolean flag for select which balance type is being queried.
    /// @return uint256 return available balance.
    function _unSafeBalanceOf(address account, bool unsafe) internal virtual view returns (uint256) {
        if (unsafe) {
            return _receiveBalances[account] + super.balanceOf(account) ;
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
            return _totalBlockBalance(account, 0, 0);
        } else {
            uint256 _balanceCache;
            // totalBlockBalance calcurate only buffer era/slot
            // KISS keep it simple stupid first
            // calulate balance at fromEra
            for (uint8 slot = fromSlot; fromSlot <= 7; slot++) {
                if (slot == fromSlot) {
                    _balanceCache += _totalBlockBalance(account, fromEra, slot);
                } else {
                    _balanceCache += _retailBalances[account][fromEra][slot].slotBalance;
                }
            }
            // calulate balance betaween fromEra and toEra
            for (uint256 era = fromEra + 1; era < toEra; era++) {
                for (uint8 slot = 0; slot <= 7; slot++) {
                    _balanceCache += _retailBalances[account][era][slot].slotBalance;
                }
            }
            // calulate balance at toEra
            for (uint8 slot = 0; slot <= toSlot; slot++) {
                _balanceCache += _retailBalances[account][toEra][slot].slotBalance;
            }
            return _balanceCache;
        }
    }

    /// @custom:inefficientgasusedappetite heavy loop through array of blockindexed in wrostcase
    function _totalBlockBalance(address account, uint256 era, uint8 slot) public view returns (uint256) {
        Slot storage s = _retailBalances[account][era][slot];
        // @TODO
        // CDLLS Change length fron array length into size of list
        // uint256 blockIndexedLength = s.list.size;
        uint256 blockIndexedLength = s.blockIndexed.length;

        // If the length is equal to zero then skip the entire slot and return zero as output.
        if (blockIndexedLength == 0) {
            return 0;
        }

        uint256 blockNumberCache = _blockNumberProvider();
        // @TODO
        // CDLLS change to check tail instead of last index
        // uint256 lastestBlockCache = s.list.tail;
        uint256 lastestBlockCache = s.blockIndexed[blockIndexedLength - 1];

        // If the latest block is outside the expiration period, skip entrie slot return 0.
        if (blockNumberCache - lastestBlockCache >= expirationPeriodInBlockLength()) {
            return 0;
        }
        // Perform binary search to find the index of the first expired block.
        uint256 low = 0;
        uint256 high = blockIndexedLength - 1;
        uint256 mid;
        while (low <= high) {
            mid = (low + high) / 2;
            if (blockNumberCache - s.blockIndexed[mid] <= expirationPeriodInBlockLength()) {
                if (mid == 0) {
                    break; // Stop the loop if mid is already zero
                }
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        // @TODO
        // CDLLS Perform change search to find the index of the fisrst expire block.
        // uint256 low = s.list.head;
        // uint256 high = s.list.tail;
        // uint256 mid = s.list.middle;
        // uint256 tmpSize = 0;
        // while (low <= high) {
        //     mid = (low + high) / 2;
        //     if (blockNumberCache - s.blockIndexed[middle] <= expirationPeriodInBlockLength()) {
        //         if (mid == 0) {
        //             break; // Stop the loop if mid is already zero
        //         }
        //         high = mid - 1;
        //     } else {
        //         low = mid + 1;
        //     }
        //     tmpSize++;
        // }

        // Calculate the total balance using only the valid blocks.
        uint256 balanceCache = 0;
        for (uint256 i = high + 1; i < blockIndexedLength; i++) {
            balanceCache += s.blockBalances[s.blockIndexed[i]];
        }

        // @TODO
        // CDLLS Calculate the total balance using only the valid blocks.
        // uint256 index = <start>;
        // uint256 tmpSize = _size;
        // for (uint256 i = 0; i < tmpSize; i++) {
        //     balanceCache += _nodes[index].next;
        //     index = _nodes[index].next;
        // }
        return balanceCache;
    }

    /// @notice can't mint non-expirable token to non wholesale account.
    /// @dev minting new token direct to wholesale account.
    /// @param to description
    /// @param value description
    /// @param spendable true if want to mint to spendable balance false if want to mint to receive balance
    // @TODO change to internal function
    function _mintWholeSale(address to, uint256 value, bool spendable) external {
        // @TODO uncomment
        // if (!wholeSale[to]) {
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
        _updateRetailBalance(address(0), to, value, 0  , _currentEra, 0, _currentSlot, TRANSCTION_TYPES.MINT);
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
        _updateRetailBalance(to, address(0), value, fromEra , toEra , fromSlot, toSlot, TRANSCTION_TYPES.BURN);
    }
    
    /// @notice _receiveBalances[] can't use be same as spendable balance.
    /// @param from description
    /// @param to description
    /// @param value description
    function _updateReceiveBalance(
        address from,
        address to,
        uint256 value
    ) internal virtual {
        if (from == address(0)) {
            // mint
            _receiveBalances[to] += value;
        } else {
            // revert if not enough
            if (to == address(0)) {
                // burn
                _receiveBalances[from] -= value;
            } else {
                _receiveBalances[to] += value;
                _receiveBalances[from] -= value;
            }
        }
        emit Transfer(from, to, value);
    }

    /// @custom:dataintegrityerrorappetite ignore to move blockIndexed to address(0) for saving gas
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
        if (txTypes == TRANSCTION_TYPES.MINT) {
            uint256 blockNumberCache = _blockNumberProvider();
            Slot storage slot = _retailBalances[to][toEra][toSlot];
            {
                slot.slotBalance += value;
                slot.blockBalances[blockNumberCache] += value;
                slot.blockIndexed.push(blockNumberCache);
                // @TODO
                // CDLLS
                // insert(blockNumberCache);
                // slot.list.nodes[blockNumbeCache];
            }
        } else  {
            uint256 balanceCache = balanceOf(from);
            // if (balanceCache < value) {
            //     revert ERC20InsufficientBalance();
            // }
            if (txTypes == TRANSCTION_TYPES.DEFAULT) {
            // @TODO search for first usable balance
            // @TODO sort index at to address 
            // CDLLS MUST BE first in first out (FIFO) and utilizing sorted list
            // for (fromEra; fromEra < toEra; i++) {                
                // Slot storage sForm  = retailBalances[from][fromEra][fromSlot];
                // Slot storage sTo = retailBalances[to][fromEra][fromSlot];
                // if buffer slot can contain value and not move to next slot or next era {
                //  sFrom.slotBalance -= value;
                //  sTo.slotBalance += value;
                //  sTo.blockIndexed[index] = sfrom.blockIndexed[index];
                //  delete sfrom.list.nodes[index];
                //  sTo.list.nodes[index];
                // }
                // if buffer slot can't contain all value move to next slot or next era {
                    // sfrom.slotBalance -= value;
                    // sto.slotBalance += value;
                    // move entrie slot if consume all slot balance
                    // sto.blockIndexed= sfrom.blockIndexed;
                    // move to next
                    // sfrom.list.nodes[index].next;
                // }
            // }
            //    _retailBalances[from][fromEra][fromSlot].slotBalance += value;
            //    _retailBalances[from][fromEra][fromSlot].blockBalances[blockNumber] += value;
            } 
            if (txTypes == TRANSCTION_TYPES.BURN) {
                // Loop through eras and slots
                for (uint256 era = fromEra; era <= toEra; era++) {
                    // every era contain 4 slots start slot is 0 and end slot is 3
                    for (uint8 slot = fromSlot; slot <= 7; slot++) {
                        Slot storage sFrom = _retailBalances[from][era][slot];
                        Slot storage sTo = _retailBalances[to][era][slot];
                        // @TODO search for first usable balance
                        // @TODO sort index at to address 
                        // CDLLS MUST BE first in first out (FIFO) and utilizing sorted list
                        // Deduct balance from `from` and add to `to`
                        // sFrom.slotBalance is all balance including valid and invalid balance
                        if (sFrom.slotBalance >= value) {
                            sFrom.slotBalance -= value; // deduct balance
                            sTo.slotBalance += value;   // addition balance
                            // deduct balance of block balance 
                            // if current valid blockNumber not cover the value
                            // delete empty blockBalance then move to next bloackBalance till match value
                            // sFrom.blockBalances[] -= value;
                        } else {
                            value -= sFrom.slotBalance;
                            sFrom.slotBalance = 0;    // consume all slot balance
                            sTo.slotBalance += value; // addition balance
                            // delete node in list.
                        }
                    }
                }
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
        uint256 receiveBalance =_receiveBalances[to];
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
                return 0;
            }
        }
    }

    /// @notice transfer use safe balanceOf for lookback available balance.
    /// @param to description
    /// @return value description
    /// @custom:inefficientgasusedappetite emit 2 transfer events inefficient gas.
    /// @custom:inefficientgasusedappetite heavy check condition.
    function transfer(
        address to,
        uint256 value
    ) public virtual override returns (bool) {
        address from = msg.sender;
        // hook before transfer
        // _beforeTokenTransfer(from, to, amount);
        if (_wholeSale[from] && _wholeSale[to]) {
            // wholesale to wholesale transfer.
            _transfer(from, to, value);
        } else {
            // declaration in else scope to avoid allocate memory for temporay varialbe if not need.
            (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safePagination();
            // @TODO wholesale to retail transfer.
            if (_wholeSale[from] && !_wholeSale[to]) {
                // consolidate by burning wholesale spendable balance and mint expirable to retail balance.
                _burn(from, value);
                _updateRetailBalance(address(0), to, value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.MINT);
            }
            // @TODO retail to wholesale transfer.
            if (!_wholeSale[from] && _wholeSale[to]) {
                // consolidate by burning retail balance and mint non-expirable to whole receive balance.
                _updateRetailBalance(from, address(0), value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.BURN);
                _updateReceiveBalance(from, to, value);
                // @TODO retail to retail transfer.
                if (!_wholeSale[from] && !_wholeSale[to]) {
                    _updateRetailBalance(from, to, value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.DEFAULT);
                }
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
    // function _beforeTokenTransfer(address from, address to, uint amount) internal virtual {};

    /// @notice abstract function
    // function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {};

}