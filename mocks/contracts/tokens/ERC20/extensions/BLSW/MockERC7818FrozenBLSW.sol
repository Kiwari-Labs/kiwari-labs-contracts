// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import {ERC20BLSW} from "../../../../../../contracts/tokens/ERC20/ERC20BLSW.sol";
import {ERC7818Frozen} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818Frozen.sol";

contract MockERC7818FrozenBLSW is ERC20BLSW, ERC7818Frozen {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC20BLSW(_name, _symbol, block.number, blocksPerEpoch_, windowSize_, false) {}

    function epochType() public pure virtual override(ERC20EXPBase, ERC20BLSW) returns (EPOCH_TYPE) {
        return super.epochType();
    }

    function _pointerProvider() internal view virtual override(ERC20EXPBase, ERC20BLSW) returns (uint256) {
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
