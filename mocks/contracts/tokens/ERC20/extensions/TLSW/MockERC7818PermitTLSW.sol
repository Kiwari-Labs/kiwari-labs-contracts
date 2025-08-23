// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import {ERC7818Permit} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818Permit.sol";

contract MockERC7818PermitTLSW is ERC20EXPBase, ERC7818Permit {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 secondsPerEpoch_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.timestamp, secondsPerEpoch_, windowSize_, false) ERC7818Permit(_name) {}

    function epochType() public pure virtual override(ERC20EXPBase) returns (EPOCH_TYPE) {
        return EPOCH_TYPE.TIME_BASED;
    }

    function _pointerProvider() internal view virtual override(ERC20EXPBase) returns (uint256) {
        return block.timestamp;
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function transferFromWithPermit(address from, address to, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
        permit(from, to, value, deadline, v, r, s);
        transferFrom(from, to, value);
    }
}
