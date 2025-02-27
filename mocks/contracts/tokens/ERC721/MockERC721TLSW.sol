// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC721TLSW} from "../../../../contracts/tokens/ERC721/ERC721TLSW.sol";

contract MockERC721TLSW is ERC721TLSW {
    constructor(string memory _name, string memory _symbol) ERC721TLSW(_name, _symbol) {}

    function _pointerProvider() internal view override returns (uint256) {
        return block.timestamp;
    }

    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.TIME_BASED;
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
