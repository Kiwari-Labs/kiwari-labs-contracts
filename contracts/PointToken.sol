// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "./ERC20EXP.sol";

contract Point is ERC20Expirable {

    constructor() 
        ERC20UTXO("Example","EXP") 
        ERC20Expirable(4, 4) { 
    }
}