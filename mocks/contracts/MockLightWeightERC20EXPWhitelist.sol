// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/extensions/LightWeightERC20EXPWhitelist.sol";

contract MockLightWeightERC20EXPWhitelist is ERC20EXPWhitelist {
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 blockTime_,
        uint8 slot_
    ) ERC20EXPWhitelist(_name, _symbol, block.number, blockTime_, slot_) {}

    function mintRetail(address to, uint256 value) public {
        _mintRetail(to, value);
    }

    function burnRetail(address to, uint256 value) public {
        _burnRetail(to, value);
    }

    function mintSpentWholeSale(address to, uint256 value) public {
        _mintWholeSale(to, value, true);
    }

    function mintUnspentWholeSale(address to, uint256 value) public {
        _mintWholeSale(to, value, false);
    }

    function burnSpentWholeSale(address to, uint256 value) public {
        _burnWholeSale(to, value, true);
    }

    function burnUnspentWholeSale(address to, uint256 value) public {
        _burnWholeSale(to, value, false);
    }
}
