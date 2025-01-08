// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "../../../../../contracts/tokens/ERC20/extensions/ERC7818Blacklist.sol";

contract MockERC7818Backlist is ERC7818Blacklist {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blockTime_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blockTime_, windowSize_, false) {}

    function addToBlacklist(address account) public {
        _addToBlacklist(account);
    }

    function removeFromBlacklist(address account) public {
        _removeFromBlacklist(account);
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC7818Blacklist) {
        super._update(from, to, value);
    }
}
