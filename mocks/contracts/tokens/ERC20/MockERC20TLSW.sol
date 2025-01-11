// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20TLSW} from "../../../../contracts/tokens/ERC20/ERC20TLSW.sol";

contract MockERC20TLSW is ERC20TLSW {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 secondsPerEpoch_,
        uint8 windowSize_
    ) ERC20TLSW(_name, _symbol, block.timestamp, secondsPerEpoch_, windowSize_, false) {}

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function burn(address from, uint256 value) public {
        _burn(from, value);
    }
}
