// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../abstracts/ERC20EXP.sol";

contract MockToken is ERC20Expirable {

    constructor () ERC20Expirable("MyToken", "MYT", block.number, 5, 4) {}
}
