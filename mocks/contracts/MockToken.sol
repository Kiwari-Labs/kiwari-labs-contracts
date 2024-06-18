// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/abstracts/ERC20EXPOp.sol";

contract MockToken is ERC20Expirable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 blockTime_,
        uint8 slot_
    ) ERC20Expirable(_name, _symbol, block.number, blockTime_, slot_) {}

    function mintRetail(address to, uint256 value) public {
        _mintRetail(to, value);
    }
}
