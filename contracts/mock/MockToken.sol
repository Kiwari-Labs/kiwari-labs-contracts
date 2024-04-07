// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "./ERC20EXP.sol";

contract MockToken is ERC20Expirable {

    constructor() 
        ERC20UTXO("Mock","Mock") 
        ERC20Expirable(4, 4) { 
    }
}