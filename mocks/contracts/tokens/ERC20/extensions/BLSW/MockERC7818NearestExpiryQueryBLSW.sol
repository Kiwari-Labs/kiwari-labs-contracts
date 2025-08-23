// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC20EXPBase} from "../../../../../../contracts/tokens/ERC20/ERC20EXPBase.sol";
import {ERC7818NearestExpiryQuery} from "../../../../../../contracts/tokens/ERC20/extensions/ERC7818NearestExpiryQuery.sol";

contract MockERC7818NearestExpiryQueryBLSW is ERC20EXPBase, ERC7818NearestExpiryQuery {
    constructor(
        string memory _name,
        string memory _symbol,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC20EXPBase(_name, _symbol, block.number, blocksPerEpoch_, windowSize_, false) {}

    function epochType() public pure virtual override(ERC20EXPBase) returns (EPOCH_TYPE) {
        return EPOCH_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override(ERC20EXPBase) returns (uint256) {
        return block.number;
    }

    function mint(address to, uint256 value) public {
        _mint(to, value);
    }
}
