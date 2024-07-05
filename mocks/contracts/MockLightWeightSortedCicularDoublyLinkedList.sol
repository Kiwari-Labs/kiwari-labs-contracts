// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/libraries/LightWeightSortedCircularDoublyLinkedList.sol";

contract MockLightWeightSortedCircularDoublyLinkedList {
    using SortedCircularDoublyLinkedList for SortedCircularDoublyLinkedList.List;

    SortedCircularDoublyLinkedList.List public list;

    function exist(uint256 index) public view returns (bool) {
        return list.exist(index);
    }

    function next(uint256 index) public view returns (uint256) {
        return list.next(index);
    }

    function previous(uint256 index) public view returns (uint256) {
        return list.previous(index);
    }

    function insert(uint256 index) public {
        list.insert(index);
    }

    function shrink(uint256 index) public {
        list.shrink(index);
    }

    function remove(uint256 index) public {
        list.remove(index);
    }

    function size() public view returns (uint256) {
        return list.size();
    }

    function head() public view returns (uint256) {
        return list.head();
    }

    function middle() public view returns (uint256) {
        return list.middle();
    }

    function tail() public view returns (uint256) {
        return list.tail();
    }

    // solc-ignore-next-line shadowing
    function node(uint256 index) public view returns (uint256 prev, uint256 next) {
        return list.node(index);
    }

    function ascending() public view returns (uint256[] memory part) {
        return list.ascending();
    }

    function descending() public view returns (uint256[] memory part) {
        return list.descending();
    }

    function firstPartition() public view returns (uint256[] memory part) {
        return list.firstPartition();
    }

    function secondPartition() public view returns (uint256[] memory part) {
        return list.secondPartition();
    }

    function pathToTail(uint256 start) public view returns (uint256[] memory part) {
        return list.pathToTail(start);
    }

    function pathToHead(uint256 start) public view returns (uint256[] memory part) {
        return list.pathToHead(start);
    }

    function partition(uint256 start) public view returns (uint256[] memory part) {
        return list.partition(start);
    }
}
