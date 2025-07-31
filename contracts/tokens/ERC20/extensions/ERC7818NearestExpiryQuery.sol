// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC7818 Nearest Expiry Query
 * @author Kiwari Labs
 */

import {ERC20EXPBase} from "../ERC20EXPBase.sol";

abstract contract ERC7818NearestExpiryQuery is ERC20EXPBase {
    /**
     * @notice Retrieves the nearest expiry token for the specified account.
     * @param account The address of the account to query.
     * @return value The balance value associated with the nearest expiry.
     * @return estimateExpiry The estimated expiry timestamp or block number for the account's balance.
     */
    function getNearestExpiryOf(address account) public view returns (uint256 value, uint256 estimateExpiry) {
        uint256 pointer = _pointerProvider();
        (uint256 fromEpoch, ) = _getWindowRage(pointer);
        uint256 duration = _getPointersInWindow();
        (pointer, value) = _findValidBalance(account, fromEpoch, pointer, duration);
        if (pointer != 0) {
            estimateExpiry = (pointer + duration);
        }
    }
}
