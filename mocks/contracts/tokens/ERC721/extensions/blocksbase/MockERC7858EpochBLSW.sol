// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC7858Epoch as ERC7858} from "../../../../../../contracts/tokens/ERC721/extensions/ERC7858Epoch.sol";

contract MockERC7858EpochBLSW is ERC7858 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint40 blocksPerEpoch_,
        uint8 windowSize_
    ) ERC7858(name_, symbol_, block.number, blocksPerEpoch_, windowSize_, false) {}

    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.BLOCKS_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.number;
    }

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
