// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/libraries/LightWeightSortedCircularDoublyLinkedList.sol";

contract MockLightWeightSortedCircularDoublyLinkedList {
    SortedCircularDoublyLinkedList.List public list;

    function exist(uint256 index) public view returns (bool) {
        return SortedCircularDoublyLinkedList.exist(list, index);
    }

    function next(uint256 index) public view returns (uint256) {
        return SortedCircularDoublyLinkedList.next(list, index);
    }

    function previous(uint256 index) public view returns (uint256) {
        return SortedCircularDoublyLinkedList.previous(list, index);
    }

    function insert(uint256 index) public {
        SortedCircularDoublyLinkedList.insert(list, index);
    }

    function shrink(uint256 index) public {
        SortedCircularDoublyLinkedList.shrink(list, index);
    }

    function remove(uint256 index) public {
        SortedCircularDoublyLinkedList.remove(list, index);
    }

    function size() public view returns (uint256) {
        return SortedCircularDoublyLinkedList.size(list);
    }

    function head() public view returns (uint256) {
        return SortedCircularDoublyLinkedList.head(list);
    }

    function middle() public view returns (uint256) {
        return SortedCircularDoublyLinkedList.middle(list);
    }

    function tail() public view returns (uint256) {
        return SortedCircularDoublyLinkedList.tail(list);
    }

    // solc-ignore-next-line shadowing
    function node(uint256 index) public view returns (uint256 prev, uint256 next) {
        return SortedCircularDoublyLinkedList.node(list, index);
    }

    function ascending() public view returns (uint256[] memory part) {
        return SortedCircularDoublyLinkedList.ascending(list);
    }

    function descending() public view returns (uint256[] memory part) {
        return SortedCircularDoublyLinkedList.descending(list);
    }

    function firstPartition() public view returns (uint256[] memory part) {
        return SortedCircularDoublyLinkedList.firstPartition(list);
    }

    function secondPartition() public view returns (uint256[] memory part) {
        return SortedCircularDoublyLinkedList.secondPartition(list);
    }

    function pathToTail(uint256 start) public view returns (uint256[] memory part) {
        return SortedCircularDoublyLinkedList.pathToTail(list, start);
    }

    function pathToHead(uint256 start) public view returns (uint256[] memory part) {
        return SortedCircularDoublyLinkedList.pathToHead(list, start);
    }

    function partition(uint256 start) public view returns (uint256[] memory part) {
        return SortedCircularDoublyLinkedList.partition(list, start);
    }
}
