// SPDX-License-Identifier: Apache-2.0

/// @title ERC-721 Time Extension
/// @author Anders (@0xanders), Lance (@LanceSnow), Shrug <shrug@emojidao.org>

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IERC5007 is IERC721 {

    error ERC5007TransferredInvalidToken();

    /// @param tokenId The id of the token.
    /// @dev Retrieve the start time of the NFT as a UNIX timestamp.
    /// @return uint64 Returns the start time in unix timestamp.
    function startTime(uint256 tokenId) external view returns (uint64);

    /// @param tokenId The id of the token.
    /// @dev Retrieve the end time of the NFT as a UNIX timestamp.
    /// @return uint64 Returns the end time in unix timestamp.
    function endTime(uint256 tokenId) external view returns (uint64);
}
