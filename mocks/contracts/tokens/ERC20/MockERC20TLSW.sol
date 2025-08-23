// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";

contract MockERC20TLSW is ERC20EXPBase {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 secondsPerEpoch_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.timestamp, secondsPerEpoch_, windowSize_, false) {}

    function epochType() public pure virtual override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.TIME_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.timestamp;
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function burn(address from, uint256 value) public {
        _burn(from, value);
    }
}
