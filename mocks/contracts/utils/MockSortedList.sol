// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.9.0;

import "../../../contracts/utils/datastructures/SortedList.sol";

contract MockSortedList {
    using SortedList for SortedList.List;

    SortedList.List public list;

    function contains(uint256 index) public view returns (bool) {
        return list.contains(index);
    }

    function next(uint256 index) public view returns (uint256) {
        return list.next(index);
    }

    function previous(uint256 index) public view returns (uint256) {
        return list.previous(index);
    }

    function insert(uint256 index) public {
        list.insert(index, false);
    }

    function insertLazy(uint256 index) public {
        list.insert(index, true);
    }

    // function updateNodeData(uint256 index, bytes memory data) public {
    //     list.updateNodeData(index, data);
    // }

    function shrink(uint256 index) public {
        list.shrink(index);
    }

    function remove(uint256 index) public {
        list.remove(index);
    }

    function size() public view returns (uint256) {
        return list.size();
    }

    function front() public view returns (uint256) {
        return list.front();
    }

    function back() public view returns (uint256) {
        return list.back();
    }
    
    function array() public view returns (uint256[] memory) {
        return list.toArray();
    }
}
