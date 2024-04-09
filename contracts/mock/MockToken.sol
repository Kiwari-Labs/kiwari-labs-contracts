// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "../abstracts/ERC20EXP.sol";

contract MockToken is ERC20Expirable {
    constructor() ERC20Expirable("MyToken", "MYT", 1000, 8) {}
}
