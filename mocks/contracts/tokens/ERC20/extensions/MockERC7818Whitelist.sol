// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "../../../../../contracts/tokens/ERC20/extensions/ERC7818Whitelist.sol";

contract MockERC7818Whitelist is ERC7818Whitelist {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blockTime_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blockTime_, windowSize_, false) {}

    function addToWhitelist(address account) public {
        _addToWhitelist(account);
    }

    function removeFromWhitelist(address account) public {
        _removeFromWhitelist(account);
    }

    function transferUnspendable(address to, uint256 value) public {
        address sender = _msgSender();
        _updateUnspendableBalance(sender, to, value);
    }

    function safeBalanceOf(address account) public view returns (uint256) {
        return _unSafeBalanceOf(account, false);
    }

    function mintSpendableWhitelist(address to, uint256 value) public {
        _mintToWhitelist(to, value, true);
    }

    function mintUnspendableWhitelist(address to, uint256 value) public {
        _mintToWhitelist(to, value, false);
    }

    function burnSpendableWhitelist(address to, uint256 value) public {
        _burnFromWhitelist(to, value, true);
    }

    function burnUnspendableWhitelist(address to, uint256 value) public {
        _burnFromWhitelist(to, value, false);
    }
}
