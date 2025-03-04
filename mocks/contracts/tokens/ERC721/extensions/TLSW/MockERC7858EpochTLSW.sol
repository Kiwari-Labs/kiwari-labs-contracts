// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC7858EpochTLSW as ERC7858} from "../../../../../../contracts/tokens/ERC721/extensions/ERC7858EpochTLSW.sol";

contract MockERC7858EpochTLSW is ERC7858 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint40 secondsPerEpoch_,
        uint8 windowSize_
    ) ERC7858(name_, symbol_, block.timestamp, secondsPerEpoch_, windowSize_, false) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }

    function safeMint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }

    function safeMint(address to, uint256 tokenId, bytes memory data) public {
        _safeMint(to, tokenId, data);
    }
}
