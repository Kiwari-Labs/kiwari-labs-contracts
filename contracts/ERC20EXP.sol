// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "./interfaces/IERC20EXP.sol";

// @note Change to abstract class so it's can be re-use.
// @TODO uncomment to  make it to abstract contract
// abstract contract ERC20Expirable is ERC20, IERC20EXP {
contract ERC20Expirable is ERC20 {
    // struct
    // can move to declare in interface file.
    struct Slot {
        uint256 slotBalance;
        mapping(uint256 => uint256) blockBalances;
        uint256 [] blockIndexed;
    }

    enum TRANSCTION_TYPES { DEFAULT, MINT, BURN }

    // contract constant variables.
    uint8 private constant MINIMUM_EXPIRE_PERIOD_SLOT = 1;
    uint8 private constant MAXIMUM_EXPIRE_PERIOD_SLOT = 8;
    uint16 private constant MINIMUM_BLOCKTIME_IN_SEC = 1;
    uint16 private constant MAXIMUM_BLOCKTIME_IN_SEC = 600; // bitcoin have longest blocktime.
    uint32 private constant YEAR_IN_SECONDS = 31_556_926;

    // contract global variables.
    uint256 private immutable _startBlockNumber;

    mapping(address => bool) private _wholeSale;
    mapping(address => uint256) private _receiveBalances;
    mapping(address => mapping(uint256 => mapping(uint8 => Slot)))
        private _retailBalances;

    // contract configuration variables.
    uint8 private _expirePeriod;
    uint256 private _blockPerYear;

    constructor(uint16 blockPeriod, uint8 expirePeriod, string memory name_, string memory symbol_)
        ERC20(name_, symbol_) {
        _startBlockNumber = block.number;  // initialize contract
        _updateBlockPerYear(blockPeriod);  // block time
        _updateExpirePeriod(expirePeriod); // expire window
    }

    // ################################ private function ################################

    /// @param blockPeriod description
    function _updateBlockPerYear(uint16 blockPeriod) private {
        // @TODO uncomment
        // if (blockPeriod < MINIMUM_EXPIRE_PERIOD_SLOT || 
        //         blockPeriod > MAXIMUM_EXPIRE_PERIOD_SLOT) {
        //     revert InvalidBlockPeriod();
        // }
        uint256 blockPerYearCache = _blockPerYear;
        _blockPerYear = YEAR_IN_SECONDS / blockPeriod;
        // @TODO uncomment
        // emit BlockProducedPerYearUpdated(blockPerYearCache, blockPeriod);
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
    function _calculateEra(
        uint256 blockNumber
    ) public view virtual returns (uint256) {
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
    function _calculateSlot(
        uint256 blockNumber
    ) public view virtual returns (uint8) {
        if (blockNumber > _startBlockNumber) {
            return
                uint8(
                    ((blockNumber - _startBlockNumber) % _blockPerYear) /
                        (_blockPerYear / 4)
                );
        } else {
            return 0;
        }
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
            _balanceCache += _totalBlockBalance(account, fromEra, fromSlot);
            // @TODO gap between fromEra, toEra sum all slot determistic size 0-4
            _balanceCache += _retailBalances[account][toEra][toSlot].slotBalance;
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

        uint256 blockNumberCache = block.number;
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
        // 7889231 index if blocktime is 1 and expire period is 1 slot receive token every 1 second
        // 1577846 index if blocktime is 5 and expire period is 1 slot receive token every 5 second
        // 788923 index if blocktime is 10 and expire period is 1 slot receive token every 10 second
        // 91 index if blocktime 1 is and expire period is 1 slot receive token every 84600 second (1day)
        // 18 index if blocktime 5 is and expire period is 1 slot receive token every 84600 second (1day)
        // 9 index if blocktime 10 is and expire period is 1 slot receive token every 84600 second (1day)
        // dynamic adjust number slot per era from given blockperiod
        // if short blockperiod increase slot per era 
        // if long blockperiod decrease slot per era
        // how ever buffer slot still 1 even slot increase or decrease
        // @note if wanted to reduce size in each slot reduce the frequent of receive token
        return balanceCache;
    }


    /// @dev return available balance from given account, eras, and slots.
    /// @return fromEra The starting era for the balance lookup.
    /// @return toEra The ending era for the balance lookup.
    /// @return fromSlot The starting slot within the starting era for the balance lookup.
    /// @return toSlot The ending slot within the ending era for the balance lookup.
    function _safePagination() public view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        uint256 blockNumberCache = block.number;
        toEra = _calculateEra(blockNumberCache);
        toSlot = _calculateSlot(blockNumberCache);
        
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
            fromEra = _calculateEra(expirationStartBlock);
            fromSlot = _calculateSlot(expirationStartBlock);
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
                fromSlot = 3;
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
        uint256 blockNumberCache = block.number;
        uint256 _currentEra = _calculateEra(blockNumberCache);
        uint8 _currentSlot = _calculateSlot(blockNumberCache);
        _updateRetailBalance(address(0), to, value, 0  , _currentEra, 0, _currentSlot, TRANSCTION_TYPES.MINT) ;
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
            uint256 blockNumberCache = block.number;
            Slot storage slot = _retailBalances[to][toEra][toSlot];
            {
                slot.slotBalance += value;
                slot.blockBalances[blockNumberCache] += value;
                slot.blockIndexed.push(blockNumberCache);
            }
        } else  {
        // uint256 _startBlockInBufferSlot = _calcurateBlockNumber(era, slot);
        //    @TODO
        //    loop select nearly expire first 
        //    move to next slot if nearly expire slot not cover the value
        //    move to next block if block are zero balance
        //    if transfer equal or greater than slot balance move entrie slot {
        //    Slot storage sform  = retailBalances[from][fromEra][fromSlot];
        //    Slot storage sto = retailBalances[to][fromEra][fromSlot];
        //    sfrom.slotBalance -= value;
        //    sto.slotBalnce += value;
        //    sto.blockIndexed = sfrom.
        //    loop mapping
        //    if (txTypes == TRANSCTION_TYPES.DEFAULT) {
        //    _retailBalances[from][fromEra][fromSlot].slotBalance += value;
        //    _retailBalances[from][fromEra][fromSlot].blockBalances[blockNumber] += value;
        //    } 
           if (txTypes == TRANSCTION_TYPES.BURN) {
               // do nothing
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
    function transfer(
        address to,
        uint256 value
    ) public virtual override returns (bool) {
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

    /// @return uint256 amount of blocks per era.
    function blockPerEra() public view returns (uint256) {
        return _blockPerYear;
    }

    /// @return uint256 amount of blocks per slot.
    function blockPerSlot() public view returns (uint256) {
        return _blockPerYear / 4;
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
        if (_expirePeriod <= 4) {
            era = 0;
            slot = uint8(_expirePeriod);
        } else {
            era = uint8(_expirePeriod / 4);
            slot = uint8(_expirePeriod % 4);
        }
        return (era, slot);
    }

}