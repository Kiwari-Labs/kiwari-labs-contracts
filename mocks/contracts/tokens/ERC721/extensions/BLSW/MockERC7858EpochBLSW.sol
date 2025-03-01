// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC721EpochBLSW as ERC7858} from "../../../../../../contracts/tokens/ERC721/extensions/ERC721EpochBLSW.sol";

contract MockERC721BLSW is ERC7858 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC7858(name_, symbol_, block.number, blocksPerEpoch_, windowSize_, false) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}
