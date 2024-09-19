// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/extensions/ERC20EXPMintQuota.sol";

contract MockERC20EXPMintQuota is ERC20EXPMintQuota {
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blockTime_, frameSize_, slotSize_) {}

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