// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../../../contracts/tokens/ERC20/extensions/ERC20EXPWhitelist.sol";

contract MockERC20EXPWhitelist is ERC20EXPWhitelist {
    constructor(
        string memory _name,
        string memory _symbol,
        uint16 blockTime_,
        uint8 frameSize_,
        uint8 slotSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blockTime_, frameSize_, slotSize_) {}

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
