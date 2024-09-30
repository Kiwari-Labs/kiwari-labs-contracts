// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/extensions/ERC20EXPNearestExpiryQuery.sol";

contract MockERC20EXPNearestExpiryQuery is ERC20EXPNearestExpiryQuery {
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blockTime_, frameSize_, slotSize_) {}

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function nearestExpireBalanceOf(address account) public view returns (uint256, uint256) {
        return _getNearestExpireBalanceOf(account);
    }
}
