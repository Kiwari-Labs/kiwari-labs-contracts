// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC7818} from "../../../../../../contracts/tokens/ERC20/ERC7818.sol";
import {ERC7818Blacklist} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818Blacklist.sol";

contract MockERC7818BlacklistBLSW is ERC7818, ERC7818Blacklist {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC7818(_name, _symbol, block.number, blocksPerEpoch_, windowSize_, false) {}

    function epochType() public pure virtual override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.number;
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC7818, ERC7818Blacklist) {
        super._update(from, to, value);
    }

    function _updateAtEpoch(uint256 epoch, address from, address to, uint256 value) internal virtual override(ERC7818, ERC7818Blacklist) {
        super._updateAtEpoch(epoch, from, to, value);
    }

    function addToBlacklist(address account) public {
        _addToBlacklist(account);
    }

    function removeFromBlacklist(address account) public {
        _removeFromBlacklist(account);
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function burn(address to, uint256 value) public {
        _burn(to, value);
    }
}
