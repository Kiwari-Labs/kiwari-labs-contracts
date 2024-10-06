// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import "../../contracts/abstracts/ERC20EXPBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Point is ERC20EXPBase, Ownable {
    uint8 private _decimals;

    constructor(
        address _owner,
        string memory _name,
        string memory _symbol,
        uint8 decimals_,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blockTime_, frameSize_, slotSize_) Ownable(_owner) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 value) public onlyOwner {
        _mint(to, value);
    }

    function burn(address from, uint256 value) public onlyOwner {
        _burn(from, value);
    }
}
