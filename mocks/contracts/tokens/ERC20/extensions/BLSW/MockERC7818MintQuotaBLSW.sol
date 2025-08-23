// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import {ERC7818MintQuota} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818MintQuota.sol";

contract MockERC7818MintQuotaBLSW is ERC20EXPBase, ERC7818MintQuota {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blocksPerEpoch_, windowSize_, false) {}

    function epochType() public pure virtual override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.number;
    }

    function mintWithQuota(address to, uint256 amount) public {
        _mintWithQuota(to, amount);
    }

    function setQuota(address minter, uint256 quota) public {
        _setQuota(minter, quota);
    }

    function increaseQuota(address minter, uint256 increase) public {
        _increaseQuota(minter, increase);
    }

    function decreaseQuota(address minter, uint256 decrease) public {
        _decreaseQuota(minter, decrease);
    }

    function addMinter(address minter, uint256 quota_) public {
        _addMinter(minter, quota_);
    }

    function removeMinter(address minter) public {
        _removeMinter(minter);
    }
}
