// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.0 <0.9.0;

/// @title ERC20EXP Mint Quota extension contract
/// @author Kiwari Labs

import "../ERC20EXPBase.sol";

abstract contract ERC20EXPNearestExpiryQuery is ERC20EXPBase {
    /// @notice Retrieves the nearest unexpired block balance for a given account.
    /// @dev This function checks the block history for an account and finds the first unexpired block balance.
    /// It uses the `_blockNumberProvider` to get the current block number and looks up the account's block balances.
    /// @param account The address of the account whose unexpired block balance is being queried.
    /// @return balance The balance at the nearest unexpired block for the specified account.
    /// @return blockNumber The block number at which the nearest unexpired balance was found.
    function _getNearestExpireBalanceOf(address account) internal view returns (uint256, uint256) {
        uint256 blockNumberCache = _blockNumberProvider();
        uint256 blockLengthCache = _getFrameSizeInBlockLength();
        (uint256 fromEra, , uint8 fromSlot, ) = _safeFrame(blockNumberCache);
        Slot storage _account = _slotOf(account, fromEra, fromSlot);
        blockNumberCache = _locateUnexpiredBlockBalance(_account.list, blockNumberCache, blockLengthCache);
        if (blockNumberCache == 0) {
            return (0, 0);
        } else {
            return (_account.blockBalances[blockNumberCache], blockNumberCache + blockLengthCache);
        }
    }
}
