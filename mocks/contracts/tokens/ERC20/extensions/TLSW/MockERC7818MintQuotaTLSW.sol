// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import {ERC20TLSW} from "../../../../../../contracts/tokens/ERC20/ERC20TLSW.sol";
import {ERC7818MintQuota} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818MintQuota.sol";

contract MockERC7818MintQuotaTLSW is ERC20TLSW, ERC7818MintQuota {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 secondsPerEpoch_,
        uint8 windowSize_
    ) ERC20TLSW(_name, _symbol, block.timestamp, secondsPerEpoch_, windowSize_, false) {}

    function _epochType() internal pure virtual override(ERC20EXPBase, ERC20TLSW) returns (EPOCH_TYPE) {
        return super._epochType();
    }

    function _getEpoch(uint256 pointer) internal view virtual override(ERC20EXPBase, ERC20TLSW) returns (uint256) {
        return super._getEpoch(pointer);
    }

    function _getWindowRage(
        uint256 pointer
    ) internal view virtual override(ERC20EXPBase, ERC20TLSW) returns (uint256 fromEpoch, uint256 toEpoch) {
        return super._getWindowRage(pointer);
    }

    function _getWindowSize() internal view virtual override(ERC20EXPBase, ERC20TLSW) returns (uint8) {
        return super._getWindowSize();
    }

    function _getPointersInEpoch() internal view virtual override(ERC20EXPBase, ERC20TLSW) returns (uint40) {
        return super._getPointersInEpoch();
    }

    function _getPointersInWindow() internal view virtual override(ERC20EXPBase, ERC20TLSW) returns (uint40) {
        return super._getPointersInWindow();
    }

    function _pointerProvider() internal view virtual override(ERC20EXPBase, ERC20TLSW) returns (uint256) {
        return super._pointerProvider();
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
