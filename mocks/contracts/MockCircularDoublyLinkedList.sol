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

    function node(uint256 index) public view returns (uint256[2] memory) {
        return CircularDoublyLinkedList.node(_list, index);
    }
}
