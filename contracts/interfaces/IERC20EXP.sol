// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.8.0;

/// @title ERC20EXP Interface
/// @author ERC20EXP <erc20exp@protonmail.com>

interface IERC20EXP {
    // ERC20-Expirable Specification
    // Struct
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

    // Events
    event BlockProducedPerYearUpdated(uint256 oldValue, uint256 newValue);
    event TokenExpiryPeriodUpdated(uint8 oldValue, uint8 newValue);
    event GrantWholeSale(address index, bool auth);

    // Errors
    // error InvalidBlockPeriod();
    // error InvalidExpirePeriod();
    // error notWholeSale(address account);
    // error notRetail(address account);

    /// @dev overloading balanceOf function.
    function balanceOf(
        address account,
        uint256 fromEra,
        uint8 fromSlot,
        uint256 toEra,
        uint8 toSlot
    ) external returns (uint256);

    /// @dev overloading transfer function use for specific era and slot.
    function transfer(
        address account,
        uint256 fromEra,
        uint8 fromSlot,
        uint256 toEra,
        uint8 toSlot
    ) external returns (bool);

    /// @dev overloading transferFrom function use for specific era and slot.
    // function transferFrom(address account, uint256 fromEra, uint8 fromSlot, uint256 toEra, uint8 toSlot); // not implemented yet.
}
