// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC721BLSW} from "../../../../contracts/tokens/ERC721/ERC721BLSW.sol";

contract MockERC721BLSW is ERC721BLSW {
    constructor(string memory _name, string memory _symbol) ERC721BLSW(_name, _symbol) {}

    function _pointerProvider() internal view override returns (uint256) {
        return block.number;
    }

    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.BLOCKS_BASED;
    }

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }

    function updateTimeStamp(uint256 tokenId, uint256 start, uint256 end) public {
        _updateTimeStamp(tokenId, start, end);
    }
}
