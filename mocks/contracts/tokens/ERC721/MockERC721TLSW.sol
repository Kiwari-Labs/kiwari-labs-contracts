// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC721TLSW} from "../../../../contracts/tokens/ERC721/ERC721TLSW.sol";

contract MockERC721TLSW is ERC721TLSW {
    constructor(string memory _name, string memory _symbol) ERC721TLSW(_name, _symbol) {}

    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }

    function burn(uint256 tokenId) public {
        _clearTimeStamp(tokenId);
        _burn(tokenId);
    }

    function clearTimeStamp(uint256 tokenId) public {
        _clearTimeStamp(tokenId);
    }

    function updateTimeStamp(uint256 tokenId, uint256 start, uint256 end) public {
        _updateTimeStamp(tokenId, start, end);
    }
}
