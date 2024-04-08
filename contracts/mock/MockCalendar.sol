// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.14;

import "../abstracts/Calendar.sol";

contract MockCalendar is Calendar {
    constructor(uint16 blockTime_, uint8 period_) 
        Calendar(_blockNumberProvider(), blockTime_, period_) { 
    }
}