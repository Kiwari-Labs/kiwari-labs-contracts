// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @title ERC20EXP Interface
/// @author ERC20EXP <erc20exp@protonmail.com>

interface IERC20EXP {
    // ERC20-Expirable Specification

    // events
    event GrantWholeSale(address index, bool auth);

    // errors
    // error InvalidBlockPeriod();
    // error InvalidExpirePeriod();
    // error notWholeSale(address account);
    // error notRetail(address account);

    /// @dev overloading balanceOf function.
    // function balanceOf(
    //     address account,
    //     uint256 fromEra,
    //     uint8 fromSlot,
    //     uint256 toEra,
    //     uint8 toSlot
    // ) external returns (uint256);

    /// @dev overloading transfer function use for specific era and slot.
    // function transfer(
    //     address account,
    //     uint256 fromEra,
    //     uint8 fromSlot,
    //     uint256 toEra,
    //     uint8 toSlot
    // ) external returns (bool);

    /// @dev overloading transferFrom function use for specific era and slot.
    // function transferFrom(address account, uint256 fromEra, uint8 fromSlot, uint256 toEra, uint8 toSlot); // not implemented yet.
}
