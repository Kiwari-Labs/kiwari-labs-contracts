// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC-5007 modified to support block-based

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC7858 is IERC721 {

    error ERC5007TransferredInvalidToken();

    /// @param tokenId The id of the token.
    /// @dev Retrieve the start time of the NFT as a block number.
    /// @return uint256 Returns the start time in block number.
    function startTime(uint256 tokenId) external view returns (uint256);

    /// @param tokenId The id of the token.
    /// @dev Retrieve the end time of the NFT as a block number.
    /// @return uint256 Returns the end time in block number.
    function endTime(uint256 tokenId) external view returns (uint256);

    function isTokenValid(uint256 tokenId) external view returns (bool);
}
