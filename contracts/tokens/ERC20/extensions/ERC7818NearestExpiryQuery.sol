// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ERC7818 Nearest Expiry Query
 * @author Kiwari Labs
 */

import {SlidingWindow} from "../../../utils/algorithms/SlidingWindow.sol";
import {ERC7818} from "../ERC7818.sol";

abstract contract ERC7818NearestExpiryQuery is ERC7818 {
    using SlidingWindow for SlidingWindow.Window;

    /**
     * @notice Retrieves the nearest expiry token for the specified account.
     * @param account The address of the account to query.
     * @return value The balance value associated with the nearest expiry.
     * @return estimateExpiry The estimated expiry timestamp or block number for the account's balance.
     */
    function getNearestExpiryOf(address account) public view returns (uint256 value, uint256 estimateExpiry) {
        uint256 temp = _pointerProvider();
        (uint256 fromEpoch, ) = _Window.indexRange(temp);
        uint256 duration = _Window.duration() * _Window.size();
        (temp, value) = _getValidKey(account, fromEpoch, temp, duration);
        if (temp != 0) {
            estimateExpiry = (temp + duration);
        }
    }
}
