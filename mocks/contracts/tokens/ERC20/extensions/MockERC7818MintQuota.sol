// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "../../../../../contracts/tokens/ERC20/extensions/ERC7818MintQuota.sol";

contract MockERC7818MintQuota is ERC7818MintQuota {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blockTime_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blockTime_, windowSize_, false) {}

    function mintQuota(address to, uint256 amount) public {
        _mintQuota(to, amount);
    }

    function setQuota(address minter, uint256 quota) public {
        _setQuota(minter, quota);
    }

    function resetQuota(address minter) public {
        _resetQuota(minter);
    }
}
