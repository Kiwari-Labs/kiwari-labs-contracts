// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";

contract MockERC20EXPBase is ERC20EXPBase {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blocksPerEpoch_, windowSize_, false) {}

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function mintToEpoch(uint256 epoch, address account, uint256 value) public {
        _mintToEpoch(epoch, account, value);
    }

    function burn(address from, uint256 value) public {
        _burn(from, value);
    }

    function burnFromEpoch(uint256 epoch, address account, uint256 value) public {
        _burnFromEpoch(epoch, account, value);
    }
}
