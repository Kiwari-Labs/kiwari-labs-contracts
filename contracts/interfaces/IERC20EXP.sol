// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

/// @title An Extendend version of ERC20 Interface for ERC20EXP
/// @author Kiwari Labs

interface IERC20EXP {
    event GrantWholeSale(address index, bool auth);

    /// @dev overloading balanceOf function specific era and slot.
    function balanceOf(
        address account,
        uint256 fromEra,
        uint8 fromSlot,
        uint256 toEra,
        uint8 toSlot
    ) external returns (uint256);

    /// @dev overloading balanceOf function specific unsafe or safe balance.
    // function balanceOf(address account, bool safe) external returns (uint256);

    /// @dev overloading transfer function for specific era and slot.
    // function transfer(
    //     address account,
    //     uint256 fromEra,
    //     uint8 fromSlot,
    //     uint256 toEra,
    //     uint8 toSlot
    // ) external returns (bool);

    /// @dev overloading transferFrom function for specific era and slot.
    // function transferFrom(
    //     address account,
    //     uint256 fromEra,
    //     uint8 fromSlot,
    //     uint256 toEra,
    //     uint8 toSlot
    // ) external returns (bool);
}
