// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20BLSW} from "../../../../../../contracts/tokens/ERC20/ERC20BLSW.sol";
import {ERC7818Whitelist} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818Whitelist.sol";

contract MockERC7818WhitelistBLSW is ERC20BLSW, ERC7818Whitelist {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blockTime_,
        uint8 windowSize_
    ) ERC20BLSW(_name, _symbol, block.number, blockTime_, windowSize_, false) {}

    function _epochType() internal pure virtual override(ERC20EXPBase, ERC20BLSW) returns (EPOCH_TYPE) {
        return super._epochType();
    }

    function _getEpoch(uint256 pointer) internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint256) {
        return super._getEpoch(pointer);
    }

    function _getWindowRage(
        uint256 pointer
    ) internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint256 fromEpoch, uint256 toEpoch) {
        return super._getWindowRage(pointer);
    }

    function _getWindowSize() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint8) {
        return super._getWindowSize();
    }

    function _getPointersInEpoch() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint40) {
        return super._getPointersInEpoch();
    }

    function _getPointersInWindow() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint40) {
        return super._getPointersInWindow();
    }

    function _pointerProvider() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint256) {
        return super._pointerProvider();
    }

    function balanceOf(address account) public view virtual override(IERC20, ERC20EXPBase, ERC7818Whitelist) returns (uint256) {
        return super.balanceOf(account);
    }

    function transfer(address to, uint256 value) public virtual override(IERC20, ERC20EXPBase, ERC7818Whitelist) returns (bool) {
        return super.transfer(to, value);
    }

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public virtual override(IERC20, ERC20EXPBase, ERC7818Whitelist) returns (bool) {
        return super.transferFrom(from, to, value);
    }

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
