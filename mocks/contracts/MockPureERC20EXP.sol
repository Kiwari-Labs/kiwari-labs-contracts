// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/abstracts/PureERC20EXP.sol";

contract MockPureERC20EXP is ERC20Expirable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) ERC20Expirable(_name, _symbol, block.number, blockTime_, frameSize_, slotSize_) {}

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    // function burnRetail(address to, uint256 value) public {
    //     _burnRetail(to, value);
    // }

    // function mintSpentWholeSale(address to, uint256 value) public {
    //     _mintWholeSale(to, value, true);
    // }

    // function mintUnspentWholeSale(address to, uint256 value) public {
    //     _mintWholeSale(to, value, false);
    // }

    // function burnSpentWholeSale(address to, uint256 value) public {
    //     _burnWholeSale(to, value, true);
    // }

    // function burnUnspentWholeSale(address to, uint256 value) public {
    //     _burnWholeSale(to, value, false);
    // }
}
