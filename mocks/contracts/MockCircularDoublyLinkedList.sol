// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/libraries/SortedCircularDoublyLinkedList.sol";

contract MockCircularDoublyLinkedList {
    CircularDoublyLinkedList.List public _list;

    function exist(uint256 index) public view returns (bool) {
        return CircularDoublyLinkedList.exist(_list, index);
    }

    function insert(uint256 index, bytes memory data) public {
        CircularDoublyLinkedList.insert(_list, index, data);
    }

    function updateNodeData(uint256 index, bytes memory data) public {
        CircularDoublyLinkedList.updateNodeData(_list, index, data);
    }

    function remove(uint256 index) public {
        CircularDoublyLinkedList.remove(_list, index);
    }

    function size() public view returns (uint256) {
        return CircularDoublyLinkedList.size(_list);
    }

    function head() public view returns (uint256) {
        return CircularDoublyLinkedList.head(_list);
    }

    function middle() public view returns (uint256) {
        return CircularDoublyLinkedList.middle(_list);
    }

    function tail() public view returns (uint256) {
        return CircularDoublyLinkedList.tail(_list);
    }

    function node(uint256 index) public view returns (uint256 prev, bytes memory data, uint256 next) {
        return CircularDoublyLinkedList.node(_list, index);
    }

    function ascending() public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.ascending(_list);
    }

    function descending() public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.descending(_list);
    }

    function firstPartition() public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.firstPartition(_list);
    }

    function secondPartition() public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.secondPartition(_list);
    }

    function pathToTail(uint256 start) public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.pathToTail(_list, start);
    }

    function pathToHead(uint256 start) public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.pathToHead(_list, start);
    }

    function partition(uint256 start) public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.partition(_list, start);
    }
}
