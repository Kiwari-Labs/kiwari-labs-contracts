// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import {ERC7858} from "../../../../contracts/tokens/ERC721/ERC7858.sol";

contract MockERC7858TLSW is ERC7858 {
    constructor(string memory _name, string memory _symbol) ERC7858(_name, _symbol) {}

    function expiryType() public pure override returns (EXPIRY_TYPE) {
        return EXPIRY_TYPE.TIME_BASED;
    }

    function _pointerProvider() internal view virtual override returns (uint256) {
        return block.timestamp;
    }

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
