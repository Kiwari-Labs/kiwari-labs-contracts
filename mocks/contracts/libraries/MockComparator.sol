// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/utils/comparators/AddressComparator.sol";
import "../../../contracts/utils/comparators/BooleanOperation.sol";
import "../../../contracts/utils/comparators/IntComparator.sol";
import "../../../contracts/utils/comparators/TimeComparator.sol";
import "../../../contracts/utils/comparators/UintComparator.sol";

contract MockComparator {
    using AddressComparator for address;
    using BooleanOperation for bool;
    using IntComparator for int;
    using TimeComparator for uint256;
    using UintComparator for uint256;

    // AddressComparator
    function addressEqual(address x, address y) public pure returns (bool) {
        return x.equal(y);
    }

    function addressNotEqual(address x, address y) public pure returns (bool) {
        return x.notEqual(y);
    }

    function addressZero(address x) public pure returns (bool) {
        return x.isZeroAddress();
    }

    // BooleanOpearation
    function booleanAnd(bool x, bool y) public pure returns (bool) {
        return x.and(y);
    }

    function booleanOr(bool x, bool y) public pure returns (bool) {
        return x.or(y);
    }

    function booleanExclusiveOr(bool x, bool y) public pure returns (bool) {
        return x.exclusiveOr(y);
    }

    // IntComparator
    function intLessthan(int x, int y) public pure returns (bool) {
        return x.lessThan(y);
    }

    function intGreaterthan(int x, int y) public pure returns (bool) {
        return x.greaterThan(y);
    }

    function intGreaterThanOrEqual(int x, int y) public pure returns (bool) {
        return x.greaterThanOrEqual(y);
    }

    function intLessThanOrEqual(int x, int y) public pure returns (bool) {
        return x.lessThanOrEqual(y);
    }

    function intEqual(int x, int y) public pure returns (bool) {
        return x.equal(y);
    }

    function intNotEqual(int x, int y) public pure returns (bool) {
        return x.notEqual(y);
    }

    function intCompareTo(int x, int y) public pure returns (int) {
        return x.compareTo(y);
    }

    // TimeComparator
    function blockBeforeBlock(uint x, uint y) public pure returns (bool) {
        return x.beforeBlock(y);
    }
    function blockAfterBlock(uint x, uint y) public pure returns (bool) {
        return x.afterBlock(y);
    }
    function timestampBeforeTimestamp(uint x, uint y) public pure returns (bool) {
        return x.beforeTimestamp(y);
    }
    function timestampAfterTimestamp(uint x, uint y) public pure returns (bool) {
        return x.afterTimestamp(y);
    }
    function blockortimeCompareTo(uint x, uint y) public pure returns (int) {
        return x.blockOrTimeCompareTo(y);
    }

    // UintComparator
    function uintLessthan(uint x, uint y) public pure returns (bool) {
        return x.lessThan(y);
    }

    function uintGreaterthan(uint x, uint y) public pure returns (bool) {
        return x.greaterThan(y);
    }

    function uintGreaterThanOrEqual(uint x, uint y) public pure returns (bool) {
        return x.greaterThanOrEqual(y);
    }

    function uintLessThanOrEqual(uint x, uint y) public pure returns (bool) {
        return x.lessThanOrEqual(y);
    }

    function uintEqual(uint x, uint y) public pure returns (bool) {
        return x.equal(y);
    }

    function uintNotEqual(uint x, uint y) public pure returns (bool) {
        return x.notEqual(y);
    }

    function uintCompareTo(uint x, uint y) public pure returns (int) {
        return x.compareTo(y);
    }
}
