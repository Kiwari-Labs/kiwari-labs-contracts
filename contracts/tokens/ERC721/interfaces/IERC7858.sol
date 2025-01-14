// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC-7858 modified to support block-based

interface IERC7858 {
    enum EXPIRY_TYPE {
        BLOCKS_BASED, // block.number
        TIME_BASED // block.timestamp
    }

    /**
     * @dev Returns the type of the expiry.
     * @return EXPIRY_TYPE  Enum value indicating the unit of an expiry.
     */
    function expiryType() external view returns (EXPIRY_TYPE);

    /**
     * @dev Checks whether a specific token is expired.
     * @param Id The identifier representing the `tokenId` (ERC721).
     * @return bool True if the token is expired, false otherwise.
     */
    function isTokenValid(uint256 Id) external view returns (bool);

    // inherit from ERC-5007 return depends on the type `block.timestamp` or `block.number`
    // {ERC-5007} return in uint64 MAY not suitable for `block.number` based.
    function startTime(uint256 tokenId) external view returns (uint256);
    function endTime(uint256 tokenId) external view returns (uint256);
}
