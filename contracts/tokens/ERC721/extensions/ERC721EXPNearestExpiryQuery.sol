// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC721EXP Nearest Expiry Query extension contract
/// @author Kiwari Labs

import "../ERC721EXPBase.sol";

abstract contract ERC721EXPNearestExpiryQuery is ERC721EXPBase {
    using SCDLL for SCDLL.List;

    /// @notice Retrieves the nearest unexpired tokenIds for a given account.
    /// @dev This function checks the block history for an account and finds the first unexpired block balance.
    /// It uses the `_blockNumberProvider` to get the current block number and looks up the account's block balances.
    /// @param account The address of the account whose unexpired block balance is being queried.
    /// @return tokenIds The array of tokenId at the nearest unexpired block for the specified account.
    /// @return blockNumber The block number at which the nearest unexpired balance was found.
    function _getNearestExpireBalanceOf(address account) internal view returns (uint256[] memory, uint256) {
        uint256 blockNumberCache = _blockNumberProvider();
        uint256 blockLengthCache = _getFrameSizeInBlockLength();
        (uint256 fromEra, , uint8 fromSlot, ) = _safeFrame(blockNumberCache);
        Slot storage _account = _slotOf(account, fromEra, fromSlot);
        uint256 blockNumberIndexCache = _account.list.head();
        uint256[] memory tokenIds;
        unchecked {
            while (blockNumberCache - blockNumberIndexCache >= blockLengthCache) {
                if (blockNumberCache == 0) {
                    break;
                }
                blockNumberCache = _account.list.next(blockNumberCache);
                // @TODO tokenIds
            }
        }
        return (tokenIds, blockNumberIndexCache + blockLengthCache);
    }
}
