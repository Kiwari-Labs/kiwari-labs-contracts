// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "../../../../../contracts/tokens/ERC7818/extensions/ERC7818Whitelist.sol";

contract MockERC7818Whitelist is ERC7818Whitelist {
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) ERC7818(_name, _symbol, block.number, blockTime_, frameSize_, slotSize_) {}

    function grantWhitelist(address account) public {
        _grantWhitelist(account);
    }

    function revokeWhitelist(address account) public {
        _revokeWhitelist(account);
    }

    function transferUnspendable(address to, uint256 value) public {
        address sender = _msgSender();
        _updateUnspendableBalance(sender, to, value);
    }

    function safeBalanceOf(address account) public view returns (uint256) {
        return _unSafeBalanceOf(account, false);
    }

    function mintSpendableWhitelist(address to, uint256 value) public {
        _mintWhitelist(to, value, true);
    }

    function mintUnspendableWhitelist(address to, uint256 value) public {
        _mintWhitelist(to, value, false);
    }

    function burnSpendableWhitelist(address to, uint256 value) public {
        _burnWhitelist(to, value, true);
    }

    function burnUnspendableWhitelist(address to, uint256 value) public {
        _burnWhitelist(to, value, false);
    }
}
