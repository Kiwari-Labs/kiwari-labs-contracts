// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

interface IERC721EXPBase {
    /// @notice Checks if the token with the given `tokenId` has expired.
    /// @dev This function returns `true` if the token has passed its expiration period.
    /// @param tokenId The ID of the token to check for expiration.
    /// @return bool Returns `true` if the token has expired, otherwise `false`.
    function hasExpired(uint256 tokenId) external view returns (bool);
}
