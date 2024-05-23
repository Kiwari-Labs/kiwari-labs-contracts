// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../contracts/libraries/Engawa.sol";

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

    function guard() public view returns (uint256[2] memory) {
        return CircularDoublyLinkedList.guard(_list);
    }

    function node(uint256 index) public view returns (uint256 prev, bytes memory data, uint256 next) {
        return CircularDoublyLinkedList.node(_list, index);
    }

    function ascendingList() public view returns (uint256[] memory asd) {
        return CircularDoublyLinkedList.ascendingList(_list);
    }

    function descendingList() public view returns (uint256[] memory des) {
        return CircularDoublyLinkedList.descendingList(_list);
    }

    function firstParitionList() public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.firstParitionList(_list);
    }

    function secondPartitionList() public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.secondPartitionList(_list);
    }

    function partitionListGivenToLast(uint256 start) public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.partitionListGivenToLast(_list, start);
    }

    function partitionList(uint256 start) public view returns (uint256[] memory part) {
        return CircularDoublyLinkedList.partitionList(_list, start);
    }
}
