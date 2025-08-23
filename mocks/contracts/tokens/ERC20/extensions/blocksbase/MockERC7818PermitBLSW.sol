// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC7818} from "../../../../../../contracts/tokens/ERC20/ERC7818.sol";
import {ERC7818Permit} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818Permit.sol";

contract MockERC7818PermitBLSW is ERC7818, ERC7818Permit {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 secondsPerEpoch_,
        uint8 windowSize_
    ) ERC7818(_name, _symbol, block.timestamp, secondsPerEpoch_, windowSize_, false) ERC7818Permit(_name) {}

    function epochType() public pure virtual override returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.number;
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }

    function transferFromWithPermit(address from, address to, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public {
        permit(from, to, value, deadline, v, r, s);
        transferFrom(from, to, value);
    }
}
