// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import {ERC20TLSW} from "../../../../../../contracts/tokens/ERC20/ERC20TLSW.sol";
import {ERC7818Frozen} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818Frozen.sol";

contract MockERC7818FrozenTLSW is ERC20TLSW, ERC7818Frozen {
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

    function _update(address from, address to, uint256 value) internal virtual override(ERC20EXPBase, ERC7818Frozen) {
        super._update(from, to, value);
    }

    function _updateAtEpoch(uint256 epoch, address from, address to, uint256 value) internal virtual override(ERC20EXPBase, ERC7818Frozen) {
        super._updateAtEpoch(epoch, from, to, value);
    }

    function freeze(address account) public {
        _freeze(account);
    }

    function unfreeze(address account) public {
        _unfreeze(account);
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function burn(address to, uint256 value) public {
        _burn(to, value);
    }
}
