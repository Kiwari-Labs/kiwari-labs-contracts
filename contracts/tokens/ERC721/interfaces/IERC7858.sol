// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC-7858 modified to support block-based

interface IERC7858 {
    enum EXPIRY_TYPE {
        BLOCKS_BASED, // block.number
        TIME_BASED // block.timestamp
    }

    /**
     * @dev Emitted when the expiration date of a token is set or updated.
     * @param tokenId The identifier of the token ERC721 `tokenId`.
     * @param startTime The start time of the token (block number or timestamp based on `expiryType`).
     * @param endTime The end time of the token (block number or timestamp based on `expiryType`).
     */
    event TokenExpiryUpdated(uint256 indexed tokenId, uint256 indexed startTime, uint256 indexed endTime);

    error ERC7858InvalidTimeStamp(uint256 start, uint256 end);

    /**
     * @dev Returns the type of the expiry.
     * @return EXPIRY_TYPE  Enum value indicating the unit of an expiry.
     */
    function expiryType() external view returns (EXPIRY_TYPE);

    /**
     * @dev Checks whether a specific token is expired.
     * @param tokenId The identifier representing the tokenId.
     * @return bool True if the token is expired, false otherwise.
     */
    function isTokenExpired(uint256 tokenId) external view returns (bool);

    // inherit from ERC-5007 return depends on the type `block.timestamp` or `block.number`
    // {ERC-5007} return in uint64 MAY not suitable for `block.number` based.
    function startTime(uint256 tokenId) external view returns (uint256);
    function endTime(uint256 tokenId) external view returns (uint256);
}
