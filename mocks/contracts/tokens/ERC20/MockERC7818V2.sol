// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC7818} from "../../../../contracts/tokens/ERC20/ERC7818.sol";

abstract contract MockERC7818V2 is ERC7818 {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC7818(_name, _symbol, block.number, windowSize_, blocksPerEpoch_) {}
}