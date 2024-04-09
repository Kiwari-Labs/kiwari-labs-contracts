// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

/// @author ERC20EXP <erc20exp@protonmail.com>

import "../interfaces/ICalendar.sol";

abstract contract Calendar is ICanlendar {
    // 49 bytes allocated for global variables
    uint8 private constant SLOT_PER_ERA = 8;
    uint8 private constant MINIMUM_EXPIRE_PERIOD_SLOT = 1;
    uint8 private constant MAXIMUM_EXPIRE_PERIOD_SLOT = 16;
    uint8 private constant MINIMUM_BLOCKTIME_IN_MILLI_SECONDS = 1; // 1 milliseconds.

    uint16 private constant MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS = 600_000; // 10 minutes.
    uint40 private constant YEAR_IN_MILLI_SECONDS = 31_556_926_000;

    uint8 private _expirePeriod;
    uint40 private _blockPerYear; // uint40 is enough cause it can fit wrost case 1 ms 31,556,926,000 block per year.

    uint256 private immutable _startBlockNumber;

    constructor(uint256 blockNumber_, uint16 blockTime_, uint8 expirePeriod_) {
        _startBlockNumber = blockNumber_;
        _updateBlockPerYear(blockTime_);
        _updateExpirePeriod(expirePeriod_);
    }

    /// @param blockTime description
    function _updateBlockPerYear(uint16 blockTime) internal {
        // @TODO uncomment
        // if (blockTime < MINIMUM_BLOCKTIME_IN_MILLI_SECONDS ||
        //         blockTime > MAXIMUM_BLOCKTIME_IN_MILLI_SECONDS) {
        //     revert InvalidBlockPeriod();
        // }
        uint40 blockPerYearCache = _blockPerYear;
        _blockPerYear = YEAR_IN_MILLI_SECONDS / blockTime;
        // @TODO uncomment
        // emit BlockProducedPerYearUpdated(blockPerYearCache, blockTime);
    }

    /// @param expirePeriod description
    function _updateExpirePeriod(uint8 expirePeriod) internal {
        // @TODO uncomment
        // if (expirePeriod < MINIMUM_EXPIRE_PERIOD_SLOT ||
        //         expirePeriod > MAXIMUM_EXPIRE_PERIOD_SLOT) {
        //     revert InvalidExpirePeriod();
        // }
        uint8 _expirePeriodCache = _expirePeriod;
        _expirePeriod = expirePeriod;
        // @TODO uncomment
        // emit ExpirationPeriodUpdated(periodCache, expirePeriod);
    }

    /// @notice If there is no start block defined or blockNumber is before the contract start, return 0 era.
    /// @dev calcuate era from given blockNumber.
    /// @param blockNumber description
    /// @return uint256 return era
    function _calculateEra(uint256 blockNumber) public view returns (uint256) {
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
    function _calculateSlot(uint256 blockNumber) internal view returns (uint8) {
        if (blockNumber > _startBlockNumber) {
            return uint8(((blockNumber - _startBlockNumber) % _blockPerYear) / (_blockPerYear / SLOT_PER_ERA));
        } else {
            return 0;
        }
    }

    function _calculateEraAndSlot(uint256 blockNumber) internal view returns (uint256 era, uint8 slot) {
        era = _calculateEra(blockNumber);
        slot = _calculateSlot(blockNumber);
        return (era, slot);
    }

    function _calculateBlockDifferent(uint256 blockNumber) internal view returns (uint64) {
        uint40 expirePeriodInBlockLength = expirationPeriodInBlockLength();
        if (blockNumber >= expirePeriodInBlockLength) {
            // If the current block is beyond the expiration period
            return blockNumber - expirePeriodInBlockLength;
        } else {
            // If the current block is within the expiration period
            return 0;
        }
    }

    function _calulateFromEraAndFromSlot(uint256 startBlock) internal view returns (uint256 fromEra, uint8 fromSlot) {
        // Determine the starting era and slot based on the expiration start block
        if (startBlock >= _blockPerYear) {
            (fromEra, fromSlot) = _calculateEraAndSlot(startBlock);
        } else {
            fromEra = 0;
            fromSlot = uint8(startBlock % _blockPerYear);
        }
        (fromEra, fromSlot) = _addingBuffer(fromEra, fromSlot);
        return (fromEra, fromSlot);
    }

    function _addingBuffer(uint256 era, uint8 slot) private view returns (uint256, uint8) {
        // Add buffer slot
        if (era != 0 && slot != 0) {
            if (slot > 0) {
                slot--;
            } else {
                era--;
                slot = 7;
            }
        }
        return (era, slot);
    }

    function _safePagination() public view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        uint256 blockNumberCache = blockNumberProvider();
        (toEra, toSlot) = _calculateEraAndSlot(blockNumberCache);
        // Calculate the starting block for the expiration period
        uint256 fromBlock = _calculateBlockDifferent(blockNumberCache);
        // Buffering for ensure
        (fromEra, fromSlot) = _calulateFromEraAndFromSlot(fromBlock);
        return (fromEra, toEra, fromSlot, toSlot);
    }

    function _blockNumberProvider() internal view virtual override returns (uint256) {
        return block.number;
    }

    function currentEra() public view override returns (uint256) {
        return _calculateEra(_blockNumberProvider());
    }

    function currentSlot() public view override returns (uint8) {
        return _calculateSlot(_blockNumberProvider());
    }

    function currentEraAndSlot() public view override returns (uint256 era, uint8 slot) {
        (era, slot) = _calculateEraAndSlot(_blockNumberProvider());
        return (era, slot);
    }

    function pagination() public view returns (uint256 fromEra, uint256 toEra, uint8 fromSlot, uint8 toSlot) {
        (fromEra, toEra, fromSlot, toSlot) = _safePagination();
        return (fromEra, toEra, fromSlot, toSlot);
    }

    /// @return uint40 amount of blocks per era.
    function blockPerEra() public view override returns (uint40) {
        return _blockPerYear;
    }

    /// @return uint40 amount of blocks per slot.
    function blockPerSlot() public view override returns (uint40) {
        return _blockPerYear / SLOT_PER_ERA;
    }

    function slotPerEra() view override pulbic returns (uint8) {
        return SLOT_PER_ERA;
    }

    /// @return uint40 length of blocks.
    function expirationPeriodInBlockLength() public view override returns (uint40) {
        return blockPerSlot() * _expirePeriod;
    }

    /// @return uint8 length of slot.
    function expirationPeriodInSlotLegth() public view override returns (uint8) {
        return _expirePeriod;
    }

    /// @return era cycle.
    /// @return slot of slot.
    function expirationPeriodInEraLength() public view override returns (uint8 era, uint8 slot) {
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
