// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP abstract contract
/// @author ERC20EXP <erc20exp@protonmail.com>

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "./interfaces/IERC20EXP.sol";
// import  "./abstracts/Calendar.sol';

// @note Change to abstract class so it's can be re-use.
// @TODO uncomment to  make it to abstract contract
// abstract contract ERC20Expirable is Calendar, ERC20, IERC20EXP {
contract ERC20Expirable is ERC20 {
    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        uint256[] blockIndexed;
    }

    enum TRANSCTION_TYPES {
        DEFAULT,
        MINT,
        BURN
    }

    // contract constant variables.
    // 18 bytes for constant variables
    uint8 private constant SLOT_PER_ERA = 8;
    uint8 private constant MINIMUM_EXPIRE_PERIOD_SLOT = 1;
    uint16 private constant MAXIMUM_EXPIRE_PERIOD_SLOT = 16;
    uint16 private constant MINIMUM_BLOCKTIME_IN_MILLI_SECONDS = 1; // 1 milliseconds.
    uint32 private constant MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS = 600_000; // 10 minutes.
    uint64 private constant YEAR_IN_MILLI_SECONDS = 31_556_926_000;

    // contract global variables.
    uint256 private immutable _startBlockNumber;

    mapping(address => bool) private _wholeSale;
    mapping(address => uint256) private _receiveBalances;
    mapping(address => mapping(uint256 => mapping(uint8 => Slot))) private _retailBalances;

    // contract configuration variables.
    uint8 private _expirePeriod;
    // @TODO uint64 is enough cause it can fit wrost case 1 ms 31,556,926,000 block per year.
    uint256 private _blockPerYear;

    constructor(
        uint16 blockTime_,
        uint8 expirePeriod_,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        _startBlockNumber = blockNumberProvider(); // initialize contract
        _updateBlockPerYear(blockTime_); // block time
        _updateExpirePeriod(expirePeriod_); // expiration window
    }

    // ################################ private function ################################

    /// @param blockTime description
    function _updateBlockPerYear(uint16 blockTime) private {
        // @TODO uncomment
        // if (blockTime < MINIMUM_BLOCKTIME_IN_MILLI_SECONDS ||
        //         blockTime > MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS) {
        //     revert InvalidBlockPeriod();
        // }
        uint256 blockPerYearCache = _blockPerYear;
        _blockPerYear = YEAR_IN_MILLI_SECONDS / blockTime;
        // @TODO uncomment
        // emit BlockProducedPerYearUpdated(blockPerYearCache, blockTime);
    }

    /// @param expirePeriod description
    function _updateExpirePeriod(uint8 expirePeriod) private {
        // @TODO uncomment
        // if (expirePeriod < MINIMUM_EXPIRE_PERIOD_SLOT ||
        //         expirePeriod > MAXIMUM_EXPIRE_PERIOD_SLOT) {
        //     revert InvalidExpirePeriod();
        // }
        uint8 _expirePeriodCache = _expirePeriod;
        _expirePeriod = expirePeriod;
        // @TODO uncomment
        // emit TokenExpiryPeriodUpdated(periodCache, expirePeriod);
    }

    // ################################ internal function ################################

    /// @notice If there is no start block defined or blockNumber is before the contract start, return 0 era.
    /// @dev calcuate era from given blockNumber.
    /// @param blockNumber description
    /// @return uint256 return era
    function _calculateEra(uint256 blockNumber) public view virtual returns (uint256) {
        if (_startBlockNumber != 0 || blockNumber > _startBlockNumber) {
            // Calculate era based on the difference between the current block and start block
            return (blockNumber - _startBlockNumber) / _blockPerYear;
        } else {
            return 0;
        }
    }

    /// @dev calcuate slot from given blockNumber.
    /// @param blockNumber description
    /// @return uint256 return slot
    function _calculateSlot(uint256 blockNumber) public view virtual returns (uint8) {
        if (blockNumber > _startBlockNumber) {
            return uint8(((blockNumber - _startBlockNumber) % _blockPerYear) / (_blockPerYear / SLOT_PER_ERA));
        } else {
            return 0;
        }
    }

    function _calculateEraAndSlot(uint256 blockNumber) public view returns (uint256 era, uint8 slot) {
        era = _calculateEra(blockNumber);
        slot = _calculateSlot(slot);
        return (era, slot);
    }

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
            /// @custom:inefficientGasUsedAppetite heavy loop through array of blockIndexed in wrostcase
            return _balanceCache;
        }
    }

    function _totalBlockBalance(address account, uint256 era, uint8 slot) public view returns (uint256) {
        Slot storage s = _retailBalances[account][era][slot];
        uint256 blockIndexedLength = s.blockIndexed.length;

        // If the length is equal to zero then skip the entire slot and return zero as output.
        if (blockIndexedLength == 0) {
            return 0;
        }

        uint256 blockNumberCache = blockNumberProvider();
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
        // // Calculate the total balance using only the valid blocks.
        uint256 balanceCache = 0;
        for (uint256 i = high + 1; i < blockIndexedLength; i++) {
            balanceCache += s.blockBalances[s.blockIndexed[i]];
        }
        /// @custom:inefficientGasUsedAppetite heavy loop through array of blockIndexed in wrostcase
        return balanceCache;
    }

    /// @dev return available balance from given account, eras, and slots.
    /// @return fromEra The starting era for the balance lookup.
    /// @return toEra The ending era for the balance lookup.
    /// @return fromSlot The starting slot within the starting era for the balance lookup.
    /// @return toSlot The ending slot within the ending era for the balance lookup.
    function _safePagination() public view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        uint256 blockNumberCache = blockNumberProvider();
        (toEra, toSlot) = _calculateEraAndSlot(blockNumberCache);

        // Calculate the expiration period in blocks
        uint256 expirePeriodInBlockLength = expirationPeriodInBlockLength();

        // Calculate the starting block for the expiration period
        uint256 expirationStartBlock;
        if (blockNumberCache >= expirePeriodInBlockLength) {
            // If the current block is beyond the expiration period
            expirationStartBlock = blockNumberCache - expirePeriodInBlockLength;
        } else {
            // If the current block is within the expiration period
            expirationStartBlock = 0;
        }

        // Determine the starting era and slot based on the expiration start block
        if (expirationStartBlock >= blockPerEra()) {
            (fromEra, fromSlot) = _calculateEraAndSlot(expirationStartBlock);
        } else {
            fromEra = 0;
            fromSlot = uint8(expirationStartBlock % blockPerEra());
        }

        // Add buffer slot
        if (fromEra != 0 && fromSlot != 0) {
            if (fromSlot > 0) {
                fromSlot--;
            } else {
                fromEra--;
                fromSlot = 7;
            }
        }

        return (fromEra, toEra, fromSlot, toSlot);
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
        uint256 blockNumberCache = blockNumberProvider();
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
        (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) = _safePagination();
        _updateRetailBalance(to, address(0), value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.BURN);
    }

    /// @notice _receiveBalances[] can't use be same as spendable balance.
    /// @param from description
    /// @param to description
    /// @param value description
    function _updateReceiveBalance(address from, address to, uint256 value) internal virtual {
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
            uint256 blockNumberCache = blockNumberProvider();
            Slot storage slot = _retailBalances[to][toEra][toSlot];
            {
                slot.slotBalance += value;
                slot.blockBalances[blockNumberCache] += value;
                slot.blockIndexed.push(blockNumberCache);
            }
        } else {
            uint256 balanceCache = balanceOf(from);
            if (balanceCache < value) {
                revert();
            }
            if (txTypes == TRANSCTION_TYPES.DEFAULT) {
                // @TODO search for first usable balance
                // @TODO sort index at to address
                // for (fromEra; fromEra < toEra; i++) {
                //     Slot storage sform  = retailBalances[from][fromEra][fromSlot];
                //     Slot storage sloto = retailBalances[to][fromEra][fromSlot];
                // MUST BE first in first out (FIFO)
                // if buffer slot cant contain value and not move to next slot or next era {
                //  sfrom.slotBalance -= value;
                //  sto.slotBalnce += value;
                //  sto.blockIndexed[index] = sfrom.blockIndexed[index];
                // }
                // if buffer slot can't contain all value move to next slot or next era {
                // sfrom.slotBalance -= value;
                // sto.slotBalnce += value;
                // move entrie slot if consume all slot balance
                // sto.blockIndexed= sfrom.blockIndexed;
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
                        Slot storage slotFrom = _retailBalances[from][era][slot];
                        Slot storage slotTo = _retailBalances[to][era][slot];
                        // @todo find first valid balance then action
                        // Deduct balance from `from` and add to `to`
                        // slotFrom.slotBalance is all balance including valid and invalid balance
                        if (slotFrom.slotBalance >= value) {
                            slotFrom.slotBalance -= value;
                        } else {
                            value -= slotFrom.slotBalance;
                            slotFrom.slotBalance = 0; // consume all slot balance
                            /// @custom:dataIntegrityErrorAppetite ignore to move blockIndexed to address(0) for saving gas
                        }
                    }
                }
            }
        }
        emit Transfer(from, to, value);
    }

    // ################################ external function ################################

    // not exist yet

    // ################################ public function ################################

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
                return 0;
            }
        }
    }

    /// @notice transfer use safe balanceOf for lookback available balance.
    /// @param to description
    /// @return value description
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        address from = msg.sender;
        // @TODO _beforeTransfer(from, to, amount);
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
                /// @custom:inefficientGasUsedAppetite emit 2 transfer events inefficient gas.
            }
            // @TODO retail to wholesale transfer.
            if (!_wholeSale[from] && _wholeSale[to]) {
                // consolidate by burning retail balance and mint non-expirable to whole receive balance.
                _updateRetailBalance(from, address(0), value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.BURN);
                _updateReceiveBalance(from, to, value);
                /// @custom:inefficientGasUsedAppetite emit 2 transfer events inefficient gas.
            }
            // @TODO retail to retail transfer.
            if (!_wholeSale[from] && !_wholeSale[to]) {
                _updateRetailBalance(from, to, value, fromEra, toEra, fromSlot, toSlot, TRANSCTION_TYPES.DEFAULT);
            }
            /// @custom:inefficientGasUsed reduce heavy check condition.
        }
        // @TODO _afterTransfer(from, to, value);
        return true;
    }

    /// @notice overriding function balanceOf
    // function transferFrom(address from, address to, uint256 value) public override return (bool) {
    //     address spender = msg.sender;
    //     _spendAllowance(from, spender, value);
    //     @TODO check who is msg.sender
    //     transfer(to, value);
    //     return true;
    // }

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

    /// @notice blockNunber provider can be override in case using L2 solution that block time is sub seconds.
    /// @return uint256 current blocknumber.
    function blockNumberProvider() public view virtual returns (uint256) {
        return block.number;
    }

    /// @return uint256 amount of blocks per era.
    function blockPerEra() public view returns (uint256) {
        return _blockPerYear;
    }

    /// @return uint256 amount of blocks per slot.
    function blockPerSlot() public view returns (uint256) {
        return _blockPerYear / SLOT_PER_ERA;
    }

    /// @return uint8 length of blocks.
    function expirationPeriodInBlockLength() public view returns (uint256) {
        return blockPerSlot() * _expirePeriod;
    }

    /// @return uint8 length of slot.
    function expirationPeriodInSlotLegth() public view returns (uint256) {
        return _expirePeriod;
    }

    /// @return era cycle.
    /// @return slot of slot.
    function expirationPeriodInEraLength() public view returns (uint8 era, uint8 slot) {
        if (_expirePeriod <= SLOT_PER_ERA) {
            era = 0;
            slot = uint8(_expirePeriod);
        } else {
            era = uint8(_expirePeriod / SLOT_PER_ERA);
            slot = uint8(_expirePeriod % SLOT_PER_ERA);
        }
        return (era, slot);
    }
}
