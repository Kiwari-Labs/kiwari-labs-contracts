// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import "../../../contracts/tokens/ERC20/extensions/ERC20EXPBlacklist.sol";

contract MockERC20EXPBacklist is ERC20EXPBase, ERC20EXPBlacklist {
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

    function addToBlacklist(address account) public {
        _addToBlacklist(account);
    }

    function removeFromBlacklist(address account) public {
        _removeFromBlacklist(account);
    }

    function _mint(address account, uint256 value) internal virtual override(ERC20EXPBase, ERC20EXPBlacklist) {
        return super._mint(account, value);
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20EXPBase, ERC20EXPBlacklist) {
        return super._transfer(from, to, value);
    }
}
