// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../abstracts/ERC20EXP.sol";

contract MockToken is ERC20Expirable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 blockTime_,
        uint8 slot_
    ) ERC20Expirable(_name, _symbol, block.number, blockTime_, slot_) {}
}
